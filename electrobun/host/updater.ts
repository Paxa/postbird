import semver from "../../lib/semver";
import pkg from "../../package.json";
import type { UpdateCheckResponse, UpdateInstallResponse } from "./types";

export const RELEASES_API_URL = "https://api.github.com/repos/Paxa/postbird/releases";
export const RELEASES_PAGE_URL = "https://github.com/Paxa/postbird/releases";

export const APP_STORE_IDENTIFIER = "com.postbird.PostbirdApp";

export interface ElectrobunUpdaterLike {
  getLocalInfo(): Promise<{
    version: string;
    hash: string;
    baseUrl: string;
    channel: string;
    name: string;
    displayName?: string;
    identifier: string;
  }>;
  checkForUpdate(): Promise<{
    version: string;
    hash: string;
    updateAvailable: boolean;
    updateReady: boolean;
    error: string;
  }>;
  downloadUpdate(): Promise<void>;
  applyUpdate(): Promise<void>;
  updateInfo(): {
    version: string;
    hash: string;
    updateAvailable: boolean;
    updateReady: boolean;
    error: string;
  };
}

export interface UpdaterDependencies {
  updater?: ElectrobunUpdaterLike;
  fetchFn?: typeof fetch;
  currentVersion?: string;
  onBeforeApply?: () => Promise<void> | void;
}

async function fetchLatestGithubRelease(fetchFn: typeof fetch = fetch): Promise<{
  tag_name: string;
  published_at?: string;
  html_url?: string;
} | null> {
  try {
    const resp = await fetchFn(RELEASES_API_URL, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (Array.isArray(data)) {
      return data.find((rel: any) => !rel.prerelease && !rel.draft && rel.tag_name) || null;
    }
    return null;
  } catch (err) {
    console.error("[Host Updater] Error fetching GitHub releases:", err);
    return null;
  }
}

export function isStoreManaged(identifier?: string): boolean {
  return identifier === APP_STORE_IDENTIFIER;
}

export async function checkForUpdates(deps: UpdaterDependencies = {}): Promise<UpdateCheckResponse> {
  const { updater, fetchFn = fetch } = deps;
  let localVersion = deps.currentVersion || pkg.version || "0.9.1";
  let localChannel = "dev";
  let localBaseUrl = "";
  let localIdentifier = "";

  if (updater && typeof updater.getLocalInfo === "function") {
    try {
      const localInfo = await updater.getLocalInfo();
      if (localInfo?.version) localVersion = localInfo.version;
      if (localInfo?.channel) localChannel = localInfo.channel;
      if (localInfo?.baseUrl) localBaseUrl = localInfo.baseUrl;
      if (localInfo?.identifier) localIdentifier = localInfo.identifier;
    } catch {}
  }

  if (isStoreManaged(localIdentifier)) {
    return {
      currentVersion: localVersion,
      latestVersion: localVersion,
      updateAvailable: false,
      updateReady: false,
      canAutoUpdate: false,
      managedByStore: true,
      releasesPage: RELEASES_PAGE_URL,
    };
  }

  // Use Electrobun native Updater when running a packaged build with a configured baseUrl
  if (
    updater &&
    typeof updater.checkForUpdate === "function" &&
    localChannel !== "dev" &&
    Boolean(localBaseUrl)
  ) {
    try {
      const info = await updater.checkForUpdate();
      if (!info.error) {
        let publishedAt: string | undefined;
        let releasesPage = RELEASES_PAGE_URL;
        if (info.updateAvailable) {
          const ghRelease = await fetchLatestGithubRelease(fetchFn);
          if (ghRelease?.published_at) publishedAt = ghRelease.published_at;
          if (ghRelease?.html_url) releasesPage = ghRelease.html_url;
        }
        return {
          currentVersion: localVersion,
          latestVersion: info.version || localVersion,
          publishedAt,
          updateAvailable: Boolean(info.updateAvailable),
          updateReady: Boolean(info.updateReady),
          canAutoUpdate: true,
          releasesPage,
        };
      }
    } catch (err) {
      console.warn("[Host Updater] Native checkForUpdate failed, falling back to GitHub Releases API:", err);
    }
  }

  // Fallback to GitHub Releases API (e.g. in dev channel or when update.json is not on the release)
  const release = await fetchLatestGithubRelease(fetchFn);
  if (!release) {
    return {
      currentVersion: localVersion,
      latestVersion: localVersion,
      updateAvailable: false,
      updateReady: false,
      canAutoUpdate: false,
      releasesPage: RELEASES_PAGE_URL,
      error: "Failed to fetch release information from GitHub",
    };
  }

  const updateAvailable = semver.gt(release.tag_name, localVersion);
  return {
    currentVersion: localVersion,
    latestVersion: release.tag_name,
    publishedAt: release.published_at,
    updateAvailable,
    updateReady: false,
    canAutoUpdate: false,
    releasesPage: release.html_url || RELEASES_PAGE_URL,
  };
}

export async function installUpdate(deps: UpdaterDependencies = {}): Promise<UpdateInstallResponse> {
  const { updater, onBeforeApply } = deps;
  if (updater && typeof updater.getLocalInfo === "function") {
    try {
      const info = await updater.getLocalInfo();
      if (isStoreManaged(info?.identifier)) {
        return { success: false, applied: false, error: "Updates are managed by the App Store" };
      }
    } catch {}
  }
  if (!updater || typeof updater.downloadUpdate !== "function" || typeof updater.applyUpdate !== "function") {
    return {
      success: false,
      applied: false,
      fallbackUrl: RELEASES_PAGE_URL,
      error: "Native auto-updater is not available in this build",
    };
  }

  try {
    await updater.downloadUpdate();
    const stateAfterDownload = updater.updateInfo();
    if (stateAfterDownload.error || !stateAfterDownload.updateReady) {
      return {
        success: false,
        applied: false,
        fallbackUrl: RELEASES_PAGE_URL,
        error: stateAfterDownload.error || "Update bundle could not be prepared",
      };
    }

    if (onBeforeApply) {
      await onBeforeApply();
    }

    await updater.applyUpdate();
    const stateAfterApply = updater.updateInfo();
    if (stateAfterApply.error) {
      return {
        success: false,
        applied: false,
        fallbackUrl: RELEASES_PAGE_URL,
        error: stateAfterApply.error,
      };
    }

    return {
      success: true,
      applied: true,
    };
  } catch (err: any) {
    return {
      success: false,
      applied: false,
      fallbackUrl: RELEASES_PAGE_URL,
      error: err?.message || String(err),
    };
  }
}

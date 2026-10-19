import { plugin, build } from "bun";
import { resolve } from "path";

const root = resolve(__dirname, "..");

const shimPlugin = {
  name: "electrobun-shims",
  setup(buildConfig: any) {
    const shims: Record<string, string> = {
      "electron": resolve(root, "electrobun/shims/electron.js"),
      "@electron/remote": resolve(root, "electrobun/shims/remote.js"),
      "@electron/remote/main": resolve(root, "electrobun/shims/remote.js"),
      "is-electron-renderer": resolve(root, "electrobun/shims/is_renderer.js"),
      "@sentry/electron": resolve(root, "electrobun/shims/sentry.js"),
      "@sentry/integrations": resolve(root, "electrobun/shims/sentry.js"),
      "pg": resolve(root, "electrobun/shims/pg.js"),
      "fs": resolve(root, "electrobun/shims/fs.js"),
      "child_process": resolve(root, "electrobun/shims/child_process.js"),
      "node-ssh-forward": resolve(root, "electrobun/shims/child_process.js"),
      "net": resolve(root, "electrobun/shims/child_process.js"),
      "tls": resolve(root, "electrobun/shims/child_process.js"),
      "dns": resolve(root, "electrobun/shims/child_process.js"),
      "needle": resolve(root, "electrobun/shims/child_process.js"),
    };

    for (const [moduleName, shimPath] of Object.entries(shims)) {
      buildConfig.onResolve({ filter: new RegExp(`^${moduleName}$`) }, () => {
        return { path: shimPath };
      });
    }
  },
};

console.log("Bundling Postbird for Electrobun webview...");

const result = await build({
  entrypoints: [resolve(root, "electrobun/client.ts")],
  outdir: resolve(root, "public"),
  naming: "postbird-bundle.js",
  target: "browser",
  format: "iife",
  banner: 'console.log("[POSTBIRD BUNDLE] Loaded successfully! jQuery:", typeof window.jQuery);',
  plugins: [shimPlugin],
  define: {
    "process.platform": JSON.stringify("darwin"),
    "process.env.NODE_ENV": JSON.stringify("development"),
    "process.env.POSTBIRD_DEV": JSON.stringify("true"),
    "process.env.POSTBIRD_TEST_UI": JSON.stringify(process.env.POSTBIRD_TEST_UI || "false"),
    "global": "window",
  },
});

if (!result.success) {
  console.error("Bundle failed:", result.logs);
  process.exit(1);
}

console.log("Postbird webview bundle created successfully at public/postbird-bundle.js!");

/**
 * Postbird Dialog & Alert System
 * Native TypeScript dialogs providing macOS styled alerts, confirms, prompts, and error notifications.
 */

export interface DialogOptions {
  type?: "question" | "warning" | "error" | "info";
  detail?: string;
  button?: string;
  buttons?: string[];
  defaultId?: number;
}

export interface UserError {
  message: string;
  description?: string;
}

function getAlertify() {
  if (typeof window !== "undefined" && (window as any).alertify) {
    return (window as any).alertify;
  }
  if (typeof globalThis !== "undefined" && (globalThis as any).alertify) {
    return (globalThis as any).alertify;
  }
  return null;
}

function formatAlertHtml(message: string, detail?: string): string {
  const title = (message || "").replace(/\n/g, "<br>");
  const det = (detail || "").replace(/\n/g, "<br>");
  if (title && det) {
    return `<div class="macos-alert-title">${title}</div><div class="macos-alert-detail">${det}</div>`;
  }
  return `<div class="macos-alert-title">${title || det}</div>`;
}

/**
 * Display an informational or alert dialog.
 */
export async function alert(message: string, options: DialogOptions = {}): Promise<any> {
  const alertify = getAlertify();
  if (alertify) {
    return new Promise((resolve) => {
      const htmlMsg = formatAlertHtml(message, options.detail);
      const originalOk = alertify.labels?.ok;
      if (options.button && alertify.labels) {
        alertify.labels.ok = options.button;
      }

      alertify.alert(htmlMsg, () => {
        if (options.button && alertify.labels) alertify.labels.ok = originalOk;
        resolve({ response: 0 });
      });
    });
  }

  // Fallback to native window.alert
  const fullText = options.detail ? `${message}\n\n${options.detail}` : message;
  if (typeof window !== "undefined" && typeof window.alert === "function") {
    window.alert(fullText);
  }
  return { response: 0 };
}

/**
 * Display a confirmation modal with OK / Cancel buttons. Returns true if confirmed.
 */
export async function confirm(message: string, options: DialogOptions = {}): Promise<boolean> {
  const alertify = getAlertify();
  if (alertify) {
    return new Promise((resolve) => {
      const htmlMsg = formatAlertHtml(message, options.detail);
      const originalOk = alertify.labels?.ok;
      const originalCancel = alertify.labels?.cancel;

      if (options.button && alertify.labels) alertify.labels.ok = options.button;
      if (options.buttons && options.buttons[0] && alertify.labels) alertify.labels.ok = options.buttons[0];
      if (options.buttons && options.buttons[1] && alertify.labels) alertify.labels.cancel = options.buttons[1];

      alertify.confirm(htmlMsg, (confirmed: boolean) => {
        if (alertify.labels) {
          alertify.labels.ok = originalOk;
          alertify.labels.cancel = originalCancel;
        }
        resolve(Boolean(confirmed));
      });
    });
  }

  const fullText = options.detail ? `${message}\n\n${options.detail}` : message;
  if (typeof window !== "undefined" && typeof window.confirm === "function") {
    return window.confirm(fullText);
  }
  return true;
}

/**
 * Prompt user for text input. Returns string or null if cancelled.
 */
export async function prompt(message: string, filledValue: string | null = null): Promise<string | null> {
  const alertify = getAlertify();
  if (alertify && typeof alertify.prompt === "function") {
    return new Promise((resolve) => {
      alertify.prompt(
        message,
        (isConfirmed: boolean, val?: string) => {
          resolve(isConfirmed ? (val ?? "") : null);
        },
        filledValue
      );
    });
  }

  if (typeof window !== "undefined" && typeof window.prompt === "function") {
    return window.prompt(message, filledValue ?? "");
  }
  return null;
}

/**
 * Display a warning/error dialog for exceptions or user-facing errors.
 */
export async function alertError(errorOrMessage: string | UserError | Error | any, options: DialogOptions = {}): Promise<any> {
  options.type = "warning";
  let messageStr = "";

  if (errorOrMessage && typeof errorOrMessage === "object") {
    if (errorOrMessage.description) {
      options.detail = errorOrMessage.description;
    }
    messageStr = errorOrMessage.message || String(errorOrMessage);
  } else {
    messageStr = String(errorOrMessage);
  }

  return alert(messageStr, options);
}

/**
 * Display a SQL query execution error with hint, query, and message details.
 */
export async function alertSqlError(title: string, error: any): Promise<any> {
  if (!error) return alert(title, { type: "warning" });

  const sql = error.query ? `\nSQL: ${error.query}` : "";
  const hint = error.messageHint ? `\nHint: ${error.messageHint}` : "";
  const errMessage = error.message || String(error);

  const options: DialogOptions = {
    type: "warning",
    detail: errMessage + (hint || sql ? "\n" : "") + hint + sql
  };

  return alert(title, options);
}

/**
 * Open native system file selection dialog.
 */
export async function openFileDialog(fileExt: string | string[] = "sql"): Promise<string[]> {
  const rawExts = Array.isArray(fileExt) ? fileExt : [fileExt];
  const cleanExts = rawExts.map((e) => e.replace(/^\./, "")).filter(Boolean);
  const allowedFileTypes = cleanExts.length > 0 ? cleanExts.join(",") : "*";

  // Direct Electrobun RPC if in webview
  const rpc = typeof window !== "undefined" ? (window as any).__postbirdRpc : null;
  if (rpc && typeof rpc.openFileDialog === "function") {
    const res = await rpc.openFileDialog({
      title: "Open File",
      allowedFileTypes,
      filterPatterns: cleanExts.map((ext) => `*.${ext}`),
      canChooseFiles: true,
      canChooseDirectory: false,
      allowsMultipleSelection: false,
    });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.filePaths)) return res.filePaths;
    return [];
  }

  // Fallback to electronRemote shim if present
  try {
    const electronRemote = require("@electron/remote");
    if (electronRemote?.dialog?.showOpenDialog) {
      const mainWindow = electronRemote.app?.mainWindow;
      return new Promise((resolve) => {
        electronRemote.dialog.showOpenDialog(
          mainWindow,
          {
            properties: ["openFile"],
            filters: [{ name: "SQL Files", extensions: cleanExts }]
          },
          (files: string[]) => resolve(files || [])
        );
      });
    }
  } catch (e) {}

  return [];
}

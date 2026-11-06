import { ApplicationMenu, Utils } from "electrobun/main";

export function setupApplicationMenu(
  onQuit: () => Promise<void>,
  onMenuAction?: (action: string) => void
): void {
  ApplicationMenu.setApplicationMenu([
    {
      label: "Postbird",
      submenu: [
        { label: "About Postbird", action: "about-postbird" },
        { label: "Check For Updates...", action: "check-updates" },
        { type: "divider" },
        { label: "AI Connection Settings...", accelerator: "CmdOrCtrl+,", action: "ai-settings" },
        { type: "divider" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "showAll" },
        { type: "divider" },
        { label: "Quit Postbird", accelerator: "CmdOrCtrl+Q", action: "quit-app" },
      ],
    },
    {
      label: "File",
      submenu: [
        { label: "New Connection", accelerator: "CmdOrCtrl+T", action: "new-connection" },
        { label: "Import .sql file", accelerator: "CmdOrCtrl+O", action: "import-sql" },
        { label: "Reconnect", action: "reconnect" },
        { type: "divider" },
        { label: "Close Tab", accelerator: "CmdOrCtrl+W", action: "close-tab" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "divider" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "Database",
      submenu: [
        { label: "Show Connected Clients", action: "show-clients" },
        { type: "divider" },
        { label: "Create Database", action: "create-db" },
        { label: "Refresh Database", accelerator: "CmdOrCtrl+Shift+R", action: "refresh-db" },
        { label: "Refresh Databases List", action: "refresh-db-list" },
        { label: "Rename Database", action: "rename-db" },
        { label: "Export Database", action: "export-db" },
        { type: "divider" },
        { label: "Drop Database", action: "drop-db" },
      ],
    },
    {
      label: "Table",
      submenu: [
        { label: "Reload", accelerator: "CmdOrCtrl+R", action: "reload-table" },
      ],
    },
    {
      label: "View",
      submenu: [
        { label: "Toggle AI Assistant", accelerator: "CmdOrCtrl+K", action: "toggle-ai" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { label: "Console", accelerator: "CmdOrCtrl+L", action: "open-console" },
        { type: "divider" },
        { role: "minimize" },
        { role: "zoom" },
        { role: "bringAllToFront" },
      ],
    },
    {
      label: "Help",
      submenu: [
        { label: "Postbird Help", accelerator: "CmdOrCtrl+Shift+/", action: "postbird-help" },
        { label: "Postbird on GitHub", action: "open-github" },
        { label: "Send Feedback", action: "send-feedback" },
        { label: "PostgreSQL Documentation", action: "open-postgres-docs" },
      ],
    },
  ]);

  ApplicationMenu.on("application-menu-clicked", async (e: any) => {
    const action = e?.data?.action || e?.action;
    if (!action) return;

    if (action === "quit-app") {
      await onQuit();
      return;
    }
    if (action === "open-github") {
      Utils.openExternal("https://github.com/Paxa/postbird");
      return;
    }
    if (action === "send-feedback") {
      Utils.openExternal("https://github.com/Paxa/postbird/issues");
      return;
    }
    if (action === "open-postgres-docs") {
      Utils.openExternal("https://www.postgresql.org/docs/current/");
      return;
    }

    if (onMenuAction) {
      onMenuAction(action);
    }
  });
}

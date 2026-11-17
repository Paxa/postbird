export interface MenuOptions {
  // Direct and dev builds show "Check For Updates..."; the App Store build hides it.
  checkForUpdates?: boolean;
}

export function buildMenuTemplate(opts: MenuOptions = {}): any[] {
  const showUpdates = opts.checkForUpdates !== false;
  return [
    {
      label: "Postbird",
      submenu: [
        { label: "About Postbird", action: "about-postbird" },
        ...(showUpdates ? [{ label: "Check For Updates...", action: "check-updates" }] : []),
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
  ];
}

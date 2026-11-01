import { ApplicationMenu } from "electrobun/main";

export function setupApplicationMenu(onQuit: () => Promise<void>): void {
  ApplicationMenu.setApplicationMenu([
    {
      label: "Postbird",
      submenu: [
        { role: "about" },
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
        { role: "close" },
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
        { label: "Refresh Database", accelerator: "CmdOrCtrl+Shift+R", action: "refresh-db" },
        { label: "Create Database", action: "create-db" },
        { label: "Show Connected Clients", action: "show-clients" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        { role: "bringAllToFront" },
      ],
    },
    {
      label: "Help",
      submenu: [
        { label: "Postbird on GitHub", action: "open-github" },
        { label: "PostgreSQL Documentation", action: "open-postgres-docs" },
      ],
    },
  ]);

  ApplicationMenu.on("application-menu-clicked", async (e: any) => {
    console.log("[Menu Clicked]", e);
    if (e?.action === "quit-app") {
      await onQuit();
    }
  });
}

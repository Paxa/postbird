import { ApplicationMenu, Utils } from "electrobun/main";
import { buildMenuTemplate, type MenuOptions } from "./menu_template";

export function setupApplicationMenu(
  onQuit: () => Promise<void>,
  onMenuAction?: (action: string) => void,
  opts: MenuOptions = {}
): void {
  ApplicationMenu.setApplicationMenu(buildMenuTemplate(opts));

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

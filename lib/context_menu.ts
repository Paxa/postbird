/**
 * Postbird Context Menu Manager
 * Provides native context menus for UI elements and text inputs.
 */

export interface ContextMenuOptions {
  [label: string]: ((...args: any[]) => void) | string;
}

export interface ContextMenuParams {
  onShow?: (event: MouseEvent, menu: any) => void;
}

/**
 * Returns currently selected text in an input/textarea or the active window selection.
 */
export function getSelectedText(element?: HTMLElement | HTMLInputElement | HTMLTextAreaElement | null, targetWindow?: Window): string {
  const win = targetWindow || (typeof window !== "undefined" ? window : null);
  if (!win) return "";

  if (element && (element.tagName === "INPUT" || element.tagName === "TEXTAREA")) {
    const input = element as HTMLInputElement | HTMLTextAreaElement;
    if (typeof input.selectionStart === "number" && typeof input.selectionEnd === "number") {
      return input.value.substring(input.selectionStart, input.selectionEnd);
    }
  }

  const selection = win.getSelection();
  return selection ? selection.toString() : "";
}

/**
 * Checks whether a contextmenu event occurred inside the user's active text selection.
 */
export function isEventInsideSelection(event: MouseEvent, targetWindow?: Window): boolean {
  const win = targetWindow || (typeof window !== "undefined" ? window : null);
  if (!win) return false;

  const target = event.target as HTMLElement | null;
  if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
    const input = target as HTMLInputElement | HTMLTextAreaElement;
    if (typeof input.selectionStart === "number" && typeof input.selectionEnd === "number") {
      return input.selectionStart !== input.selectionEnd;
    }
  }

  const selection = win.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return false;
  }
  const text = selection.toString();
  if (!text || text.trim().length === 0) {
    return false;
  }

  if (!target) return false;

  try {
    const range = selection.getRangeAt(0);
    return range.intersectsNode(target);
  } catch {
    return false;
  }
}

/**
 * Attach a custom context menu to a DOM element.
 */
export function attachContextMenu(
  elementArg: HTMLElement | any,
  options: ContextMenuOptions,
  params?: ContextMenuParams
): void {
  const element: HTMLElement = elementArg instanceof HTMLElement ? elementArg : (elementArg && elementArg[0]);
  if (!element) return;

  element.addEventListener("contextmenu", (event: MouseEvent) => {
    let electronRemote: any = null;
    try {
      electronRemote = require("@electron/remote");
    } catch (e) {}

    if (!electronRemote) {
      return;
    }

    const win = element.ownerDocument?.defaultView || (typeof window !== "undefined" ? window : undefined);
    if (win && isEventInsideSelection(event, win)) {
      // Allow native OS system context menu for selected text (Copy, Look Up, Translate, Services)
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const Menu = electronRemote.Menu;
    const MenuItem = electronRemote.MenuItem;

    const elWithMenu = element as any;
    if (!elWithMenu.contextmenu) {
      const menu = (elWithMenu.contextmenu = new Menu());
      for (const n in options) {
        const opt = options[n];
        if (opt && typeof opt === "string") {
          if (opt === "separator") {
            menu.append(new MenuItem({ type: opt }));
          } else {
            menu.append(new MenuItem({ role: opt }));
          }
        } else {
          menu.append(new MenuItem({ label: n, click: opt }));
        }
      }
    }

    elWithMenu.contextmenu.clickEvent = event;

    if (params && params.onShow) {
      params.onShow(event, elWithMenu.contextmenu);
    }

    elWithMenu.contextmenu.popup({
      window: electronRemote.getCurrentWindow?.()
    });
  });
}

/**
 * Attach standard Cut/Copy/Paste context menu to text inputs and textareas.
 */
export function attachTextInputMenu(element: HTMLElement | HTMLInputElement | any, currentWindow?: Window): void {
  const el: HTMLElement = element instanceof HTMLElement ? element : (element && element[0]);
  if (!el) return;

  const inputEl = el as HTMLInputElement;
  if (inputEl.type === "checkbox" || inputEl.type === "radio") {
    return;
  }

  const onShow = (_event: MouseEvent, menu: any) => {
    const selected = getSelectedText(el, currentWindow);
    const hasSelection = Boolean(selected && selected.length > 0);

    if (menu && menu.items) {
      menu.items.forEach((item: any) => {
        if (item.label === "Cut" || item.label === "Copy") {
          item.enabled = hasSelection;
        } else {
          item.enabled = true;
        }
      });
    }
  };

  const win = currentWindow || (typeof window !== "undefined" ? window : null);

  attachContextMenu(
    el,
    {
      Cut: () => {
        win?.document.execCommand("cut");
      },
      Copy: () => {
        win?.document.execCommand("copy");
      },
      Paste: () => {
        win?.document.execCommand("paste");
      }
    },
    { onShow }
  );
}

/**
 * Attach standard read-only Copy context menu to an element.
 */
export function attachTextContextMenu(element: HTMLElement | any, currentWindow?: Window): void {
  const el: HTMLElement = element instanceof HTMLElement ? element : (element && element[0]);
  if (!el) return;

  const onShow = (_event: MouseEvent, menu: any) => {
    const selected = getSelectedText(el, currentWindow);
    const hasSelection = Boolean(selected && selected.length > 0);

    if (menu && menu.items) {
      menu.items.forEach((item: any) => {
        if (item.label === "Copy") {
          item.enabled = hasSelection;
        }
      });
    }
  };

  const win = currentWindow || (typeof window !== "undefined" ? window : null);

  attachContextMenu(
    el,
    {
      Copy: () => {
        win?.document.execCommand("copy");
      }
    },
    { onShow }
  );
}

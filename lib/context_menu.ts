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

export interface ContextMenuItemModel {
  type?: "normal" | "separator";
  label?: string;
  role?: string;
  enabled?: boolean;
  checked?: boolean;
  click?: (item: ContextMenuItemModel, win: any) => void;
}

const activeActionHandlers = new Map<string, () => void>();
let actionCounter = 0;

if (typeof window !== "undefined") {
  (window as any).__postbirdContextMenuAction = (actionId: string) => {
    const handler = activeActionHandlers.get(actionId);
    if (handler) {
      activeActionHandlers.clear();
      handler();
    }
  };
}

/**
 * Lightweight DOM fallback context menu for Linux (unsupported in Electrobun),
 * automated UI tests, and unit tests.
 */
export function showDomContextMenu(items: ContextMenuItemModel[], clickEvent?: MouseEvent): void {
  if (typeof document === "undefined") return;

  const existing = document.getElementById("postbird-context-menu-popup");
  if (existing) existing.remove();

  const e: any = clickEvent || (typeof window !== "undefined" ? (window as any).event : null);
  const x = e ? (e.clientX || e.pageX || 100) : 100;
  const y = e ? (e.clientY || e.pageY || 100) : 100;

  const isDark = Boolean(
    (document.body && document.body.classList.contains("dark-mode")) ||
    (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  const menuEl = document.createElement("div");
  menuEl.id = "postbird-context-menu-popup";
  menuEl.style.position = "fixed";
  menuEl.style.left = `${x}px`;
  menuEl.style.top = `${y}px`;
  menuEl.style.zIndex = "999999";
  menuEl.style.minWidth = "160px";
  menuEl.style.backgroundColor = isDark ? "rgba(44, 44, 46, 0.95)" : "rgba(255, 255, 255, 0.95)";
  menuEl.style.color = isDark ? "#f2f2f7" : "#1c1c1e";
  menuEl.style.border = isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.15)";
  menuEl.style.borderRadius = "8px";
  menuEl.style.boxShadow = isDark ? "0 10px 30px rgba(0, 0, 0, 0.5)" : "0 8px 24px rgba(0, 0, 0, 0.15)";
  menuEl.style.padding = "4px 0";
  menuEl.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  menuEl.style.fontSize = "13px";
  menuEl.style.userSelect = "none";
  menuEl.style.backdropFilter = "blur(20px)";
  (menuEl.style as any).webkitBackdropFilter = "blur(20px)";

  for (const item of items) {
    if (item.type === "separator") {
      const sep = document.createElement("div");
      sep.style.height = "1px";
      sep.style.margin = "4px 0";
      sep.style.backgroundColor = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)";
      menuEl.appendChild(sep);
      continue;
    }

    const itemEl = document.createElement("div");
    itemEl.textContent = item.label || item.role || "";
    itemEl.style.padding = "5px 14px";
    itemEl.style.cursor = item.enabled === false ? "default" : "pointer";
    itemEl.style.opacity = item.enabled === false ? "0.4" : "1";
    itemEl.style.borderRadius = "4px";
    itemEl.style.margin = "0 3px";

    if (item.enabled !== false) {
      itemEl.addEventListener("mouseenter", () => {
        itemEl.style.backgroundColor = "#007aff";
        itemEl.style.color = "#ffffff";
      });
      itemEl.addEventListener("mouseleave", () => {
        itemEl.style.backgroundColor = "transparent";
        itemEl.style.color = isDark ? "#f2f2f7" : "#1c1c1e";
      });
      itemEl.addEventListener("click", (ev) => {
        ev.stopPropagation();
        menuEl.remove();
        if (item.click) item.click(item, null);
      });
    }
    menuEl.appendChild(itemEl);
  }

  document.body.appendChild(menuEl);

  const rect = menuEl.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    menuEl.style.left = `${Math.max(10, window.innerWidth - rect.width - 10)}px`;
  }
  if (rect.bottom > window.innerHeight) {
    menuEl.style.top = `${Math.max(10, window.innerHeight - rect.height - 10)}px`;
  }

  const closeHandler = (ev: MouseEvent) => {
    if (!menuEl.contains(ev.target as Node)) {
      menuEl.remove();
      cleanup();
    }
  };
  const keyHandler = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") {
      menuEl.remove();
      cleanup();
    }
  };
  const cleanup = () => {
    document.removeEventListener("mousedown", closeHandler);
    document.removeEventListener("keydown", keyHandler);
  };
  setTimeout(() => {
    document.addEventListener("mousedown", closeHandler);
    document.addEventListener("keydown", keyHandler);
  }, 10);
}

function showNativeOrFallbackMenu(items: ContextMenuItemModel[], clickEvent?: MouseEvent): void {
  const rpc = typeof window !== "undefined" ? (window as any).__postbirdRpc : null;
  if (rpc && typeof rpc.showContextMenu === "function") {
    activeActionHandlers.clear();
    const serialized = items.map((item) => {
      if (item.type === "separator") {
        return { type: "separator" as const };
      }
      const actionId = `ctx_${++actionCounter}`;
      if (item.click) {
        activeActionHandlers.set(actionId, () => item.click!(item, null));
      }
      return {
        type: "normal" as const,
        label: item.label || "",
        ...(item.role && !item.click ? { role: item.role } : { action: actionId }),
        enabled: item.enabled !== false,
        checked: Boolean(item.checked),
      };
    });

    Promise.resolve(rpc.showContextMenu({ items: serialized }))
      .then((res: any) => {
        if (res && res.fallback) {
          activeActionHandlers.clear();
          showDomContextMenu(items, clickEvent);
        }
      })
      .catch(() => {
        activeActionHandlers.clear();
        showDomContextMenu(items, clickEvent);
      });
    return;
  }

  showDomContextMenu(items, clickEvent);
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

  const elWithMenu = element as any;
  if (elWithMenu.__postbirdContextMenuHandler) {
    element.removeEventListener("contextmenu", elWithMenu.__postbirdContextMenuHandler);
  }
  if (elWithMenu.__postbirdContextMenuMouseDownHandler) {
    element.removeEventListener("mousedown", elWithMenu.__postbirdContextMenuMouseDownHandler);
  }

  const mousedownHandler = (event: MouseEvent) => {
    if (event.button !== 2) return;
    const target = event.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
      return;
    }
    // Prevent WebKit from auto-selecting the word under the cursor on right-click
    event.preventDefault();
  };

  const handler = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!elWithMenu.contextmenu) {
      const items: ContextMenuItemModel[] = [];
      for (const n in options) {
        const opt = options[n];
        if (opt && typeof opt === "string") {
          if (opt === "separator") {
            items.push({ type: "separator" });
          } else {
            items.push({ role: opt, enabled: true });
          }
        } else {
          items.push({ label: n, click: opt as any, enabled: true });
        }
      }
      elWithMenu.contextmenu = {
        items,
        popup: () => showNativeOrFallbackMenu(elWithMenu.contextmenu.items, elWithMenu.contextmenu.clickEvent),
      };
    }

    elWithMenu.contextmenu.clickEvent = event;

    if (params && params.onShow) {
      params.onShow(event, elWithMenu.contextmenu);
    }

    showNativeOrFallbackMenu(elWithMenu.contextmenu.items, event);
  };

  elWithMenu.__postbirdContextMenuMouseDownHandler = mousedownHandler;
  elWithMenu.__postbirdContextMenuHandler = handler;
  element.addEventListener("mousedown", mousedownHandler);
  element.addEventListener("contextmenu", handler);
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

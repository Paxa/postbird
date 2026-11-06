import * as dom from "../lib/dom";
import * as dialogs from "../lib/dialogs";
import * as contextMenu from "../lib/context_menu";

// Re-export focused modules for modern modular imports
export { dom, dialogs, contextMenu };
export { stopEvent, $, $$, formValues, buildOption, listenClickOutside, makeDroppable, textareaAutoSize, debounce } from "../lib/dom";
export { alert, confirm, prompt, alertError, alertSqlError, openFileDialog } from "../lib/dialogs";
export { attachContextMenu, attachTextInputMenu, attachTextContextMenu, getSelectedText } from "../lib/context_menu";

// Legacy Electron variables for shims compatibility
try {
  (globalThis as any).electron = require('electron');
  (globalThis as any).electronRemote = require('@electron/remote');
  (globalThis as any).Menu = (globalThis as any).electronRemote?.Menu;
  (globalThis as any).MenuItem = (globalThis as any).electronRemote?.MenuItem;
} catch (e) {}

// Ensure $u is defined in ambient / test environments
(globalThis as any).dom = dom.dom;
(globalThis as any).htmlToElement = dom.htmlToElement;
(globalThis as any).buildOption = dom.buildOption;

if (typeof (globalThis as any).$u === "undefined" && typeof (window as any).$u !== "undefined") {
  (globalThis as any).$u = (window as any).$u;
}

// Attach modular implementations to legacy $u for seamless backward compatibility
if (typeof $u !== "undefined") {
  $u.formValues = dom.formValues;
  $u.stopEvent = dom.stopEvent;
  $u.buildOption = dom.buildOption;
  $u.debounce = dom.debounce;
  $u.textareaAutoSize = dom.textareaAutoSize;
  $u.makeDroppable = dom.makeDroppable;

  $u.listenClickOutside = (element: any, options: any, callback?: Function) => {
    let cb = typeof options === "function" ? options : callback;
    let opt = typeof options === "object" ? options : {};
    return dom.listenClickOutside(element, (reason) => {
      if (cb) cb(reason);
    }, opt);
  };

  $u.openFileDialog = dialogs.openFileDialog;
  $u.confirm = dialogs.confirm;
  $u.alert = dialogs.alert;
  $u.alertError = dialogs.alertError;
  $u.alertSqlError = dialogs.alertSqlError;
  $u.prompt = dialogs.prompt;

  $u.contextMenu = contextMenu.attachContextMenu;
  $u.textInputMenu = contextMenu.attachTextInputMenu;
  $u.textContextMenu = contextMenu.attachTextContextMenu;
  $u.selectedText = contextMenu.getSelectedText;

  // Template HTML to jQuery collection helper
  $u.html2collection = function html2collection(html: string) {
    const div = window.document.createElement("div");
    div.innerHTML = html;
    return $u(div).children();
  };

  // jQuery prototype extensions preserved for current Phase
  if ($u.fn) {
    $u.fn.forEach = function (callback: Function) {
      this.each((i: number, item: any) => {
        return callback(item, i);
      });
    };

    $u.fn.single_double_click = function single_double_click(single_click_callback: Function, double_click_callback: Function, timeout?: number) {
      return this.each(function (this: HTMLElement) {
        let clicks = 0;
        const self = this;
        $u(this).click(function (event: any) {
          clicks++;
          if (clicks === 1) {
            setTimeout(() => {
              if (clicks === 1) {
                single_click_callback.call(self, event);
              } else {
                double_click_callback.call(self, event);
              }
              clicks = 0;
            }, timeout || 200);
          }
        });
      });
    };

    $u.fn.single_double_click_nowait = function single_double_click_nowait(single_click_callback: Function, double_click_callback: Function, timeout?: number) {
      return this.each(function (this: HTMLElement) {
        let clicks = 0;
        const self = this;
        $u(this).click(function (event: any) {
          clicks++;
          if (clicks === 1) {
            if (typeof single_click_callback === "function") {
              single_click_callback.call(self, event);
            }
            setTimeout(() => {
              if (clicks === 2) {
                double_click_callback.call(self, event);
              }
              clicks = 0;
            }, timeout || 200);
          }
        });
      });
    };

    $u.fn.removeChildren = function removeChildren() {
      for (let i = 0; i < this.length; i++) {
        while (this[i].firstChild) {
          this[i].removeChild(this[i].firstChild);
        }
      }
      return this;
    };

    $u.fn.fasterAppend = function fasterAppend(nodes: any) {
      if (!this[0] || !nodes) return this;
      if (nodes.nodeType || nodes.tagName) {
        nodes = [nodes];
      }
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i]) {
          this[0].appendChild(nodes[i]);
        }
      }
      return this;
    };
  }
}

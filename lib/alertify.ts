/**
 * Postbird macOS Native-Styled Modal & Alert System
 * Built on MicroModal's accessible modal lifecycle & focus-trap architecture,
 * providing drop-in compatibility with Postbird's alertify & DialogBase APIs.
 */

interface DialogQueueItem {
  type: "alert" | "confirm" | "prompt";
  message: string;
  callback?: (ok: boolean, value?: string) => void;
  placeholder?: string;
  cssClass?: string;
  okLabel: string;
  cancelLabel: string;
}

interface MicroModalConfig {
  onShow?: (modal: HTMLElement | null, activeElement: Element | null, event?: Event) => void;
  onClose?: (modal: HTMLElement | null, activeElement: Element | null, event?: Event) => void;
  openTrigger?: string;
  closeTrigger?: string;
  openClass?: string;
  disableScroll?: boolean;
  disableFocus?: boolean;
  awaitCloseAnimation?: boolean;
  awaitOpenAnimation?: boolean;
}

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
  'select:not([disabled]):not([aria-hidden])',
  'textarea:not([disabled]):not([aria-hidden])',
  'button:not([disabled]):not([aria-hidden])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])',
].join(',');

const DESTRUCTIVE_LABELS = /^(delete|drop|remove|truncate|terminate|kill|clear|destroy)\b/i;

function getFocusableNodes(container: HTMLElement): HTMLElement[] {
  const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS));
  return nodes.filter((node) => node.offsetParent !== null && !node.classList.contains('alertify-resetFocus'));
}

function retainFocus(container: HTMLElement, event: KeyboardEvent) {
  const focusableNodes = getFocusableNodes(container);
  if (focusableNodes.length === 0) return;

  const focusedItemIndex = focusableNodes.indexOf(document.activeElement as HTMLElement);

  if (event.shiftKey && focusedItemIndex === 0) {
    focusableNodes[focusableNodes.length - 1].focus();
    event.preventDefault();
  } else if (!event.shiftKey && focusableNodes.length > 0 && focusedItemIndex === focusableNodes.length - 1) {
    focusableNodes[0].focus();
    event.preventDefault();
  }
}

class MacOSDialogController {
  labels = {
    ok: "OK",
    cancel: "Cancel",
  };
  delay = 5000;
  buttonReverse = false;
  buttonFocus: "ok" | "cancel" | "none" = "ok";

  private queue: DialogQueueItem[] = [];
  private isOpen = false;
  private activeTriggerElement: HTMLElement | null = null;
  private elCover: HTMLElement | null = null;
  private elDialog: HTMLElement | null = null;
  private elLog: HTMLElement | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private keyupHandler: ((e: KeyboardEvent) => void) | null = null;

  init(): void {
    const doc = window.document;
    if (!doc || !doc.body) return;

    this.elCover = doc.getElementById("alertify-cover");
    if (!this.elCover) {
      this.elCover = doc.createElement("div");
      this.elCover.id = "alertify-cover";
      this.elCover.className = "alertify-cover alertify-cover-hidden";
      this.elCover.setAttribute("data-micromodal-close", "true");
      doc.body.appendChild(this.elCover);
    }

    this.elDialog = doc.getElementById("alertify");
    if (!this.elDialog) {
      this.isOpen = false;
      this.queue = [];
      this.elDialog = doc.createElement("section");
      this.elDialog.id = "alertify";
      this.elDialog.className = "alertify alertify-hidden";
      this.elDialog.setAttribute("role", "dialog");
      this.elDialog.setAttribute("aria-modal", "true");
      this.elDialog.setAttribute("aria-hidden", "true");
      doc.body.appendChild(this.elDialog);
    }

    this.elLog = doc.getElementById("alertify-logs");
    if (!this.elLog) {
      this.elLog = doc.createElement("section");
      this.elLog.id = "alertify-logs";
      this.elLog.className = "alertify-logs alertify-logs-hidden";
      doc.body.appendChild(this.elLog);
    }
  }

  private buildMarkup(item: DialogQueueItem): string {
    const isCustomWindow = !!(item.cssClass && item.cssClass.includes("custom-window"));
    const isDestructive = DESTRUCTIVE_LABELS.test(item.okLabel.trim());
    const okBtnClass = `alertify-button alertify-button-ok${isDestructive ? " alertify-button-destructive" : ""}`;

    const btnCancelHtml = `<button type="button" class="alertify-button alertify-button-cancel" id="alertify-cancel" data-micromodal-close>${item.cancelLabel}</button>`;
    const btnOkHtml = `<button type="${item.type === "prompt" ? "submit" : "button"}" class="${okBtnClass}" id="alertify-ok">${item.okLabel}</button>`;

    const buttonsOrdered = this.buttonReverse
      ? btnOkHtml + btnCancelHtml
      : btnCancelHtml + btnOkHtml;

    let buttonsSection = "";
    if (!isCustomWindow) {
      if (item.type === "confirm" || item.type === "prompt") {
        buttonsSection = `<nav class="alertify-buttons">${buttonsOrdered}</nav>`;
      } else if (item.type === "alert") {
        buttonsSection = `<nav class="alertify-buttons">${btnOkHtml}</nav>`;
      }
    }

    const inputSection = item.type === "prompt"
      ? `<div class="alertify-text-wrapper"><input type="text" class="alertify-text" id="alertify-text" autocomplete="off" spellcheck="false" /></div>`
      : "";

    const messageWrapperTag = isCustomWindow ? "div" : "div";

    let html = `<div class="alertify-dialog">`;
    if (item.type === "prompt") html += `<div id="alertify-form">`;
    html += `<article class="alertify-inner">`;
    html += `<${messageWrapperTag} class="alertify-message">${item.message}</${messageWrapperTag}>`;
    html += inputSection;
    html += buttonsSection;
    html += `</article>`;
    if (item.type === "prompt") html += `</div>`;
    html += `</div>`;

    if (this.elDialog) {
      this.elDialog.className = `alertify alertify-${item.type}${item.cssClass ? " " + item.cssClass : ""}`;
      this.elDialog.style.marginLeft = "";
      this.elDialog.setAttribute("aria-hidden", "false");
    }
    if (this.elCover) {
      this.elCover.className = "alertify-cover";
    }

    return html;
  }

  private detachListeners(): void {
    if (this.keydownHandler) {
      document.removeEventListener("keydown", this.keydownHandler, true);
      this.keydownHandler = null;
    }
    if (this.keyupHandler) {
      document.body.removeEventListener("keyup", this.keyupHandler, false);
      this.keyupHandler = null;
    }
  }

  private focusInitialElement(input?: HTMLInputElement | null, btnOK?: HTMLElement | null, btnCancel?: HTMLElement | null): void {
    if (input) {
      input.focus();
      input.select();
      return;
    }
    if (this.buttonFocus === "cancel" && btnCancel) {
      btnCancel.focus();
    } else if (this.buttonFocus === "ok" && btnOK) {
      btnOK.focus();
    } else if (this.elDialog) {
      const focusable = getFocusableNodes(this.elDialog);
      if (focusable.length > 0) focusable[0].focus();
    }
  }

  private setupCurrentDialog(fromQueue = false): void {
    const item = this.queue[0];
    if (!item || !this.elDialog) return;

    this.isOpen = true;
    this.detachListeners();

    this.elDialog.innerHTML = this.buildMarkup(item);

    const btnOK = document.getElementById("alertify-ok") as HTMLButtonElement | null;
    const btnCancel = document.getElementById("alertify-cancel") as HTMLButtonElement | null;
    const input = document.getElementById("alertify-text") as HTMLInputElement | null;

    if (input && typeof item.placeholder === "string" && item.placeholder !== "") {
      input.value = item.placeholder;
    }

    const handleOk = (event?: Event) => {
      if (event && typeof event.preventDefault === "function") event.preventDefault();
      const val = input ? input.value : "";
      const cb = item.callback;
      this.hide();
      if (typeof cb === "function") {
        if (input) {
          cb(true, val);
        } else {
          cb(true);
        }
      }
    };

    const handleCancel = (event?: Event) => {
      if (event && typeof event.preventDefault === "function") event.preventDefault();
      const cb = item.callback;
      this.hide();
      if (typeof cb === "function") {
        cb(false);
      }
    };

    if (btnOK) btnOK.addEventListener("click", handleOk);
    if (btnCancel) btnCancel.addEventListener("click", handleCancel);

    this.keydownHandler = (event: KeyboardEvent) => {
      if (event.key === "Tab" && this.elDialog) {
        retainFocus(this.elDialog, event);
      }
    };
    document.addEventListener("keydown", this.keydownHandler, true);

    this.keyupHandler = (event: KeyboardEvent) => {
      if (!this.elDialog) return;
      const hasAnyInput = !!input || !!this.elDialog.querySelector("input, select, textarea");
      const keyCode = event.keyCode;
      if ((keyCode === 13 && btnOK) || (keyCode === 32 && !hasAnyInput && btnOK)) {
        handleOk(event);
      } else if (keyCode === 27) {
        if (btnCancel) {
          handleCancel(event);
        } else {
          const customCancelBtn = this.elDialog.querySelector<HTMLElement>(".alertify-dialog button.cancel");
          if (customCancelBtn) {
            customCancelBtn.click();
          } else if (btnOK && item.type === "alert" && !(item.cssClass && item.cssClass.includes("custom-window"))) {
            handleOk(event);
          }
        }
      }
    };
    document.body.addEventListener("keyup", this.keyupHandler, false);

    if (fromQueue) {
      this.focusInitialElement(input, btnOK, btnCancel);
    } else {
      requestAnimationFrame(() => {
        this.focusInitialElement(input, btnOK, btnCancel);
      });
    }
  }

  enqueueDialog(
    message: string,
    type: "alert" | "confirm" | "prompt",
    fn?: (ok: boolean, val?: string) => void,
    placeholder?: string,
    cssClass?: string
  ): this {
    if (typeof message !== "string") throw new Error("message must be a string");
    if (typeof type !== "string") throw new Error("type must be a string");
    if (typeof fn !== "undefined" && typeof fn !== "function") throw new Error("fn must be a function");

    this.activeTriggerElement = document.activeElement as HTMLElement | null;
    this.init();

    // Prevent duplicate dialogs with the identical message and type from piling up in the queue
    const isDuplicate = this.queue.some((q) => q.type === type && q.message === message);
    if (isDuplicate) {
      return this;
    }

    this.queue.push({
      type,
      message,
      callback: fn,
      placeholder,
      cssClass,
      okLabel: this.labels.ok || "OK",
      cancelLabel: this.labels.cancel || "Cancel",
    });

    if (!this.isOpen) {
      this.setupCurrentDialog();
    }

    return this;
  }

  hide(): void {
    if (!this.isOpen && this.queue.length === 0) return;
    this.detachListeners();
    this.queue.splice(0, 1);

    if (this.queue.length > 0) {
      this.setupCurrentDialog(true);
      return;
    }

    this.isOpen = false;
    if (this.elDialog) {
      this.elDialog.className = "alertify alertify-hide alertify-hidden";
      this.elDialog.setAttribute("aria-hidden", "true");
    }
    if (this.elCover) {
      this.elCover.className = "alertify-cover alertify-cover-hidden";
    }
    if (this.activeTriggerElement && typeof this.activeTriggerElement.focus === "function") {
      try {
        this.activeTriggerElement.focus();
      } catch (_) {}
    }
  }

  log(message: string, type?: string, wait?: number): this {
    this.init();
    if (!this.elLog) return this;

    this.elLog.className = "alertify-logs";
    const elem = document.createElement("article");
    elem.className = "alertify-log" + (typeof type === "string" && type !== "" ? " alertify-log-" + type : "");
    elem.innerHTML = message;
    this.elLog.appendChild(elem);

    setTimeout(() => {
      elem.className += " alertify-log-show";
    }, 20);

    const timer = wait !== undefined && !isNaN(wait) ? +wait : this.delay;
    const hideElement = () => {
      if (this.elLog && elem.parentNode === this.elLog) {
        elem.className += " alertify-log-hide";
        setTimeout(() => {
          if (this.elLog && elem.parentNode === this.elLog) {
            this.elLog.removeChild(elem);
            if (!this.elLog.hasChildNodes()) {
              this.elLog.className = "alertify-logs alertify-logs-hidden";
            }
          }
        }, 220);
      }
    };

    elem.addEventListener("click", hideElement);
    if (wait !== 0) {
      setTimeout(hideElement, timer);
    }
    return this;
  }

  extend(type: string) {
    if (typeof type !== "string") throw new Error("extend method must have exactly one parameter");
    return (message: string, wait?: number) => {
      this.log(message, type, wait);
      return this;
    };
  }

  set(args: Record<string, any>): void {
    if (typeof args !== "object" || Array.isArray(args)) throw new Error("args must be an object");
    for (const k of Object.keys(args)) {
      (this as any)[k] = args[k];
    }
  }
}

const controller = new MacOSDialogController();

const alertifyInstance: any = {
  alert(message: string, fn?: (ok?: boolean) => void, cssClass?: string) {
    controller.enqueueDialog(message, "alert", fn, "", cssClass);
    return this;
  },
  origConfirm(message: string, fn?: (ok: boolean) => void, cssClass?: string) {
    controller.enqueueDialog(message, "confirm", fn, "", cssClass);
    return this;
  },
  confirm(message: string, fn?: (ok: boolean) => void, cssClass?: string): Promise<boolean> {
    return new Promise((resolve) => {
      controller.enqueueDialog(
        message,
        "confirm",
        (res) => {
          resolve(res);
          if (fn) fn(res);
        },
        "",
        cssClass
      );
    });
  },
  origPrompt(message: string, fn?: (ok: boolean, val?: string) => void, placeholder?: string, cssClass?: string) {
    controller.enqueueDialog(message, "prompt", fn, placeholder, cssClass);
    return this;
  },
  prompt(message: string, fn?: (ok: boolean, val: string) => void, placeholder?: string, cssClass?: string): Promise<string | false> {
    return new Promise((resolve) => {
      controller.enqueueDialog(
        message,
        "prompt",
        (res, value = "") => {
          resolve(res ? value : false);
          if (fn) fn(res, value);
        },
        placeholder,
        cssClass
      );
    });
  },
  hide() {
    controller.hide();
  },
  log(message: string, type?: string, wait?: number) {
    controller.log(message, type, wait);
    return this;
  },
  success(message: string, wait?: number) {
    controller.log(message, "success", wait);
    return this;
  },
  error(message: string, wait?: number) {
    controller.log(message, "error", wait);
    return this;
  },
  extend(type: string) {
    return controller.extend(type);
  },
  init() {
    controller.init();
  },
  set(args: Record<string, any>) {
    controller.set(args);
  },
  labels: controller.labels,
  get delay() {
    return controller.delay;
  },
  set delay(val: number) {
    controller.delay = val;
  },
};

/**
 * MicroModal-compatible controller API for declarative or programmatic modals
 */
const MicroModal = {
  init(config: MicroModalConfig = {}) {
    controller.init();
    const openTrigger = config.openTrigger || "data-micromodal-trigger";
    document.addEventListener("click", (e) => {
      const target = (e.target as HTMLElement)?.closest?.(`[${openTrigger}]`) as HTMLElement | null;
      if (target) {
        const modalId = target.getAttribute(openTrigger);
        if (modalId) MicroModal.show(modalId, config);
      }
    });
  },
  show(targetModal: string | HTMLElement, config: MicroModalConfig = {}) {
    const modal = typeof targetModal === "string" ? document.getElementById(targetModal) : targetModal;
    if (!modal) return;
    const openClass = config.openClass || "is-open";
    modal.classList.add(openClass);
    modal.classList.remove("alertify-hidden", "alertify-hide");
    modal.setAttribute("aria-hidden", "false");
    if (config.onShow) config.onShow(modal, document.activeElement);
  },
  close(targetModal?: string | HTMLElement) {
    if (!targetModal || targetModal === "alertify") {
      controller.hide();
      return;
    }
    const modal = typeof targetModal === "string" ? document.getElementById(targetModal) : targetModal;
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  },
};

(globalThis as any).alertify = alertifyInstance;
(globalThis as any).MicroModal = MicroModal;
if (typeof window !== "undefined") {
  window.alertify = alertifyInstance;
  (window as any).MicroModal = MicroModal;
}

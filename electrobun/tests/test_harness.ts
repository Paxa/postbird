// @ts-nocheck

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export class TestHarness {
  results: TestResult[] = [];

  assert = (condition: any, message: string) => {
    if (!condition) throw new Error(message);
  };

  waitFor = async (fn: () => any, timeout = 7000, interval = 50): Promise<any> => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const res = fn();
        if (res) return res;
      } catch (e) {}
      await new Promise(r => setTimeout(r, interval));
    }
    throw new Error(`Timeout waiting for condition after ${timeout}ms`);
  };

  test = async (name: string, fn: () => Promise<void> | void) => {
    try {
      console.log(`[UI Test] Running: ${name}...`);
      await fn();
      console.log(`✓ [UI Test PASS]: ${name}`);
      this.results.push({ name, passed: true });
    } catch (err: any) {
      console.error(`✗ [UI Test FAIL]: ${name}:`, err.message || err);
      this.results.push({ name, passed: false, error: err.message || String(err) });
    }
  };

  fillInput = (target: string | HTMLElement, value: string): HTMLInputElement => {
    const el = (typeof target === 'string' ? document.querySelector(target) : target) as HTMLInputElement;
    if (!el) throw new Error(`fillInput: element not found for selector '${target}'`);
    el.focus();
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return el;
  };

  clickElement = (target: string | HTMLElement): HTMLElement => {
    const el = (typeof target === 'string' ? document.querySelector(target) : target) as HTMLElement;
    if (!el) throw new Error(`clickElement: element not found for selector '${target}'`);
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return el;
  };

  triggerShortcut = (key: string, modifiers: { meta?: boolean; ctrl?: boolean; shift?: boolean; alt?: boolean } = {}) => {
    const event = new KeyboardEvent('keydown', {
      key,
      metaKey: !!modifiers.meta,
      ctrlKey: !!modifiers.ctrl,
      shiftKey: !!modifiers.shift,
      altKey: !!modifiers.alt,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
    return event;
  };

  waitForDialog = async (dialogClass?: string, timeout = 5000): Promise<HTMLElement> => {
    return await this.waitFor(() => {
      const alertify = document.getElementById("alertify");
      if (alertify && !alertify.classList.contains("alertify-hidden") && !alertify.classList.contains("alertify-hide")) {
        if (!dialogClass) return alertify;
        const normalized = dialogClass.replace(/^\./, "");
        if (
          alertify.classList.contains(normalized) ||
          alertify.classList.contains(normalized + "-dialog") ||
          (normalized.endsWith("-dialog") && alertify.classList.contains(normalized.replace(/-dialog$/, ""))) ||
          alertify.querySelector(`.${normalized}`)
        ) {
          return alertify;
        }
      }

      const dialogs = document.querySelectorAll('.custom-dialog-window, .custom-modal, .dialog');
      if (dialogClass) {
        return Array.from(dialogs).find(d => d.classList.contains(dialogClass) || d.querySelector(`.${dialogClass}`));
      }
      return dialogs.length > 0 ? (dialogs[dialogs.length - 1] as HTMLElement) : null;
    }, timeout);
  };

  closeCurrentDialog = async () => {
    const alertifyCloseBtn = document.querySelector('#alertify button.cancel, #alertify #alertify-cancel, #alertify button.ok, #alertify #alertify-ok') as HTMLElement;
    const genericCloseBtn = document.querySelector('.custom-dialog-window .close, .custom-modal .cancel, .dialog-header-close') as HTMLElement;

    if (alertifyCloseBtn) {
      this.clickElement(alertifyCloseBtn);
    } else if (genericCloseBtn) {
      this.clickElement(genericCloseBtn);
    } else {
      this.triggerShortcut('Escape');
    }

    if (window.alertify && typeof window.alertify.hide === 'function') {
      window.alertify.hide();
    }
    await new Promise(r => setTimeout(r, 150));
  };
}

/**
 * Postbird Native DOM Utilities
 * Lightweight, zero-dependency DOM helper module replacing jQuery idioms.
 */

/**
 * Query a single matching element.
 */
export function $<T extends Element = HTMLElement>(selector: string, parent: any = document): T | null {
  if (!parent || typeof parent.querySelector !== "function") return null;
  return parent.querySelector(selector) as T | null;
}

/**
 * Query all matching elements as a native array.
 */
export function $$<T extends Element = HTMLElement>(selector: string, parent: any = document): T[] {
  if (!parent || typeof parent.querySelectorAll !== "function") return [];
  return Array.from(parent.querySelectorAll(selector)) as T[];
}

/**
 * Prevent default event action and stop bubbling.
 */
export function stopEvent(event?: Event | null): void {
  if (event) {
    if (typeof event.preventDefault === "function") event.preventDefault();
    if (typeof event.stopPropagation === "function") event.stopPropagation();
  }
}

/**
 * Convert HTML string to a single native HTMLElement.
 */
export function htmlToElement<T extends HTMLElement = HTMLElement>(html: string): T {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  const node = template.content.firstElementChild;
  if (!node) {
    const span = document.createElement("span");
    span.innerHTML = html;
    return span as unknown as T;
  }
  return node as T;
}

/**
 * Convert HTML string to an array of top-level HTMLElements.
 */
export function htmlToElements(html: string): HTMLElement[] {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return Array.from(template.content.children) as HTMLElement[];
}

/**
 * Extract form inputs into key-value pairs.
 */
export function formValues(formOrSelector: HTMLFormElement | string | any): Record<string, string> {
  const paramObj: Record<string, string> = {};

  let form: HTMLFormElement | null = null;
  if (typeof formOrSelector === "string") {
    form = document.querySelector<HTMLFormElement>(formOrSelector);
  } else if (formOrSelector instanceof HTMLFormElement) {
    form = formOrSelector;
  } else if (formOrSelector && formOrSelector[0] instanceof HTMLFormElement) {
    form = formOrSelector[0];
  } else if (formOrSelector && typeof formOrSelector.serializeArray === "function") {
    // jQuery fallback
    formOrSelector.serializeArray().forEach((kv: { name: string; value: string }) => {
      paramObj[kv.name] = kv.value;
    });
    return paramObj;
  }

  if (form) {
    const formData = new FormData(form);
    formData.forEach((value, key) => {
      paramObj[key] = typeof value === "string" ? value : value.name;
    });
  }

  return paramObj;
}

/**
 * Build a native HTMLOptionElement.
 */
export function buildOption(label: string, value?: string | any, options: Record<string, any> = {}): HTMLOptionElement {
  if (options === undefined && typeof value === "object") {
    options = value;
    value = label;
  }
  if (!options) options = {};
  if (value !== undefined) options.value = value;

  const opt = document.createElement("option");
  opt.textContent = label;
  if (options.value !== undefined) opt.value = String(options.value);
  for (const key of Object.keys(options)) {
    if (key !== "value") {
      opt.setAttribute(key, String(options[key]));
    }
  }
  return opt;
}

/**
 * Listen for clicks outside of an element or Escape key presses.
 */
export function listenClickOutside(
  elementArg: HTMLElement | any,
  callback: (reason: "click" | "escape") => void,
  options: { condition?: () => boolean } = {}
): () => void {
  const element: HTMLElement = elementArg instanceof HTMLElement ? elementArg : (elementArg && elementArg[0]);
  if (!element) return () => {};

  let active = true;

  const onBodyClick = (e: MouseEvent) => {
    if (!active) return;
    if (options.condition && !options.condition()) {
      cleanup();
      return;
    }

    const target = e.target as Node;
    if (target && (target === element || element.contains(target))) {
      return;
    }

    cleanup();
    callback("click");
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!active) return;
    if (e.key === "Escape" || e.keyCode === 27) {
      cleanup();
      callback("escape");
    }
  };

  const cleanup = () => {
    active = false;
    document.body.removeEventListener("click", onBodyClick);
    window.removeEventListener("keydown", onKeyDown);
  };

  setTimeout(() => {
    if (!active) return;
    document.body.addEventListener("click", onBodyClick);
    window.addEventListener("keydown", onKeyDown);
  }, 50);

  return cleanup;
}

/**
 * Set up drag and drop onto a target element with visual hover state.
 */
export function makeDroppable(targetArg: HTMLElement | any, callback: (path: string) => void): void {
  const holder: HTMLElement = targetArg instanceof HTMLElement ? targetArg : (targetArg && targetArg[0]);
  if (!holder) return;

  const onDragOver = (e: DragEvent) => {
    holder.classList.add("hover");
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  };

  const onDragLeave = (e: DragEvent) => {
    if (!e.relatedTarget || e.relatedTarget === document.documentElement) {
      holder.classList.remove("hover");
    }
  };

  const onDrop = async (e: DragEvent) => {
    holder.classList.remove("hover");
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer && e.dataTransfer.files) {
      for (let i = 0; i < e.dataTransfer.files.length; ++i) {
        const file = e.dataTransfer.files[i] as any;
        if (file.path) {
          callback(file.path);
        } else if (file.name) {
          try {
            const content = await file.text();
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
            const tempPath = `/tmp/postbird-drop-${Date.now()}-${safeName}`;
            const rpc = typeof window !== "undefined" ? (window as any).__postbirdRpc : null;
            if (rpc && typeof rpc.writeFile === "function") {
              await rpc.writeFile({ filePath: tempPath, content });
              callback(tempPath);
            }
          } catch (err) {
            console.error("[Drag & Drop Error]", err);
          }
        }
      }
    }
    return false;
  };

  window.addEventListener("dragenter", onDragOver);
  window.addEventListener("dragover", onDragOver);
  window.addEventListener("dragleave", onDragLeave);
  window.addEventListener("drop", onDrop);
}

/**
 * Automatically resize textarea to match scrollHeight.
 */
export function textareaAutoSize(element: HTMLTextAreaElement): void {
  if (!element) return;

  function resize(event?: Event) {
    const target = ((event && event.target) ? event.target : element) as HTMLTextAreaElement;
    if (!target) return;
    target.style.height = "auto";
    const computed = window.getComputedStyle(target);
    let borderHeight = 0;
    if (computed.boxSizing === "border-box") {
      borderHeight = (parseFloat(computed.borderTopWidth) || 0) + (parseFloat(computed.borderBottomWidth) || 0);
    }
    target.style.height = target.scrollHeight + borderHeight + "px";
  }

  function delayedResize(event: Event) {
    window.setTimeout(() => resize(event), 0);
  }

  element.addEventListener("input", delayedResize, false);
  element.addEventListener("change", resize, false);
  element.addEventListener("cut", delayedResize, false);
  element.addEventListener("paste", delayedResize, false);
  element.addEventListener("drop", delayedResize, false);
  element.addEventListener("keydown", delayedResize, false);

  resize();
}

/**
 * Distinguish single click from double click on an element.
 */
export function singleDoubleClick(
  element: HTMLElement,
  singleCb: (e: MouseEvent) => void,
  doubleCb: (e: MouseEvent) => void,
  timeout = 200
): () => void {
  let clicks = 0;
  let timer: any = null;

  const onClick = (e: MouseEvent) => {
    clicks++;
    if (clicks === 1) {
      timer = setTimeout(() => {
        if (clicks === 1) {
          singleCb(e);
        } else {
          doubleCb(e);
        }
        clicks = 0;
      }, timeout);
    }
  };

  element.addEventListener("click", onClick);

  return () => {
    if (timer) clearTimeout(timer);
    element.removeEventListener("click", onClick);
  };
}

/**
 * Standard debounce utility.
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let inDebounce: any;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(inDebounce);
    inDebounce = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Types and Declarative Tag Builder
 */
export type DomChild =
  | Node
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, any>
  | DomChild[];

export type TagFunction<T extends HTMLElement = HTMLElement> = (...args: DomChild[]) => T;

export type DomTags = {
  [K in keyof HTMLElementTagNameMap]: TagFunction<HTMLElementTagNameMap[K]>;
} & {
  [tag: string]: TagFunction<HTMLElement>;
};

/**
 * Create a native HTMLElement with flexible children and props.
 */
export function createDomElement<T extends HTMLElement = HTMLElement>(
  tagName: string,
  ...args: DomChild[]
): T {
  const doc = typeof document !== "undefined" ? document : (globalThis as any).document;
  const el = doc.createElement(tagName) as T;

  function appendChildNode(child: any) {
    if (child === null || child === undefined || child === false || child === true) {
      return;
    }
    if (Array.isArray(child)) {
      child.forEach(appendChildNode);
      return;
    }
    const isNode = typeof Node !== "undefined" ? child instanceof Node : Boolean(child && (child.nodeType || child.tagName));
    if (isNode) {
      el.appendChild(child);
      return;
    }
    if (typeof child === "object") {
      for (const [key, val] of Object.entries(child)) {
        if (val === undefined || val === null) continue;
        if (key.startsWith("on") && typeof val === "function") {
          const eventName = key.slice(2).toLowerCase();
          el.addEventListener(eventName, val as EventListener);
        } else if (key === "class" || key === "className") {
          el.className = String(val);
        } else if (key === "style" && typeof val === "object") {
          Object.assign(el.style, val);
        } else if (key === "dataset" && typeof val === "object") {
          Object.assign(el.dataset, val);
        } else if (key === "html" || key === "innerHTML") {
          el.innerHTML = String(val);
        } else if (key in el && typeof (el as any)[key] !== "function") {
          try {
            (el as any)[key] = val;
          } catch (e) {
            el.setAttribute(key, String(val));
          }
        } else {
          el.setAttribute(key, String(val));
        }
      }
      return;
    }
    el.appendChild(doc.createTextNode(String(child)));
  }

  args.forEach(appendChildNode);
  return el;
}

const tagCache = new Map<string, TagFunction>();

/**
 * Declarative DOM Tag Builder Proxy
 * Usage: dom.div({ class: 'error' }, dom.h4('Title'), dom.pre('Body'))
 */
export const dom: DomTags & {
  createElement: typeof createDomElement;
  [key: string]: any;
} = new Proxy(
  { createElement: createDomElement } as any,
  {
    get(target, prop: string) {
      if (prop in target) return target[prop];
      if (typeof prop === "string") {
        let fn = tagCache.get(prop);
        if (!fn) {
          fn = (...args: DomChild[]) => createDomElement(prop, ...args);
          tagCache.set(prop, fn);
        }
        return fn;
      }
      return undefined;
    }
  }
);

export const {
  div,
  span,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  a,
  button,
  input,
  textarea,
  select,
  option,
  ul,
  ol,
  li,
  table,
  thead,
  tbody,
  tr,
  th,
  td,
  code,
  pre,
  label,
  form,
} = dom;


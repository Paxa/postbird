import { describe, it, expect, beforeEach, mock } from "bun:test";
import "./test_helper";

// Setup minimal DOM environment for headless tests
class MockElement {
  public tagName: string;
  public id: string = "";
  public className: string = "";
  public classList: Set<string> = new Set();
  public children: MockElement[] = [];
  public parentElement: MockElement | null = null;
  public dataset: Record<string, string> = {};
  public attributes: Record<string, string> = {};
  public value: string = "";
  public name: string = "";
  public textContent: string = "";
  public selectionStart: number = 0;
  public selectionEnd: number = 0;
  public listeners: Record<string, Function[]> = {};

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  getAttribute(name: string) {
    return this.attributes[name] ?? null;
  }

  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }

  get firstElementChild() {
    return this.children[0] ?? null;
  }

  get content() {
    return { firstElementChild: this.firstElementChild, children: this.children };
  }

  set innerHTML(html: string) {
    this.children = [];
    const idMatches = [...html.matchAll(/id="([^"]+)"/g)];
    const classMatches = [...html.matchAll(/class="([^"]+)"/g)];
    const dataMatches = [...html.matchAll(/data-id="([^"]+)"/g)];

    const count = Math.max(idMatches.length, classMatches.length, dataMatches.length, 1);
    for (let i = 0; i < count; i++) {
      const child = new MockElement("DIV");
      if (idMatches[i]) child.id = idMatches[i][1];
      if (classMatches[i]) child.className = classMatches[i][1];
      if (dataMatches[i]) child.dataset.id = dataMatches[i][1];
      this.children.push(child);
    }
  }

  querySelector(sel: string): any {
    return this.querySelectorAll(sel)[0] ?? null;
  }

  querySelectorAll(sel: string): any[] {
    const results: any[] = [];
    const check = (el: MockElement) => {
      if (sel.startsWith(".") && el.className.includes(sel.slice(1))) results.push(el);
      else if (sel.startsWith("#") && el.id === sel.slice(1)) results.push(el);
      else if (el.tagName.toLowerCase() === sel.toLowerCase()) results.push(el);
      el.children.forEach(check);
    };
    this.children.forEach(check);
    return results;
  }

  addEventListener(type: string, fn: Function) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }

  removeEventListener(type: string, fn: Function) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((f) => f !== fn);
    }
  }

  appendChild(child: any) {
    if (typeof child === "string" || typeof child === "number") {
      this.textContent += String(child);
      const textNode = new MockElement("#text");
      textNode.textContent = String(child);
      this.children.push(textNode);
    } else if (child) {
      if (child.textContent) this.textContent += child.textContent;
      this.children.push(child);
    }
    return child;
  }

  click() {
    (this.listeners["click"] || []).forEach((fn) => fn({ target: this }));
  }
}

if (typeof (globalThis as any).document === "undefined") {
  (globalThis as any).document = {
    createElement: (tag: string) => new MockElement(tag),
    createTextNode: (str: string) => {
      const el = new MockElement("#text");
      el.textContent = str;
      return el;
    },
    body: new MockElement("BODY"),
    querySelector: (sel: string) => (globalThis as any).document.body.querySelector(sel),
    querySelectorAll: (sel: string) => (globalThis as any).document.body.querySelectorAll(sel),
  };
}

import * as dom from "../lib/dom";
import * as dialogs from "../lib/dialogs";
import * as contextMenu from "../lib/context_menu";

describe("lib/dom native DOM utilities", () => {
  it("$ and $$ correctly select single and multiple elements", () => {
    const container = new MockElement("DIV");
    const item1 = new MockElement("SPAN");
    item1.className = "item";
    item1.id = "first";
    const item2 = new MockElement("SPAN");
    item2.className = "item";
    item2.id = "second";

    container.children = [item1, item2];

    const single = dom.$<any>(".item", container as any);
    expect(single).not.toBeNull();
    expect(single?.id).toBe("first");

    const all = dom.$$<any>(".item", container as any);
    expect(all.length).toBe(2);
    expect(all.map((el) => el.id)).toEqual(["first", "second"]);
  });

  it("stopEvent prevents default and stops propagation", () => {
    let defaultPrevented = false;
    let propagationStopped = false;

    const fakeEvent = {
      preventDefault: () => { defaultPrevented = true; },
      stopPropagation: () => { propagationStopped = true; }
    } as unknown as Event;

    dom.stopEvent(fakeEvent);
    expect(defaultPrevented).toBe(true);
    expect(propagationStopped).toBe(true);
    expect(() => dom.stopEvent(null)).not.toThrow();
  });

  it("htmlToElement converts HTML string to single HTMLElement", () => {
    const el = dom.htmlToElement<any>('<div class="box" data-id="123">Hello</div>');
    expect(el).not.toBeNull();
    expect(el.dataset.id).toBe("123");
  });

  it("htmlToElements converts HTML string to multiple elements", () => {
    const elements = dom.htmlToElements('<li id="a">A</li><li id="b">B</li>');
    expect(elements.length).toBe(2);
    expect(elements.map((el) => el.id)).toEqual(["a", "b"]);
  });

  it("buildOption creates valid option element", () => {
    const opt = dom.buildOption("PostgreSQL 16", "pg16", { "data-version": "16.1" });
    expect(opt.tagName).toBe("OPTION");
    expect(opt.textContent).toBe("PostgreSQL 16");
    expect(opt.value).toBe("pg16");
    expect(opt.getAttribute("data-version")).toBe("16.1");
  });

  it("singleDoubleClick distinguishes single from double click", async () => {
    const btn = new MockElement("BUTTON");
    let singleClicks = 0;
    let doubleClicks = 0;

    const cleanup = dom.singleDoubleClick(
      btn as any,
      () => { singleClicks++; },
      () => { doubleClicks++; },
      40
    );

    btn.click();
    await new Promise((r) => setTimeout(r, 60));
    expect(singleClicks).toBe(1);
    expect(doubleClicks).toBe(0);

    btn.click();
    btn.click();
    await new Promise((r) => setTimeout(r, 60));
    expect(singleClicks).toBe(1);
    expect(doubleClicks).toBe(1);

    cleanup();
  });

  it("dom.<tag> declarative builders construct nested DOM trees with attributes and children", () => {
    const errorBox = dom.dom.div({ class: "error" },
      dom.dom.h4("Failed to query"),
      dom.dom.code(
        dom.dom.pre("SELECT * FROM non_existing;"),
        dom.dom.pre("table does not exist")
      )
    );

    expect(errorBox.tagName).toBe("DIV");
    expect(errorBox.className).toBe("error");
    expect(errorBox.children.length).toBe(2);
    expect(errorBox.children[0].tagName).toBe("H4");
    expect(errorBox.children[0].textContent).toBe("Failed to query");
    expect(errorBox.children[1].tagName).toBe("CODE");
    expect(errorBox.children[1].children.length).toBe(2);
    expect(errorBox.children[1].children[0].tagName).toBe("PRE");
    expect(errorBox.children[1].children[0].textContent).toBe("SELECT * FROM non_existing;");
  });

  it("debounce properly debounces calls", async () => {
    let callCount = 0;
    const fn = dom.debounce(() => { callCount++; }, 30);

    fn();
    fn();
    fn();
    expect(callCount).toBe(0);

    await new Promise((r) => setTimeout(r, 60));
    expect(callCount).toBe(1);
  });
});

describe("lib/dialogs native dialog system", () => {
  it("alert uses alertify or window fallback", async () => {
    const mockAlert = mock((msg, cb) => {
      expect(msg).toContain("Database Connection Error");
      cb();
    });

    (window as any).alertify = {
      alert: mockAlert,
      labels: { ok: "OK", cancel: "Cancel" }
    };

    const res = await dialogs.alert("Database Connection Error", { detail: "Failed to connect to host" });
    expect(res).toEqual({ response: 0 });
    expect(mockAlert).toHaveBeenCalledTimes(1);
  });

  it("confirm returns true on positive confirmation", async () => {
    const mockConfirm = mock((msg, cb) => {
      expect(msg).toContain("Drop Database?");
      cb(true);
    });

    (window as any).alertify = {
      confirm: mockConfirm,
      labels: { ok: "OK", cancel: "Cancel" }
    };

    const confirmed = await dialogs.confirm("Drop Database?", { button: "Drop" });
    expect(confirmed).toBe(true);
    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  it("prompt resolves user entered string", async () => {
    const mockPrompt = mock((msg, cb, initial) => {
      expect(msg).toBe("New database name:");
      expect(initial).toBe("my_db");
      cb(true, "renamed_db");
    });

    (window as any).alertify = {
      prompt: mockPrompt,
      labels: { ok: "OK", cancel: "Cancel" }
    };

    const val = await dialogs.prompt("New database name:", "my_db");
    expect(val).toBe("renamed_db");
  });

  it("alertSqlError formats query and hint properly", async () => {
    let capturedMsg = "";
    (window as any).alertify = {
      alert: (html: string, cb: () => void) => {
        capturedMsg = html;
        cb();
      },
      labels: { ok: "OK" }
    };

    await dialogs.alertSqlError("Query Failed", {
      message: "relation \"users\" does not exist",
      query: "SELECT * FROM users;",
      messageHint: "Create table users first"
    });

    expect(capturedMsg).toContain("Query Failed");
    expect(capturedMsg).toContain("relation \"users\" does not exist");
    expect(capturedMsg).toContain("SELECT * FROM users;");
  });
});

describe("lib/context_menu", () => {
  it("getSelectedText extracts text from input or document selection", () => {
    const input = new MockElement("INPUT") as any;
    input.value = "Postbird SQL Client";
    input.selectionStart = 9;
    input.selectionEnd = 12;

    const selected = contextMenu.getSelectedText(input);
    expect(selected).toBe("SQL");
  });
});

require("./base");
var dom: typeof import("../../../lib/dom") = require("../../../lib/dom");
var stopEvent = dom.stopEvent;

interface JsonViewerParams {
  title?: string;
  dialogClass?: string;
  fieldName: string;
  fieldType?: any;
  value: any;
  readOnly?: boolean;
  onSave?: (newValue: string | null, isNull: boolean) => Promise<void> | void;
}

class JsonViewer extends DialogBase {
  fieldName: string;
  fieldType: any;
  value: any;
  readOnly: boolean;
  onSave: ((newValue: string | null, isNull: boolean) => Promise<void> | void) | null;
  mode: "tree" | "code";
  currentParsedValue: any;
  editor: any;
  searchQuery: string;
  selectedPath: string;

  constructor(handler: any, params: JsonViewerParams) {
    const isReadOnly = Boolean(params.readOnly);
    const title = params.title || (isReadOnly ? `View JSON: ${params.fieldName}` : `Edit JSON: ${params.fieldName}`);
    super(handler, {
      ...params,
      title: title,
      dialogClass: "json-viewer-dialog custom-window"
    });

    this.fieldName = params.fieldName;
    this.fieldType = params.fieldType || { data_type: "json", udt_name: "json" };
    this.value = params.value;
    this.readOnly = isReadOnly;
    this.onSave = params.onSave || null;
    this.mode = "tree";
    this.searchQuery = "";
    this.selectedPath = "$";

    this.currentParsedValue = this.parseInitialValue(params.value);
    this.showWindow();
  }

  getRoot(): HTMLElement | null {
    if (this.content && this.content[0] && typeof (this.content[0] as any).querySelector === "function") {
      return this.content[0] as HTMLElement;
    }
    return (
      document.querySelector("#alertify .alertify-inner") ||
      document.querySelector(".json-viewer-container")
    );
  }

  parseInitialValue(raw: any): any {
    if (raw === null || raw === undefined) {
      return null;
    }
    if (typeof raw === "object") {
      return raw;
    }
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
        try {
          return JSON.parse(raw);
        } catch (e) {
          return raw;
        }
      }
      return raw;
    }
    return raw;
  }

  showWindow() {
    const nodes = App.renderView("dialogs/json_viewer", {
      fieldName: this.fieldName,
      fieldType: this.fieldType,
      value: this.currentParsedValue,
      readOnly: this.readOnly
    });

    this.content = this.renderWindow(this.title, nodes);
    this.bindEvents();
    this.renderTree();
  }

  bindEvents() {
    const root = this.getRoot();
    if (!root) return;

    // Mode Switcher (Tree vs Code)
    dom.$$<HTMLButtonElement>(".btn-mode", root).forEach(btn => {
      btn.addEventListener("click", (e) => {
        stopEvent(e);
        const targetMode = btn.getAttribute("data-mode") as "tree" | "code";
        if (targetMode && targetMode !== this.mode) {
          this.switchMode(targetMode);
        }
      });
    });

    // Search Filter
    const searchInput = dom.$<HTMLInputElement>(".json-search-input", root);
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        this.searchQuery = searchInput.value.trim().toLowerCase();
        this.renderTree();
      });
    }

    // Tree Expand / Collapse All
    const btnExpand = dom.$<HTMLButtonElement>(".btn-expand-all", root);
    if (btnExpand) {
      btnExpand.addEventListener("click", (e) => {
        stopEvent(e);
        this.expandAllTreeNodes(true);
      });
    }

    const btnCollapse = dom.$<HTMLButtonElement>(".btn-collapse-all", root);
    if (btnCollapse) {
      btnCollapse.addEventListener("click", (e) => {
        stopEvent(e);
        this.expandAllTreeNodes(false);
      });
    }

    // Code Format / Minify
    const btnPrettify = dom.$<HTMLButtonElement>(".btn-code-prettify", root);
    if (btnPrettify) {
      btnPrettify.addEventListener("click", (e) => {
        stopEvent(e);
        this.formatCode(2);
      });
    }

    const btnMinify = dom.$<HTMLButtonElement>(".btn-code-minify", root);
    if (btnMinify) {
      btnMinify.addEventListener("click", (e) => {
        stopEvent(e);
        this.formatCode(0);
      });
    }

    // Copy JSON
    dom.$$<HTMLButtonElement>(".btn-copy-json", root).forEach(btn => {
      btn.addEventListener("click", (e) => {
        stopEvent(e);
        this.copyJsonToClipboard(btn);
      });
    });

    // Copy Path from Breadcrumb
    const breadcrumb = dom.$<HTMLElement>(".json-path-breadcrumb", root);
    if (breadcrumb) {
      breadcrumb.addEventListener("click", (e) => {
        stopEvent(e);
        this.copyTextToClipboard(this.selectedPath, breadcrumb, `Path: ${this.selectedPath} (Copied!)`);
      });
    }

    // Set NULL checkbox
    const nullCheckbox = dom.$<HTMLInputElement>(".value-is-null", root);
    if (nullCheckbox) {
      nullCheckbox.addEventListener("change", () => {
        this.handleNullToggle(nullCheckbox.checked);
      });
    }

    // Save button
    const okBtn = dom.$<HTMLButtonElement>("button.ok", root);
    if (okBtn) {
      okBtn.addEventListener("click", (e) => {
        stopEvent(e);
        this.handleSave();
      });
    }

    // Cancel / Close button
    dom.$$<HTMLButtonElement>("button.cancel", root).forEach(btn => {
      btn.addEventListener("click", (e) => {
        stopEvent(e);
        this.close();
      });
    });
  }

  handleNullToggle(isNull: boolean) {
    const root = this.getRoot();
    if (!root) return;
    const body = dom.$<HTMLElement>(".json-viewer-body", root);
    if (body) {
      body.style.opacity = isNull ? "0.35" : "1";
      body.style.pointerEvents = isNull ? "none" : "auto";
    }
  }

  switchMode(targetMode: "tree" | "code") {
    const root = this.getRoot();
    if (!root) return;

    if (targetMode === "code") {
      // Switching Tree -> Code
      this.mode = "code";
      this.updateModeUI();
      this.initOrUpdateCodeEditor();
    } else {
      // Switching Code -> Tree: parse current code first
      const code = this.getCodeContent();
      if (code.trim() === "") {
        this.currentParsedValue = null;
        this.clearValidationError();
      } else {
        try {
          this.currentParsedValue = JSON.parse(code);
          this.clearValidationError();
        } catch (err: any) {
          this.showValidationError(`Invalid JSON syntax: ${err.message}`);
          return;
        }
      }
      this.mode = "tree";
      this.updateModeUI();
      this.renderTree();
    }
  }

  updateModeUI() {
    const root = this.getRoot();
    if (!root) return;

    dom.$$<HTMLButtonElement>(".btn-mode", root).forEach(btn => {
      const mode = btn.getAttribute("data-mode");
      if (mode === this.mode) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    const treeWrapper = dom.$<HTMLElement>(".json-tree-wrapper", root);
    const codeWrapper = dom.$<HTMLElement>(".json-code-wrapper", root);
    const treeActions = dom.$<HTMLElement>(".tree-actions", root);
    const codeActions = dom.$<HTMLElement>(".code-actions", root);

    if (this.mode === "tree") {
      if (treeWrapper) treeWrapper.style.display = "block";
      if (codeWrapper) codeWrapper.style.display = "none";
      if (treeActions) treeActions.style.display = "flex";
      if (codeActions) codeActions.style.display = "none";
    } else {
      if (treeWrapper) treeWrapper.style.display = "none";
      if (codeWrapper) codeWrapper.style.display = "block";
      if (treeActions) treeActions.style.display = "none";
      if (codeActions) codeActions.style.display = "flex";
    }
  }

  initOrUpdateCodeEditor() {
    const root = this.getRoot();
    if (!root) return;

    const textarea = dom.$<HTMLTextAreaElement>(".json-code-textarea", root);
    if (!textarea) return;

    const formatted = this.currentParsedValue === null
      ? ""
      : (typeof this.currentParsedValue === "string"
          ? this.currentParsedValue
          : JSON.stringify(this.currentParsedValue, null, 2));

    if (!this.editor && typeof (window as any).CodeMirror === "function") {
      textarea.value = formatted;
      this.editor = (window as any).CodeMirror.fromTextArea(textarea, {
        mode: { name: "javascript", json: true },
        lineNumbers: true,
        matchBrackets: true,
        tabSize: 2,
        lineWrapping: true
      });
      setTimeout(() => this.editor && this.editor.refresh(), 20);
    } else if (this.editor) {
      this.editor.setValue(formatted);
      setTimeout(() => this.editor && this.editor.refresh(), 20);
    } else {
      textarea.value = formatted;
    }
  }

  getCodeContent(): string {
    if (this.editor) {
      return this.editor.getValue();
    }
    const root = this.getRoot();
    const textarea = root ? dom.$<HTMLTextAreaElement>(".json-code-textarea", root) : null;
    return textarea ? textarea.value : "";
  }

  formatCode(indent: number) {
    const code = this.getCodeContent();
    if (!code.trim()) return;

    try {
      const parsed = JSON.parse(code);
      this.clearValidationError();
      const formatted = indent > 0 ? JSON.stringify(parsed, null, indent) : JSON.stringify(parsed);
      if (this.editor) {
        this.editor.setValue(formatted);
      } else {
        const root = this.getRoot();
        const textarea = root ? dom.$<HTMLTextAreaElement>(".json-code-textarea", root) : null;
        if (textarea) textarea.value = formatted;
      }
    } catch (err: any) {
      this.showValidationError(`Cannot format: invalid JSON syntax (${err.message})`);
    }
  }

  showValidationError(msg: string) {
    const root = this.getRoot();
    if (!root) return;
    const banner = dom.$<HTMLElement>(".json-validation-error", root);
    if (banner) {
      banner.textContent = `⚠️ ${msg}`;
      banner.style.display = "block";
    }
  }

  clearValidationError() {
    const root = this.getRoot();
    if (!root) return;
    const banner = dom.$<HTMLElement>(".json-validation-error", root);
    if (banner) {
      banner.textContent = "";
      banner.style.display = "none";
    }
  }

  renderTree() {
    const root = this.getRoot();
    if (!root) return;
    const container = dom.$<HTMLElement>(".json-tree-content", root);
    if (!container) return;

    container.innerHTML = "";

    if (this.currentParsedValue === null) {
      const empty = document.createElement("div");
      empty.className = "json-empty-hint";
      empty.textContent = "Value is NULL";
      container.appendChild(empty);
      return;
    }

    const node = this.buildTreeNode(null, this.currentParsedValue, "$", 0);
    if (node) {
      container.appendChild(node);
    }
  }

  buildTreeNode(key: string | null, val: any, path: string, depth: number): HTMLElement | null {
    const isObject = typeof val === "object" && val !== null;
    const isArray = Array.isArray(val);

    const matchesFilter = (k: string | null, v: any): boolean => {
      if (!this.searchQuery) return true;
      if (k && k.toLowerCase().includes(this.searchQuery)) return true;
      if (!isObject && v !== null && v !== undefined && String(v).toLowerCase().includes(this.searchQuery)) return true;
      return false;
    };

    if (isObject) {
      const keys = Object.keys(val);
      const childElements: HTMLElement[] = [];
      let anyChildMatches = false;

      for (const childKey of keys) {
        const childVal = val[childKey];
        const childPath = isArray ? `${path}[${childKey}]` : `${path}.${childKey}`;
        const childNode = this.buildTreeNode(childKey, childVal, childPath, depth + 1);
        if (childNode) {
          childElements.push(childNode);
          anyChildMatches = true;
        }
      }

      const selfMatches = matchesFilter(key, null);
      if (this.searchQuery && !selfMatches && !anyChildMatches) {
        return null;
      }

      const nodeEl = document.createElement("div");
      nodeEl.className = "json-tree-node json-branch";
      nodeEl.setAttribute("data-path", path);

      const header = document.createElement("div");
      header.className = "json-node-header";

      const toggle = document.createElement("span");
      toggle.className = "json-node-toggle";
      // Auto-expand if searching, or collapse deeper levels by default
      const shouldBeOpen = this.searchQuery ? true : depth < 2;
      toggle.textContent = shouldBeOpen ? "▼" : "▶";
      header.appendChild(toggle);

      if (key !== null) {
        const keySpan = document.createElement("span");
        keySpan.className = "json-node-key";
        keySpan.innerHTML = this.highlightMatch(isArray ? `[${key}]:` : `"${key}":`);
        header.appendChild(keySpan);
      }

      const count = keys.length;
      const summary = document.createElement("span");
      summary.className = "json-node-summary";
      summary.textContent = isArray
        ? (count === 1 ? "[ 1 item ]" : `[ ${count} items ]`)
        : (count === 1 ? "{ 1 key }" : `{ ${count} keys }`);
      header.appendChild(summary);

      const copyPathBtn = document.createElement("button");
      copyPathBtn.className = "json-node-copy-btn";
      copyPathBtn.type = "button";
      copyPathBtn.title = "Copy JSON Path";
      copyPathBtn.textContent = "Copy Path";
      copyPathBtn.addEventListener("click", (e) => {
        stopEvent(e);
        this.copyTextToClipboard(path, copyPathBtn, "Copied!");
      });
      header.appendChild(copyPathBtn);

      const childrenContainer = document.createElement("div");
      childrenContainer.className = "json-node-children";
      childrenContainer.style.display = shouldBeOpen ? "block" : "none";
      childElements.forEach(child => childrenContainer.appendChild(child));

      header.addEventListener("click", () => {
        const isOpen = childrenContainer.style.display !== "none";
        childrenContainer.style.display = isOpen ? "none" : "block";
        toggle.textContent = isOpen ? "▶" : "▼";
        this.updateSelectedPath(path);
      });

      nodeEl.appendChild(header);
      nodeEl.appendChild(childrenContainer);
      return nodeEl;
    } else {
      // Primitive node
      const selfMatches = matchesFilter(key, val);
      if (this.searchQuery && !selfMatches) {
        return null;
      }

      const nodeEl = document.createElement("div");
      nodeEl.className = "json-tree-node json-leaf";
      nodeEl.setAttribute("data-path", path);

      const header = document.createElement("div");
      header.className = "json-node-header";

      const bullet = document.createElement("span");
      bullet.className = "json-node-bullet";
      bullet.textContent = "•";
      header.appendChild(bullet);

      if (key !== null) {
        const keySpan = document.createElement("span");
        keySpan.className = "json-node-key";
        keySpan.innerHTML = this.highlightMatch(path.endsWith(`[${key}]`) ? `[${key}]:` : `"${key}":`);
        header.appendChild(keySpan);
      }

      const valSpan = document.createElement("span");
      const valType = typeof val;
      if (val === null) {
        valSpan.className = "json-val val-null";
        valSpan.textContent = "null";
      } else if (valType === "string") {
        valSpan.className = "json-val val-string";
        valSpan.innerHTML = this.highlightMatch(JSON.stringify(val));
      } else if (valType === "number") {
        valSpan.className = "json-val val-number";
        valSpan.innerHTML = this.highlightMatch(String(val));
      } else if (valType === "boolean") {
        valSpan.className = "json-val val-boolean";
        valSpan.textContent = String(val);
      } else {
        valSpan.className = "json-val";
        valSpan.textContent = String(val);
      }
      header.appendChild(valSpan);

      const copyPathBtn = document.createElement("button");
      copyPathBtn.className = "json-node-copy-btn";
      copyPathBtn.type = "button";
      copyPathBtn.title = "Copy JSON Path";
      copyPathBtn.textContent = "Copy Path";
      copyPathBtn.addEventListener("click", (e) => {
        stopEvent(e);
        this.copyTextToClipboard(path, copyPathBtn, "Copied!");
      });
      header.appendChild(copyPathBtn);

      header.addEventListener("click", () => {
        this.updateSelectedPath(path);
      });

      nodeEl.appendChild(header);
      return nodeEl;
    }
  }

  highlightMatch(str: string): string {
    if (!this.searchQuery) {
      return this.escapeHtml(str);
    }
    const query = this.searchQuery;
    const escaped = this.escapeHtml(str);
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return escaped.replace(regex, "<mark>$1</mark>");
  }

  escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  updateSelectedPath(path: string) {
    this.selectedPath = path;
    const root = this.getRoot();
    if (!root) return;
    const breadcrumb = dom.$<HTMLElement>(".json-path-breadcrumb", root);
    if (breadcrumb) {
      breadcrumb.textContent = `Path: ${path}`;
    }
  }

  expandAllTreeNodes(expand: boolean) {
    const root = this.getRoot();
    if (!root) return;
    dom.$$<HTMLElement>(".json-node-children", root).forEach(child => {
      child.style.display = expand ? "block" : "none";
    });
    dom.$$<HTMLElement>(".json-node-toggle", root).forEach(toggle => {
      toggle.textContent = expand ? "▼" : "▶";
    });
  }

  copyJsonToClipboard(btn: HTMLButtonElement) {
    let textToCopy = "";
    if (this.mode === "code") {
      textToCopy = this.getCodeContent();
    } else {
      textToCopy = this.currentParsedValue === null ? "null" : JSON.stringify(this.currentParsedValue, null, 2);
    }
    this.copyTextToClipboard(textToCopy, btn, "✓ Copied!");
  }

  copyTextToClipboard(text: string, triggerElement?: HTMLElement, successText?: string) {
    if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).catch(err => {
        console.error("Clipboard copy error:", err);
      });
    } else {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }

    if (triggerElement && successText) {
      const originalText = triggerElement.textContent;
      triggerElement.textContent = successText;
      setTimeout(() => {
        triggerElement.textContent = originalText;
      }, 1500);
    }
  }

  handleSave() {
    if (this.readOnly || !this.onSave) {
      this.close();
      return;
    }

    const root = this.getRoot();
    const nullCheckbox = root ? dom.$<HTMLInputElement>(".value-is-null", root) : null;
    if (nullCheckbox && nullCheckbox.checked) {
      this.onSave(null, true);
      this.close();
      return;
    }

    let finalJsonString = "";
    if (this.mode === "code") {
      const rawCode = this.getCodeContent().trim();
      if (rawCode === "") {
        this.onSave(null, true);
        this.close();
        return;
      }
      try {
        JSON.parse(rawCode); // validate
        finalJsonString = rawCode;
      } catch (err: any) {
        this.showValidationError(`Cannot save: invalid JSON syntax (${err.message})`);
        return;
      }
    } else {
      if (this.currentParsedValue === null) {
        this.onSave(null, true);
        this.close();
        return;
      }
      finalJsonString = typeof this.currentParsedValue === "string"
        ? this.currentParsedValue
        : JSON.stringify(this.currentParsedValue);
    }

    this.onSave(finalJsonString, false);
    this.close();
  }
}

declare var JsonViewer__: typeof JsonViewer;

module.exports = JsonViewer;

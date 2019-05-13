/// <reference path="./codemirror.d.ts" />

declare namespace CodeMirror {
  interface EditorFromTextArea {
    getSelection(): string;
    lineCount(): number;
    setCursor(pos: CodeMirror.Position | number, ch?: number, options?: { bias?: number, origin?: string, scroll?: boolean }): void;
  }

  interface EditorConfiguration {
    matchBrackets?: boolean;
    hint?: any;
    styleActiveLine?: boolean;
  }
}

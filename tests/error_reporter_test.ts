import { describe, it, expect, beforeEach } from "bun:test";
import "./test_helper";

const errorReporter = require("../lib/error_reporter");

describe("errorReporter", () => {
  beforeEach(() => {
    errorReporter.resetSeen();
  });

  it("sanitizes home paths and postgres connection strings", () => {
    const raw =
      "Failed at /Users/alice/Sites/postbird/app.ts and C:\\Users\\alice\\db.ts connecting to postgres://admin:secret@db.example.com:5432/prod";
    const sanitized = errorReporter.sanitizeText(raw);

    expect(sanitized).not.toContain("/Users/alice/");
    expect(sanitized).not.toContain("\\Users\\alice\\");
    expect(sanitized).not.toContain("secret");
    expect(sanitized).not.toContain("db.example.com");
    expect(sanitized).toContain("/Users/<user>/");
    expect(sanitized).toContain("\\Users\\<user>\\");
    expect(sanitized).toContain("postgres://***@***");
  });

  it("skips prompting for showError=false, PG errors, connection drops, and AbortError", () => {
    expect(errorReporter.shouldPrompt(new Error("boom"), false)).toBe(false);

    const pgErr: any = new Error("syntax error at or near \"FROM\"");
    pgErr.code = "42601";
    pgErr.severity = "ERROR";
    expect(errorReporter.shouldPrompt(pgErr, true)).toBe(false);

    expect(errorReporter.shouldPrompt(new Error("Connection terminated unexpectedly"), true)).toBe(false);
    expect(errorReporter.shouldPrompt(new Error("connect ECONNREFUSED 127.0.0.1:5432"), true)).toBe(false);

    const abortErr = new Error("The operation was aborted");
    abortErr.name = "AbortError";
    expect(errorReporter.shouldPrompt(abortErr, true)).toBe(false);

    expect(errorReporter.shouldPrompt(new TypeError("Cannot read properties of undefined"), true)).toBe(true);
  });

  it("builds sanitized GitHub issue and mailto URLs", () => {
    const origSysInfo = (window as any).__postbirdSystemInfo;
    (window as any).__postbirdSystemInfo = { platform: "darwin", arch: "arm64", release: "24.3.0", osVersion: "15.3" };
    try {
      const err = new Error("Crash in /Users/bob/app.ts with postgresql://u:p@host/db");
      err.stack = Array.from({ length: 30 }, (_, i) => `    at fn${i} (/Users/bob/file${i}.ts:${i}:1)`).join("\n");

      const report = errorReporter.buildReport(err);
      expect(report.githubUrl.startsWith("https://github.com/Paxa/postbird/issues/new?")).toBe(true);
      expect(report.mailtoUrl.startsWith("mailto:pavel.evst@gmail.com?")).toBe(true);
      expect(report.mailtoUrl.length).toBeLessThan(2200);
      expect(report.reportText).toContain("Platform: macOS 15.3 (arm64)");
      expect(report.reportText).not.toContain("bob");
      expect(report.reportText).not.toContain("u:p@host");
    } finally {
      (window as any).__postbirdSystemInfo = origSysInfo;
    }
  });

  it("opens Dialog.ErrorReport at most once per error signature in a session", () => {
    const origDialog = (global as any).Dialog;
    let opened = 0;
    let capturedPayload: any = null;
    (global as any).Dialog = {
      ErrorReport: class {
        constructor(payload: any, onClose: () => void) {
          opened++;
          capturedPayload = payload;
          onClose();
        }
      },
    };

    try {
      const err1 = new Error("Unique crash 123");
      const err2 = new Error("Unique crash 123");
      err2.stack = err1.stack;

      errorReporter(err1, true);
      errorReporter(err2, true);

      expect(opened).toBe(1);
      expect(capturedPayload?.githubUrl).toContain("github.com/Paxa/postbird/issues/new");
      expect(capturedPayload?.mailtoUrl).toContain("mailto:pavel.evst@gmail.com");
    } finally {
      (global as any).Dialog = origDialog;
    }
  });
});

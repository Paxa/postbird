/**
 * Postbird Export and Formatting Utilities
 * Helpers for converting database rows and query results to JSON, Markdown, and SQL IN clauses.
 */

export interface FieldLike {
  name: string;
  data_type?: string;
  dataType?: string;
  udt_name?: string;
  format?: string;
}

export function cleanFieldNames(fields: (string | FieldLike)[]): string[] {
  if (!fields) return [];
  return fields
    .map(f => (typeof f === 'string' ? f : (f && f.name) ? f.name : ''))
    .filter(name => name && name !== 'ctid');
}

export function rowToObject(fields: (string | FieldLike)[], row: any[] | Record<string, any>): Record<string, any> {
  const colNames = cleanFieldNames(fields);
  const obj: Record<string, any> = {};

  if (!row) return obj;

  if (Array.isArray(row)) {
    const allNames = fields.map(f => (typeof f === 'string' ? f : (f && f.name) ? f.name : ''));
    colNames.forEach(col => {
      const idx = allNames.indexOf(col);
      if (idx !== -1 && idx < row.length) {
        obj[col] = row[idx];
      }
    });
  } else if (typeof row === 'object') {
    colNames.forEach(col => {
      obj[col] = row[col];
    });
  }

  return obj;
}

export function rowToJson(fields: (string | FieldLike)[], row: any[] | Record<string, any>, pretty = true): string {
  const obj = rowToObject(fields, row);
  return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
}

export function rowsToJson(fields: (string | FieldLike)[], rows: (any[] | Record<string, any>)[], pretty = true): string {
  if (!rows || rows.length === 0) return '[]';
  const arr = rows.map(r => rowToObject(fields, r));
  return pretty ? JSON.stringify(arr, null, 2) : JSON.stringify(arr);
}

export function formatCellText(val: any): string {
  if (val === null || val === undefined) {
    return 'NULL';
  }
  if (typeof val === 'object') {
    if (val instanceof Date || typeof val.toISOString === 'function') {
      return val.toISOString();
    }
    return JSON.stringify(val);
  }
  return String(val);
}

export function formatCellMarkdown(val: any): string {
  // Escape pipes and replace newlines so Markdown tables don't break
  return formatCellText(val).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

export function rowsToMarkdown(fields: (string | FieldLike)[], rows: (any[] | Record<string, any>)[]): string {
  const colNames = cleanFieldNames(fields);
  if (colNames.length === 0) return '';
  if (!rows || rows.length === 0) return '';

  const headerRow = `| ${colNames.join(' | ')} |`;
  const separatorRow = `| ${colNames.map(() => '---').join(' | ')} |`;

  const allNames = fields.map(f => (typeof f === 'string' ? f : (f && f.name) ? f.name : ''));

  const dataRows = rows.map(row => {
    const cells = colNames.map(col => {
      let val: any = null;
      if (Array.isArray(row)) {
        const idx = allNames.indexOf(col);
        val = idx !== -1 ? row[idx] : null;
      } else if (row && typeof row === 'object') {
        val = row[col];
      }
      return formatCellMarkdown(val);
    });
    return `| ${cells.join(' | ')} |`;
  });

  return [headerRow, separatorRow, ...dataRows].join('\n');
}

export function columnToInClause(values: any[], options: { withParentheses?: boolean } = {}): string {
  const withParentheses = options.withParentheses !== false;
  if (!values || values.length === 0) {
    return withParentheses ? '()' : '';
  }

  // Filter out null / undefined and deduplicate
  const uniqueVals: any[] = [];
  const seen = new Set<string>();

  for (const v of values) {
    if (v === null || v === undefined) continue;
    const key = typeof v + ':' + String(v);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueVals.push(v);
    }
  }

  if (uniqueVals.length === 0) {
    return withParentheses ? '()' : '';
  }

  const formattedItems = uniqueVals.map(val => {
    if (typeof val === 'number') {
      return String(val);
    }
    if (typeof val === 'boolean') {
      return val ? 'TRUE' : 'FALSE';
    }
    // String, date, uuid, json etc.
    const str = (val && typeof val.toISOString === 'function') ? val.toISOString() : String(val);
    return `'${str.replace(/'/g, "''")}'`;
  });

  const joined = formattedItems.join(', ');
  return withParentheses ? `(${joined})` : joined;
}

export function copyToClipboard(text: string): boolean {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).catch(() => {});
      return true;
    }
  } catch (e) {}

  try {
    const electron = require('electron');
    if (electron && electron.clipboard && typeof electron.clipboard.writeText === 'function') {
      electron.clipboard.writeText(text);
      return true;
    }
  } catch (e) {}

  try {
    const remote = require('@electron/remote');
    if (remote && remote.clipboard && typeof remote.clipboard.writeText === 'function') {
      remote.clipboard.writeText(text);
      return true;
    }
  } catch (e) {}

  if (typeof document !== 'undefined') {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch (e) {}
  }

  return false;
}

export function copyWithFeedback(
  text: string,
  triggerElement?: HTMLElement | null,
  successText = 'Copied!',
  durationMs = 1500
): boolean {
  const ok = copyToClipboard(text);
  if (ok && triggerElement && successText) {
    const originalText = triggerElement.textContent;
    triggerElement.textContent = successText;
    setTimeout(() => {
      triggerElement.textContent = originalText;
    }, durationMs);
  }
  return ok;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cleanFieldNames,
    rowToObject,
    rowToJson,
    rowsToJson,
    formatCellText,
    formatCellMarkdown,
    rowsToMarkdown,
    columnToInClause,
    copyToClipboard,
    copyWithFeedback
  };
}

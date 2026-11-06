/**
 * Postbird CSV utilities for escaping, formatting, and serializing query results.
 */

export function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '';
  const str = (val && typeof val.toISOString === 'function') ? val.toISOString() : String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsvRow(arr: any[]): string {
  return arr.map(escapeCsv).join(',') + '\n';
}

export function serializeToCsv(columns: string[], rows: any[][]): string {
  let output = toCsvRow(columns);
  for (const row of rows) {
    output += toCsvRow(row);
  }
  return output;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    escapeCsv,
    toCsvRow,
    serializeToCsv
  };
}

require('./test_helper');
import { escapeCsv, toCsvRow, serializeToCsv } from '../lib/csv_util';

describe('CSV Utilities Unit Tests', () => {

  describe('escapeCsv', () => {
    it('returns empty string for null and undefined', () => {
      assert.equal(escapeCsv(null), '');
      assert.equal(escapeCsv(undefined), '');
    });

    it('returns unquoted string for plain values without special characters', () => {
      assert.equal(escapeCsv('hello'), 'hello');
      assert.equal(escapeCsv(123), '123');
      assert.equal(escapeCsv(0), '0');
      assert.equal(escapeCsv(true), 'true');
      assert.equal(escapeCsv(false), 'false');
    });

    it('wraps string in double quotes if it contains a comma', () => {
      assert.equal(escapeCsv('foo,bar'), '"foo,bar"');
      assert.equal(escapeCsv('a,b,c'), '"a,b,c"');
    });

    it('escapes embedded double quotes by doubling them up', () => {
      assert.equal(escapeCsv('foo"bar'), '"foo""bar"');
      assert.equal(escapeCsv('"quoted"'), '"""quoted"""');
    });

    it('escapes and quotes values containing newlines and carriage returns', () => {
      assert.equal(escapeCsv('line1\nline2'), '"line1\nline2"');
      assert.equal(escapeCsv('line1\r\nline2'), '"line1\r\nline2"');
      assert.equal(escapeCsv('text\rwith\rcarriage'), '"text\rwith\rcarriage"');
    });

    it('formats Date objects with toISOString', () => {
      const date = new Date('2026-03-15T12:00:00.000Z');
      assert.equal(escapeCsv(date), '2026-03-15T12:00:00.000Z');
    });

    it('correctly handles combinations of commas, quotes, and newlines', () => {
      const complex = 'Item "A", with details:\nValue = $10';
      const expected = '"Item ""A"", with details:\nValue = $10"';
      assert.equal(escapeCsv(complex), expected);
    });
  });

  describe('toCsvRow', () => {
    it('joins array items with commas and terminates with newline', () => {
      const row = ['id', 'name', 'status'];
      assert.equal(toCsvRow(row), 'id,name,status\n');
    });

    it('formats row with mixed types and special characters', () => {
      const row = [1, 'Doe, John', null, 'He said "Hello"'];
      assert.equal(toCsvRow(row), '1,"Doe, John",,"He said ""Hello"""\n');
    });

    it('handles empty row', () => {
      assert.equal(toCsvRow([]), '\n');
    });
  });

  describe('serializeToCsv', () => {
    it('serializes header and multiple rows', () => {
      const cols = ['id', 'user', 'notes'];
      const data = [
        [1, 'Alice', 'First note'],
        [2, 'Bob, Jr.', 'Notes:\n- Line 1\n- Line 2'],
        [3, 'Charlie', null]
      ];

      const csv = serializeToCsv(cols, data);
      const expected = 
        'id,user,notes\n' +
        '1,Alice,First note\n' +
        '2,"Bob, Jr.","Notes:\n- Line 1\n- Line 2"\n' +
        '3,Charlie,\n';

      assert.equal(csv, expected);
    });
  });

});

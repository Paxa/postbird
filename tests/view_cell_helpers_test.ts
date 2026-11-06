require('./test_helper');

describe('ViewCellHelpers', () => {
  it('does not truncate text at 500 characters (#101, #82)', () => {
    const text800 = 'A'.repeat(800);
    const formatted = ViewCellHelpers.formatCell(text800, 'text', 'text');
    assert(!formatted.includes('...'), '800 character string should not be truncated');
    assert(formatted.includes(text800), 'Full 800 character string should be preserved');
  });

  it('truncates at custom or default limit with informative title tooltip', () => {
    (global as any).POSTBIRD_MAX_TEXT_LENGTH = 1000;
    const text1500 = 'B'.repeat(1500);
    const formatted = ViewCellHelpers.formatCell(text1500, 'text', 'text');
    assert(formatted.includes('...'), 'String over limit should be truncated');
    assert(formatted.includes('truncated'), 'Should have truncated CSS class');
    assert(formatted.includes('title="Truncated: 1500 characters'), 'Should show original length in tooltip');
    delete (global as any).POSTBIRD_MAX_TEXT_LENGTH;
  });

  describe('formatJson with Compact Cell Badge', () => {
    it('renders a compact badge and preview for JSON objects', () => {
      const data = { id: 1, name: 'Alice', active: true };
      const formatted = ViewCellHelpers.formatCell(data, 'json', 'json');
      assert(formatted.includes('cell-json-badge'), 'Should include cell-json-badge element');
      assert(formatted.includes('{ 3 keys }'), 'Should display key count badge');
      assert(formatted.includes('Alice'), 'Should include preview text');
    });

    it('renders a compact badge and item count for JSON arrays', () => {
      const data = ['item1', 'item2', 'item3', 'item4'];
      const formatted = ViewCellHelpers.formatCell(data, 'jsonb', 'jsonb');
      assert(formatted.includes('cell-json-badge'), 'Should include cell-json-badge element');
      assert(formatted.includes('[ 4 items ]'), 'Should display item count badge');
    });

    it('handles NULL JSON properly', () => {
      const formatted = ViewCellHelpers.formatCell(null, 'json', 'json');
      assert(formatted.includes('NULL'), 'Should render NULL placeholder');
    });

    it('renders compact badge for JSON string payloads', () => {
      const rawString = JSON.stringify({ status: 'ok', code: 200 });
      const formatted = ViewCellHelpers.formatCell(rawString, 'json', 'json');
      assert(formatted.includes('cell-json-badge'), 'Should render badge for JSON string');
      assert(formatted.includes('{ 2 keys }'), 'Should parse and show key count');
    });
  });
});

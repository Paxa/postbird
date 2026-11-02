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
});

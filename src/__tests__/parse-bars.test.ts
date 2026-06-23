import { describe, it, expect } from 'vitest';
import { parseBars, countBars } from '../parse-bars';

describe('parseBars', () => {
  it('parses alternating runs', () => {
    const result = parseBars('1100110');
    expect(result).toEqual([
      { type: 'bar', startIndex: 0, width: 2 },
      { type: 'space', startIndex: 2, width: 2 },
      { type: 'bar', startIndex: 4, width: 2 },
      { type: 'space', startIndex: 6, width: 1 },
    ]);
  });

  it('handles all bars', () => {
    expect(parseBars('1111')).toEqual([
      { type: 'bar', startIndex: 0, width: 4 },
    ]);
  });

  it('handles all spaces', () => {
    expect(parseBars('000')).toEqual([
      { type: 'space', startIndex: 0, width: 3 },
    ]);
  });

  it('handles single character', () => {
    expect(parseBars('1')).toEqual([
      { type: 'bar', startIndex: 0, width: 1 },
    ]);
  });

  it('returns empty for empty string', () => {
    expect(parseBars('')).toEqual([]);
  });
});

describe('countBars', () => {
  it('counts only bar segments', () => {
    const segments = parseBars('1100110');
    expect(countBars(segments)).toBe(2);
  });

  it('returns 0 for all spaces', () => {
    expect(countBars(parseBars('000'))).toBe(0);
  });
});

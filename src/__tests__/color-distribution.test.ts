import { describe, it, expect } from 'vitest';
import { distributeColors, getBlockSizes } from '../color-distribution';

describe('distributeColors', () => {
  it('distributes 123 bars across 5 colors as [25,25,25,24,24]', () => {
    const colors = ['#A', '#B', '#C', '#D', '#E'];
    const result = distributeColors(123, colors);

    expect(result).toHaveLength(123);
    expect(result.filter(c => c === '#A')).toHaveLength(25);
    expect(result.filter(c => c === '#B')).toHaveLength(25);
    expect(result.filter(c => c === '#C')).toHaveLength(25);
    expect(result.filter(c => c === '#D')).toHaveLength(24);
    expect(result.filter(c => c === '#E')).toHaveLength(24);
  });

  it('assigns colors in sequential blocks', () => {
    const result = distributeColors(10, ['red', 'blue']);
    expect(result.slice(0, 5).every(c => c === 'red')).toBe(true);
    expect(result.slice(5, 10).every(c => c === 'blue')).toBe(true);
  });

  it('handles even division', () => {
    const result = distributeColors(10, ['A', 'B', 'C', 'D', 'E']);
    expect(result).toHaveLength(10);
    expect(result.filter(c => c === 'A')).toHaveLength(2);
    expect(result.filter(c => c === 'E')).toHaveLength(2);
  });

  it('handles more colors than bars', () => {
    const result = distributeColors(3, ['A', 'B', 'C', 'D', 'E']);
    expect(result).toEqual(['A', 'B', 'C']);
  });

  it('handles single color', () => {
    const result = distributeColors(5, ['red']);
    expect(result).toEqual(['red', 'red', 'red', 'red', 'red']);
  });

  it('returns empty for zero bars', () => {
    expect(distributeColors(0, ['red'])).toEqual([]);
  });

  it('throws on empty colors', () => {
    expect(() => distributeColors(5, [])).toThrow('At least one color is required');
  });
});

describe('getBlockSizes', () => {
  it('returns correct block sizes for 123 bars, 5 colors', () => {
    expect(getBlockSizes(123, 5)).toEqual([25, 25, 25, 24, 24]);
  });

  it('returns even sizes when divisible', () => {
    expect(getBlockSizes(10, 5)).toEqual([2, 2, 2, 2, 2]);
  });
});

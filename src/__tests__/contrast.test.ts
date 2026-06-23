import { describe, it, expect } from 'vitest';
import { contrastRatio, validateColors, allColorsScannable } from '../contrast';

describe('contrastRatio', () => {
  it('returns 21 for black on white', () => {
    const ratio = contrastRatio('#000000', '#FFFFFF');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('returns 1 for same colors', () => {
    expect(contrastRatio('#FF0000', '#FF0000')).toBeCloseTo(1, 1);
  });

  it('handles shorthand hex', () => {
    const ratio = contrastRatio('#000', '#FFF');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('dark red on white has high contrast', () => {
    const ratio = contrastRatio('#C0392B', '#FFFFFF');
    expect(ratio).toBeGreaterThan(4);
  });

  it('yellow on white has low contrast', () => {
    const ratio = contrastRatio('#FFEAA7', '#FFFFFF');
    expect(ratio).toBeLessThan(1.5);
  });
});

describe('validateColors', () => {
  it('marks dark colors as passing on white', () => {
    const results = validateColors(['#000000', '#C0392B'], '#FFFFFF');
    expect(results.every(r => r.pass)).toBe(true);
  });

  it('marks light yellow as failing on white', () => {
    const results = validateColors(['#FFEAA7'], '#FFFFFF');
    expect(results[0].pass).toBe(false);
  });

  it('respects custom min ratio', () => {
    const results = validateColors(['#888888'], '#FFFFFF', 5);
    expect(results[0].pass).toBe(false);
    const lenient = validateColors(['#888888'], '#FFFFFF', 2);
    expect(lenient[0].pass).toBe(true);
  });
});

describe('allColorsScannable', () => {
  it('returns true when all colors pass', () => {
    expect(allColorsScannable(['#000', '#333', '#C0392B'], '#FFF')).toBe(true);
  });

  it('returns false when any color fails', () => {
    expect(allColorsScannable(['#000', '#FFEAA7'], '#FFF')).toBe(false);
  });
});

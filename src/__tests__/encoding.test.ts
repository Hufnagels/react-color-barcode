import { describe, it, expect } from 'vitest';
import { getBinaryString, getEncoding } from '../encoding';

describe('getEncoding', () => {
  it('returns encoding objects for CODE128', () => {
    const encodings = getEncoding('12345', 'CODE128');
    expect(encodings.length).toBeGreaterThan(0);
    expect(encodings[0].data).toBeTruthy();
  });

  it('throws on invalid input for format', () => {
    expect(() => getEncoding('ABCDEF', 'EAN13')).toThrow();
  });
});

describe('getBinaryString', () => {
  it('returns a binary string of only 0s and 1s', () => {
    const binary = getBinaryString('Hello');
    expect(binary).toMatch(/^[01]+$/);
    expect(binary.length).toBeGreaterThan(0);
  });

  it('produces different output for different formats', () => {
    const code128 = getBinaryString('12345', 'CODE128');
    const code39 = getBinaryString('12345', 'CODE39');
    expect(code128).not.toEqual(code39);
  });

  it('produces consistent output for same input', () => {
    const a = getBinaryString('TEST', 'CODE128');
    const b = getBinaryString('TEST', 'CODE128');
    expect(a).toEqual(b);
  });
});

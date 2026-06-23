function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3
    ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(color1: string, color2: string): number {
  const l1 = relativeLuminance(...parseHex(color1));
  const l2 = relativeLuminance(...parseHex(color2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ContrastResult {
  color: string;
  ratio: number;
  pass: boolean;
}

const MIN_CONTRAST_RATIO = 3;

export function validateColors(
  colors: string[],
  background: string,
  minRatio: number = MIN_CONTRAST_RATIO,
): ContrastResult[] {
  return colors.map(color => {
    const ratio = contrastRatio(color, background);
    return { color, ratio: Math.round(ratio * 100) / 100, pass: ratio >= minRatio };
  });
}

export function allColorsScannable(
  colors: string[],
  background: string,
  minRatio: number = MIN_CONTRAST_RATIO,
): boolean {
  return colors.every(color => contrastRatio(color, background) >= minRatio);
}

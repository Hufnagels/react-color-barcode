import type { BarSegment } from './types';

export function parseBars(binary: string): BarSegment[] {
  const segments: BarSegment[] = [];
  if (binary.length === 0) return segments;

  let currentType: 'bar' | 'space' = binary[0] === '1' ? 'bar' : 'space';
  let startIndex = 0;
  let runLength = 1;

  for (let i = 1; i < binary.length; i++) {
    const type = binary[i] === '1' ? 'bar' : 'space';
    if (type === currentType) {
      runLength++;
    } else {
      segments.push({ type: currentType, startIndex, width: runLength });
      currentType = type;
      startIndex = i;
      runLength = 1;
    }
  }
  segments.push({ type: currentType, startIndex, width: runLength });

  return segments;
}

export function countBars(segments: BarSegment[]): number {
  return segments.filter(s => s.type === 'bar').length;
}

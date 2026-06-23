export function distributeColors(barCount: number, colors: string[]): string[] {
  if (colors.length === 0) throw new Error('At least one color is required');
  if (barCount === 0) return [];

  const colorCount = colors.length;
  const baseCount = Math.floor(barCount / colorCount);
  const remainder = barCount % colorCount;
  const result: string[] = [];

  for (let c = 0; c < colorCount; c++) {
    const count = c < remainder ? baseCount + 1 : baseCount;
    for (let i = 0; i < count; i++) {
      result.push(colors[c]);
    }
  }

  return result;
}

export function getBlockSizes(barCount: number, colorCount: number): number[] {
  const baseCount = Math.floor(barCount / colorCount);
  const remainder = barCount % colorCount;
  const sizes: number[] = [];
  for (let c = 0; c < colorCount; c++) {
    sizes.push(c < remainder ? baseCount + 1 : baseCount);
  }
  return sizes;
}

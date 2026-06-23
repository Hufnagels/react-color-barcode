export { ColorBarcode } from './ColorBarcode';
export { distributeColors, getBlockSizes } from './color-distribution';
export { parseBars, countBars } from './parse-bars';
export { getEncoding, getBinaryString } from './encoding';
export { contrastRatio, validateColors, allColorsScannable } from './contrast';
export { getSvgString, toBlob, toDataURL, download } from './export';
export type { ContrastResult } from './contrast';
export type {
  ColorBarcodeProps,
  ColorBarcodeRef,
  BarcodeFormat,
  BarcodeMode,
  TextAlign,
  TextPosition,
  ExportFormat,
  BarSegment,
  ColoredBar,
} from './types';

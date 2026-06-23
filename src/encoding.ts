import JsBarcode from 'jsbarcode';
import type { BarcodeFormat, JsBarcodeEncoding } from './types';

export function getEncoding(value: string, format: BarcodeFormat = 'CODE128'): JsBarcodeEncoding[] {
  const target: { encodings?: JsBarcodeEncoding[] } = {};

  JsBarcode(target as unknown as Element, value, {
    format,
    displayValue: false,
    margin: 0,
  });

  if (!target.encodings || target.encodings.length === 0) {
    throw new Error(`Failed to encode "${value}" as ${format}`);
  }

  return target.encodings;
}

export function getBinaryString(value: string, format?: BarcodeFormat): string {
  const encodings = getEncoding(value, format);
  return encodings.map(e => e.data).join('');
}

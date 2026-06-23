import type { CSSProperties } from 'react';
import type { ContrastResult } from './contrast';

export type BarcodeFormat =
  | 'CODE128' | 'CODE128A' | 'CODE128B' | 'CODE128C'
  | 'CODE39'
  | 'EAN13' | 'EAN8' | 'EAN5' | 'EAN2'
  | 'UPC' | 'UPCE'
  | 'ITF' | 'ITF14'
  | 'MSI' | 'MSI10' | 'MSI11' | 'MSI1010' | 'MSI1110'
  | 'pharmacode' | 'codabar'
  | 'CODE93';

export type BarcodeMode = 'scannable' | 'decorative';
export type TextAlign = 'left' | 'center' | 'right';
export type TextPosition = 'top' | 'bottom';
export type ExportFormat = 'svg' | 'png' | 'jpg';

export interface ColorBarcodeProps {
  value: string;
  colors: string[];
  format?: BarcodeFormat;
  mode?: BarcodeMode;
  background?: string;
  minContrastRatio?: number;
  onContrastWarning?: (results: ContrastResult[]) => void;
  width?: number;
  height?: number;
  showText?: boolean;
  text?: string;
  textColor?: string;
  textAlign?: TextAlign;
  textPosition?: TextPosition;
  textMargin?: number;
  font?: string;
  fontOptions?: string;
  fontSize?: number;
  flat?: boolean;
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

export interface ColorBarcodeRef {
  toSvg: () => string;
  toPng: (scale?: number) => Promise<Blob>;
  toJpg: (scale?: number, quality?: number) => Promise<Blob>;
  toDataURL: (format?: ExportFormat, scale?: number, quality?: number) => Promise<string>;
  download: (filename?: string, format?: ExportFormat, scale?: number) => Promise<void>;
}

export interface BarSegment {
  type: 'bar' | 'space';
  startIndex: number;
  width: number;
}

export interface ColoredBar extends BarSegment {
  color: string;
}

export interface JsBarcodeEncoding {
  data: string;
  text: string;
  options: Record<string, unknown>;
}

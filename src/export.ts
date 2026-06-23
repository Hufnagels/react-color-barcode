import type { ExportFormat } from './types';

function svgToCanvas(svgString: string, scale: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to render SVG to canvas'));
    };

    img.src = url;
  });
}

export function getSvgString(svgElement: SVGSVGElement): string {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgElement);
}

export async function toBlob(
  svgElement: SVGSVGElement,
  format: 'png' | 'jpg',
  scale: number = 2,
  quality: number = 0.92,
): Promise<Blob> {
  const svgString = getSvgString(svgElement);
  const canvas = await svgToCanvas(svgString, scale);
  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
      mimeType,
      format === 'jpg' ? quality : undefined,
    );
  });
}

export async function toDataURL(
  svgElement: SVGSVGElement,
  format: ExportFormat = 'png',
  scale: number = 2,
  quality: number = 0.92,
): Promise<string> {
  if (format === 'svg') {
    const svgString = getSvgString(svgElement);
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
  }

  const svgString = getSvgString(svgElement);
  const canvas = await svgToCanvas(svgString, scale);
  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
  return canvas.toDataURL(mimeType, format === 'jpg' ? quality : undefined);
}

export async function download(
  svgElement: SVGSVGElement,
  filename: string = 'barcode',
  format: ExportFormat = 'png',
  scale: number = 2,
): Promise<void> {
  let url: string;
  const fullFilename = filename.includes('.') ? filename : `${filename}.${format}`;

  if (format === 'svg') {
    const svgString = getSvgString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    url = URL.createObjectURL(blob);
  } else {
    const blob = await toBlob(svgElement, format, scale);
    url = URL.createObjectURL(blob);
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = fullFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

import React, { useMemo, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { ColorBarcodeProps, ColorBarcodeRef, ColoredBar } from './types';
import { getBinaryString } from './encoding';
import { parseBars, countBars } from './parse-bars';
import { distributeColors } from './color-distribution';
import { validateColors } from './contrast';
import { getSvgString, toBlob, toDataURL, download } from './export';

export const ColorBarcode = forwardRef<ColorBarcodeRef, ColorBarcodeProps>(function ColorBarcode({
  value,
  colors,
  format = 'CODE128',
  mode = 'scannable',
  background = '#FFFFFF',
  minContrastRatio = 3,
  onContrastWarning,
  width: barWidth = 2,
  height = 100,
  showText = false,
  text,
  textColor = '#000000',
  textAlign = 'center',
  textPosition = 'bottom',
  textMargin = 2,
  font = 'monospace',
  fontOptions = '',
  fontSize = 20,
  flat = false,
  margin,
  marginTop = 10,
  marginBottom = 10,
  marginLeft = 10,
  marginRight = 10,
  id,
  className,
  style,
}, ref) {
  if (margin !== undefined) {
    marginTop = margin;
    marginBottom = margin;
    marginLeft = margin;
    marginRight = margin;
  }

  const svgRef = useRef<SVGSVGElement>(null);

  useImperativeHandle(ref, () => ({
    toSvg: () => {
      if (!svgRef.current) throw new Error('SVG element not mounted');
      return getSvgString(svgRef.current);
    },
    toPng: (scale?: number) => {
      if (!svgRef.current) throw new Error('SVG element not mounted');
      return toBlob(svgRef.current, 'png', scale);
    },
    toJpg: (scale?: number, quality?: number) => {
      if (!svgRef.current) throw new Error('SVG element not mounted');
      return toBlob(svgRef.current, 'jpg', scale, quality);
    },
    toDataURL: (fmt, scale, quality) => {
      if (!svgRef.current) throw new Error('SVG element not mounted');
      return toDataURL(svgRef.current, fmt, scale, quality);
    },
    download: (filename, fmt, scale) => {
      if (!svgRef.current) throw new Error('SVG element not mounted');
      return download(svgRef.current, filename, fmt, scale);
    },
  }), []);

  const contrastResults = useMemo(
    () => validateColors(colors, background, minContrastRatio),
    [colors, background, minContrastRatio],
  );

  const hasContrastIssue = contrastResults.some(r => !r.pass);

  useEffect(() => {
    if (hasContrastIssue && onContrastWarning) {
      onContrastWarning(contrastResults.filter(r => !r.pass));
    }
  }, [hasContrastIssue, contrastResults, onContrastWarning]);

  if (mode === 'scannable' && hasContrastIssue) {
    const failing = contrastResults.filter(r => !r.pass);
    throw new Error(
      `[react-color-barcode] Scannable mode: insufficient contrast. ` +
      `Colors failing against "${background}" (min ratio: ${minContrastRatio}): ` +
      failing.map(f => `${f.color} (ratio: ${f.ratio})`).join(', ') +
      `. Use mode="decorative" to bypass, or choose darker colors.`
    );
  }

  const coloredSegments = useMemo(() => {
    const binary = getBinaryString(value, format);
    const segments = parseBars(binary);
    const barTotal = countBars(segments);
    const colorMap = distributeColors(barTotal, colors);

    let barIndex = 0;
    return segments.map<ColoredBar>(seg => {
      if (seg.type === 'bar') {
        return { ...seg, color: colorMap[barIndex++] };
      }
      return { ...seg, color: background };
    });
  }, [value, format, colors, background]);

  const totalBinaryWidth = coloredSegments.reduce((sum, s) => sum + s.width, 0);
  const svgWidth = totalBinaryWidth * barWidth + marginLeft + marginRight;
  const displayText = text ?? value;
  const textHeight = showText ? fontSize + textMargin : 0;
  const svgHeight = height + marginTop + marginBottom + textHeight;

  const textAnchor = textAlign === 'left' ? 'start' : textAlign === 'right' ? 'end' : 'middle';
  const textX = textAlign === 'left'
    ? marginLeft
    : textAlign === 'right'
      ? svgWidth - marginRight
      : svgWidth / 2;
  const textY = textPosition === 'top'
    ? marginTop - textMargin
    : marginTop + height + fontSize + textMargin;
  const barsY = textPosition === 'top' && showText
    ? marginTop + textHeight
    : marginTop;

  const fontWeight = fontOptions.includes('bold') ? 'bold' : 'normal';
  const fontStyle = fontOptions.includes('italic') ? 'italic' : 'normal';

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      width={svgWidth}
      height={svgHeight}
      id={id}
      className={className}
      style={style}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
    >
      <rect x={0} y={0} width={svgWidth} height={svgHeight} fill={background} />
      {coloredSegments.map((seg, i) => (
        <rect
          key={i}
          x={marginLeft + seg.startIndex * barWidth}
          y={barsY}
          width={seg.width * barWidth}
          height={height}
          fill={seg.color}
        />
      ))}
      {showText && !flat && (
        <text
          x={textX}
          y={textPosition === 'top' ? marginTop + fontSize : marginTop + height + fontSize + textMargin}
          textAnchor={textAnchor}
          fill={textColor}
          fontSize={fontSize}
          fontFamily={font}
          fontWeight={fontWeight}
          fontStyle={fontStyle}
        >
          {displayText}
        </text>
      )}
    </svg>
  );
});

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { ColorBarcode, validateColors, getBlockSizes, getBinaryString, parseBars, countBars } from '../src/index';
import type { BarcodeFormat, BarcodeMode, ContrastResult, ColorBarcodeRef } from '../src/index';

const PRESETS = [
  { label: 'Dark scannable', colors: ['#1B1464', '#C0392B', '#0B6623', '#6C3483', '#1A5276'] },
  { label: 'Vibrant mix', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'] },
  { label: 'Brand duo', colors: ['#E17055', '#0984E3'] },
  { label: 'Mono red', colors: ['#C0392B'] },
  { label: 'Rainbow', colors: ['#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#3498DB', '#9B59B6'] },
  { label: 'Light (fails scan)', colors: ['#FFEAA7', '#DFE6E9', '#DCDDE1'] },
];

const FORMATS: BarcodeFormat[] = ['CODE128', 'CODE39', 'EAN13', 'UPC', 'CODE93', 'ITF', 'codabar'];

function App() {
  const [value, setValue] = useState('Hello World');
  const [format, setFormat] = useState<BarcodeFormat>('CODE128');
  const [mode, setMode] = useState<BarcodeMode>('scannable');
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customColors, setCustomColors] = useState('');
  const [background, setBackground] = useState('#FFFFFF');
  const [barWidth, setBarWidth] = useState(2);
  const [barHeight, setBarHeight] = useState(100);
  const [showText, setShowText] = useState(true);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [textPosition, setTextPosition] = useState<'top' | 'bottom'>('bottom');
  const [font, setFont] = useState('monospace');
  const [minRatio, setMinRatio] = useState(3);
  const [contrastWarnings, setContrastWarnings] = useState<ContrastResult[]>([]);

  const barcodeRef = useRef<ColorBarcodeRef>(null);

  const colors = customColors.trim()
    ? customColors.split(',').map(c => c.trim()).filter(Boolean)
    : PRESETS[selectedPreset].colors;

  const onContrastWarning = useCallback((results: ContrastResult[]) => {
    setContrastWarnings(results);
  }, []);

  const barInfo = useMemo(() => {
    try {
      const binary = getBinaryString(value, format);
      const segs = parseBars(binary);
      const bc = countBars(segs);
      return { barCount: bc, blockSizes: getBlockSizes(bc, colors.length) };
    } catch {
      return { barCount: 0, blockSizes: [] as number[] };
    }
  }, [value, format, colors.length]);

  const contrastResults = useMemo(() => {
    try {
      return validateColors(colors, background, minRatio);
    } catch {
      return [];
    }
  }, [colors, background, minRatio]);

  const errorBoundaryKey = `${value}-${format}-${mode}-${colors.join()}-${background}-${minRatio}`;

  const btnStyle: React.CSSProperties = {
    padding: '6px 14px', border: '1px solid #ccc', borderRadius: 4,
    background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 960, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>react-color-barcode — Test</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Interactive test for the ColorBarcode component</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <fieldset style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
            <legend style={{ fontWeight: 600, fontSize: 14 }}>Value & Format</legend>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Value</label>
            <input
              value={value} onChange={e => setValue(e.target.value)}
              style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, marginBottom: 12, boxSizing: 'border-box' }}
            />
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Format</label>
            <select value={format} onChange={e => setFormat(e.target.value as BarcodeFormat)}
              style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }}>
              {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </fieldset>

          <fieldset style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
            <legend style={{ fontWeight: 600, fontSize: 14 }}>Mode</legend>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              <label style={{ fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="mode" checked={mode === 'scannable'} onChange={() => setMode('scannable')} /> Scannable
              </label>
              <label style={{ fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="mode" checked={mode === 'decorative'} onChange={() => setMode('decorative')} /> Decorative
              </label>
            </div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Min contrast ratio: {minRatio}</label>
            <input type="range" min={1} max={7} step={0.5} value={minRatio}
              onChange={e => setMinRatio(Number(e.target.value))} style={{ width: '100%' }} />
          </fieldset>

          <fieldset style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
            <legend style={{ fontWeight: 600, fontSize: 14 }}>Colors</legend>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Preset</label>
            <select value={selectedPreset}
              onChange={e => { setSelectedPreset(Number(e.target.value)); setCustomColors(''); setContrastWarnings([]); }}
              style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, marginBottom: 12 }}>
              {PRESETS.map((p, i) => <option key={i} value={i}>{p.label} ({p.colors.length} colors)</option>)}
            </select>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Custom (comma-separated hex)</label>
            <input value={customColors} onChange={e => setCustomColors(e.target.value)}
              placeholder="#FF0000, #00FF00, #0000FF"
              style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, marginBottom: 12, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {colors.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: '#f5f5f5', borderRadius: 4, fontSize: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: c, border: '1px solid #ccc' }} />
                  {c}
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
            <legend style={{ fontWeight: 600, fontSize: 14 }}>Appearance</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Background</label>
                <input type="color" value={background} onChange={e => setBackground(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Show text</label>
                <input type="checkbox" checked={showText} onChange={e => setShowText(e.target.checked)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Bar width: {barWidth}px</label>
                <input type="range" min={1} max={5} value={barWidth} onChange={e => setBarWidth(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Height: {barHeight}px</label>
                <input type="range" min={40} max={200} value={barHeight} onChange={e => setBarHeight(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Text align</label>
                <select value={textAlign} onChange={e => setTextAlign(e.target.value as 'left' | 'center' | 'right')}
                  style={{ width: '100%', padding: '4px', border: '1px solid #ccc', borderRadius: 4 }}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Text position</label>
                <select value={textPosition} onChange={e => setTextPosition(e.target.value as 'top' | 'bottom')}
                  style={{ width: '100%', padding: '4px', border: '1px solid #ccc', borderRadius: 4 }}>
                  <option value="bottom">Bottom</option>
                  <option value="top">Top</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Font</label>
                <select value={font} onChange={e => setFont(e.target.value)}
                  style={{ width: '100%', padding: '4px', border: '1px solid #ccc', borderRadius: 4 }}>
                  <option value="monospace">monospace</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>
            </div>
          </fieldset>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, background: '#fafafa', minHeight: 200 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, marginTop: 0 }}>Preview</h3>
            <ErrorBoundary key={errorBoundaryKey}>
              <ColorBarcode
                ref={barcodeRef}
                value={value}
                colors={colors}
                format={format}
                mode={mode}
                background={background}
                minContrastRatio={minRatio}
                onContrastWarning={onContrastWarning}
                width={barWidth}
                height={barHeight}
                showText={showText}
                textAlign={textAlign}
                textPosition={textPosition}
                font={font}
              />
            </ErrorBoundary>
          </div>

          <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, marginTop: 0 }}>Export</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button style={btnStyle} onClick={() => barcodeRef.current?.download('barcode', 'svg')}>Save SVG</button>
              <button style={btnStyle} onClick={() => barcodeRef.current?.download('barcode', 'png', 2)}>Save PNG</button>
              <button style={btnStyle} onClick={() => barcodeRef.current?.download('barcode', 'jpg', 2)}>Save JPG</button>
              <button style={{ ...btnStyle, borderColor: '#aaa' }} onClick={() => {
                const svg = barcodeRef.current?.toSvg();
                if (svg) { navigator.clipboard.writeText(svg); alert('SVG copied to clipboard'); }
              }}>Copy SVG</button>
            </div>
          </div>

          <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, marginTop: 0 }}>Distribution info</h3>
            <table style={{ fontSize: 13, width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={{ padding: '4px 0', color: '#666' }}>Total bars</td><td style={{ fontWeight: 600 }}>{barInfo.barCount}</td></tr>
                <tr><td style={{ padding: '4px 0', color: '#666' }}>Colors</td><td style={{ fontWeight: 600 }}>{colors.length}</td></tr>
                <tr><td style={{ padding: '4px 0', color: '#666' }}>Block sizes</td><td style={{ fontWeight: 600 }}>[{barInfo.blockSizes.join(', ')}]</td></tr>
              </tbody>
            </table>
          </div>

          <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, marginTop: 0 }}>Contrast check</h3>
            <table style={{ fontSize: 13, width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <th style={{ textAlign: 'left', padding: '4px 0', color: '#666', fontWeight: 500 }}>Color</th>
                  <th style={{ textAlign: 'right', padding: '4px 0', color: '#666', fontWeight: 500 }}>Ratio</th>
                  <th style={{ textAlign: 'center', padding: '4px 0', color: '#666', fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {contrastResults.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '4px 0' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 2, background: r.color, border: '1px solid #ccc', verticalAlign: 'middle' }} />
                        {r.color}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '4px 0' }}>{r.ratio}:1</td>
                    <td style={{ textAlign: 'center', padding: '4px 0' }}>
                      {r.pass
                        ? <span style={{ color: '#27ae60', fontWeight: 600 }}>PASS</span>
                        : <span style={{ color: '#e74c3c', fontWeight: 600 }}>FAIL</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: Error) { return { error: error.message }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, background: '#fdecea', borderRadius: 8, color: '#c0392b', fontSize: 13, lineHeight: 1.5 }}>
          <strong>Error:</strong><br />{this.state.error}
        </div>
      );
    }
    return this.props.children;
  }
}

export default App;

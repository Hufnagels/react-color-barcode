import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React, { createRef } from 'react';
import { ColorBarcode } from '../ColorBarcode';
import type { ColorBarcodeRef } from '../types';

describe('ColorBarcode — rendering', () => {
  it('renders an SVG element', () => {
    const { container } = render(
      <ColorBarcode value="123" colors={['red', 'blue']} mode="decorative" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
  });

  it('renders colored bar rects', () => {
    const { container } = render(
      <ColorBarcode value="123" colors={['#FF0000', '#00FF00']} mode="decorative" />
    );
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(1);
    const fills = Array.from(rects).map(r => r.getAttribute('fill'));
    expect(fills).toContain('#FF0000');
    expect(fills).toContain('#00FF00');
  });

  it('does not render text by default', () => {
    const { container } = render(
      <ColorBarcode value="123" colors={['red']} mode="decorative" />
    );
    expect(container.querySelector('text')).toBeNull();
  });

  it('renders text when showText is true', () => {
    const { container } = render(
      <ColorBarcode value="ABC" colors={['red']} mode="decorative" showText />
    );
    const text = container.querySelector('text');
    expect(text).toBeTruthy();
    expect(text?.textContent).toBe('ABC');
  });

  it('uses custom text override', () => {
    const { container } = render(
      <ColorBarcode value="123" text="Custom" colors={['red']} mode="decorative" showText />
    );
    expect(container.querySelector('text')?.textContent).toBe('Custom');
  });

  it('applies className, style, and id', () => {
    const { container } = render(
      <ColorBarcode
        value="123"
        colors={['red']}
        mode="decorative"
        id="my-barcode"
        className="my-barcode"
        style={{ border: '1px solid black' }}
      />
    );
    const svg = container.querySelector('svg');
    expect(svg?.id).toBe('my-barcode');
    expect(svg?.classList.contains('my-barcode')).toBe(true);
    expect(svg?.style.border).toBe('1px solid black');
  });

  it('uses custom background color for spaces', () => {
    const { container } = render(
      <ColorBarcode value="123" colors={['red']} mode="decorative" background="#EEEEEE" />
    );
    const rects = container.querySelectorAll('rect');
    expect(rects[0].getAttribute('fill')).toBe('#EEEEEE');
  });
});

describe('ColorBarcode — text options', () => {
  it('applies textAlign left', () => {
    const { container } = render(
      <ColorBarcode value="123" colors={['red']} mode="decorative" showText textAlign="left" />
    );
    expect(container.querySelector('text')?.getAttribute('text-anchor')).toBe('start');
  });

  it('applies textAlign right', () => {
    const { container } = render(
      <ColorBarcode value="123" colors={['red']} mode="decorative" showText textAlign="right" />
    );
    expect(container.querySelector('text')?.getAttribute('text-anchor')).toBe('end');
  });

  it('applies custom font and fontOptions', () => {
    const { container } = render(
      <ColorBarcode
        value="123" colors={['red']} mode="decorative" showText
        font="Arial" fontOptions="bold italic"
      />
    );
    const text = container.querySelector('text');
    expect(text?.getAttribute('font-family')).toBe('Arial');
    expect(text?.getAttribute('font-weight')).toBe('bold');
    expect(text?.getAttribute('font-style')).toBe('italic');
  });

  it('hides text when flat is true', () => {
    const { container } = render(
      <ColorBarcode value="123" colors={['red']} mode="decorative" showText flat />
    );
    expect(container.querySelector('text')).toBeNull();
  });
});

describe('ColorBarcode — margins', () => {
  it('supports individual margins', () => {
    const { container } = render(
      <ColorBarcode
        value="1" colors={['red']} mode="decorative"
        marginTop={5} marginBottom={15} marginLeft={20} marginRight={30}
      />
    );
    const svg = container.querySelector('svg');
    const viewBox = svg?.getAttribute('viewBox');
    expect(viewBox).toBeTruthy();
  });

  it('margin shorthand overrides individual margins', () => {
    const { container: c1 } = render(
      <ColorBarcode value="1" colors={['red']} mode="decorative" margin={20} />
    );
    const { container: c2 } = render(
      <ColorBarcode value="1" colors={['red']} mode="decorative"
        marginTop={20} marginBottom={20} marginLeft={20} marginRight={20} />
    );
    expect(c1.querySelector('svg')?.getAttribute('viewBox'))
      .toBe(c2.querySelector('svg')?.getAttribute('viewBox'));
  });
});

describe('ColorBarcode — scannable mode', () => {
  it('renders with dark colors on white', () => {
    const { container } = render(
      <ColorBarcode value="123" colors={['#000000', '#333333']} mode="scannable" />
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('throws when colors have insufficient contrast', () => {
    expect(() =>
      render(<ColorBarcode value="123" colors={['#FFEAA7']} mode="scannable" />)
    ).toThrow(/insufficient contrast/i);
  });

  it('defaults to scannable mode', () => {
    expect(() =>
      render(<ColorBarcode value="123" colors={['#FFEAA7']} />)
    ).toThrow(/insufficient contrast/i);
  });

  it('respects custom minContrastRatio', () => {
    expect(() =>
      render(<ColorBarcode value="123" colors={['#888888']} mode="scannable" minContrastRatio={5} />)
    ).toThrow(/insufficient contrast/i);

    const { container } = render(
      <ColorBarcode value="123" colors={['#888888']} mode="scannable" minContrastRatio={2} />
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });
});

describe('ColorBarcode — decorative mode', () => {
  it('renders light colors without throwing', () => {
    const { container } = render(
      <ColorBarcode value="123" colors={['#FFEAA7', '#FFFF00']} mode="decorative" />
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('calls onContrastWarning for failing colors', () => {
    const warn = vi.fn();
    render(
      <ColorBarcode
        value="123" colors={['#000000', '#FFEAA7']} mode="decorative"
        onContrastWarning={warn}
      />
    );
    expect(warn).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ color: '#FFEAA7', pass: false }),
      ])
    );
  });

  it('does not call onContrastWarning when all pass', () => {
    const warn = vi.fn();
    render(
      <ColorBarcode value="123" colors={['#000000', '#333333']} mode="decorative" onContrastWarning={warn} />
    );
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('ColorBarcode — ref / export', () => {
  it('exposes toSvg via ref', () => {
    const ref = createRef<ColorBarcodeRef>();
    render(<ColorBarcode ref={ref} value="123" colors={['red']} mode="decorative" />);
    const svg = ref.current!.toSvg();
    expect(svg).toContain('<svg');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });
});

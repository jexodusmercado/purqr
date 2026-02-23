// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createShadowExtension, buildShadowExtension, rasterizeSvgBlob } from '../qr-extension';
import type { ShadowOptions } from '../../types/qr-options';

const ENABLED_SHADOW: ShadowOptions = {
  enabled: true,
  color: '#000000',
  opacity: 0.3,
  blur: 10,
  offsetX: 3,
  offsetY: 3,
};

const DISABLED_SHADOW: ShadowOptions = {
  enabled: false,
  color: '#000000',
  opacity: 0.3,
  blur: 10,
  offsetX: 3,
  offsetY: 3,
};

function makeSvg(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  // Add a rect child (non-defs) so wrapping logic has something to wrap
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', '100');
  rect.setAttribute('height', '100');
  svg.appendChild(rect);
  return svg;
}

describe('createShadowExtension', () => {
  it('returns a function', () => {
    expect(typeof createShadowExtension(ENABLED_SHADOW)).toBe('function');
  });

  it('is a no-op when shadow.enabled is false — does not modify SVG', () => {
    const ext = createShadowExtension(DISABLED_SHADOW);
    const svg = makeSvg();
    const childCountBefore = svg.childNodes.length;
    ext(svg, {});
    expect(svg.childNodes.length).toBe(childCountBefore);
    expect(svg.querySelector('defs')).toBeNull();
  });

  it('adds <defs> to SVG when none exists', () => {
    const ext = createShadowExtension(ENABLED_SHADOW);
    const svg = makeSvg();
    ext(svg, {});
    expect(svg.querySelector('defs')).not.toBeNull();
  });

  it('adds <filter id="purqr-shadow"> inside <defs>', () => {
    const ext = createShadowExtension(ENABLED_SHADOW);
    const svg = makeSvg();
    ext(svg, {});
    const filter = svg.querySelector('defs #purqr-shadow');
    expect(filter).not.toBeNull();
    expect(filter!.tagName.toLowerCase()).toBe('filter');
  });

  it('adds <feDropShadow> with correct dx, dy, stdDeviation, flood-color, flood-opacity', () => {
    const shadow: ShadowOptions = { enabled: true, color: '#ff0000', opacity: 0.8, blur: 5, offsetX: 2, offsetY: -3 };
    const ext = createShadowExtension(shadow);
    const svg = makeSvg();
    ext(svg, {});
    const fe = svg.querySelector('feDropShadow');
    expect(fe).not.toBeNull();
    expect(fe!.getAttribute('dx')).toBe('2');
    expect(fe!.getAttribute('dy')).toBe('-3');
    expect(fe!.getAttribute('stdDeviation')).toBe('5');
    expect(fe!.getAttribute('flood-color')).toBe('#ff0000');
    expect(fe!.getAttribute('flood-opacity')).toBe('0.8');
  });

  it('sets filter region to x=-20% y=-20% width=140% height=140%', () => {
    const ext = createShadowExtension(ENABLED_SHADOW);
    const svg = makeSvg();
    ext(svg, {});
    const filter = svg.querySelector('#purqr-shadow');
    expect(filter!.getAttribute('x')).toBe('-20%');
    expect(filter!.getAttribute('y')).toBe('-20%');
    expect(filter!.getAttribute('width')).toBe('140%');
    expect(filter!.getAttribute('height')).toBe('140%');
  });

  it('wraps non-defs SVG children in <g filter="url(#purqr-shadow)">', () => {
    const ext = createShadowExtension(ENABLED_SHADOW);
    const svg = makeSvg();
    ext(svg, {});
    const g = svg.querySelector('g[filter]');
    expect(g).not.toBeNull();
    expect(g!.getAttribute('filter')).toBe('url(#purqr-shadow)');
    // The rect should be inside the g, not directly on svg
    expect(g!.querySelector('rect')).not.toBeNull();
    expect(svg.querySelector(':scope > rect')).toBeNull();
  });

  it('does not duplicate filter on repeated calls', () => {
    const ext = createShadowExtension(ENABLED_SHADOW);
    const svg = makeSvg();
    ext(svg, {});
    ext(svg, {}); // second call
    const filters = svg.querySelectorAll('#purqr-shadow');
    expect(filters.length).toBe(1);
  });
});

describe('buildShadowExtension', () => {
  it('returns undefined when shadow.enabled is false', () => {
    expect(buildShadowExtension(DISABLED_SHADOW)).toBeUndefined();
  });

  it('returns a function when shadow.enabled is true', () => {
    const ext = buildShadowExtension(ENABLED_SHADOW);
    expect(typeof ext).toBe('function');
  });
});

describe('rasterizeSvgBlob', () => {
  let createObjectUrlMock: ReturnType<typeof vi.fn>;
  let revokeObjectUrlMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createObjectUrlMock = vi.fn().mockReturnValue('blob:mock-url');
    revokeObjectUrlMock = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL: createObjectUrlMock,
      revokeObjectURL: revokeObjectUrlMock,
    });

    // Mock canvas with toBlob support
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue({
        drawImage: vi.fn(),
      }),
      toBlob: vi.fn().mockImplementation((cb: (b: Blob) => void) => {
        cb(new Blob(['png-data'], { type: 'image/png' }));
      }),
    };
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') return mockCanvas as unknown as HTMLElement;
      return document.createElement.call(document, tag) as HTMLElement;
    });

    // Mock Image to auto-fire onload
    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        if (this.onload) this.onload();
      }
    }
    vi.stubGlobal('Image', MockImage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('creates an object URL from the SVG blob', async () => {
    const blob = new Blob(['<svg/>'], { type: 'image/svg+xml' });
    await rasterizeSvgBlob(blob, 512);
    expect(createObjectUrlMock).toHaveBeenCalledWith(blob);
  });

  it('draws to canvas at the correct size', async () => {
    const mockCtx = { drawImage: vi.fn() };
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
      toBlob: vi.fn().mockImplementation((cb: (b: Blob) => void) => {
        cb(new Blob(['png'], { type: 'image/png' }));
      }),
    };
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') return mockCanvas as unknown as HTMLElement;
      return document.createElement.call(document, tag) as HTMLElement;
    });

    const blob = new Blob(['<svg/>'], { type: 'image/svg+xml' });
    await rasterizeSvgBlob(blob, 512);
    expect(mockCanvas.width).toBe(512);
    expect(mockCanvas.height).toBe(512);
  });

  it('returns a Blob of type image/png', async () => {
    const blob = new Blob(['<svg/>'], { type: 'image/svg+xml' });
    const result = await rasterizeSvgBlob(blob, 256);
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('image/png');
  });

  it('revokes the object URL in finally (even on error)', async () => {
    // Make Image fire onerror
    class ErrorImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        if (this.onerror) this.onerror();
      }
    }
    vi.stubGlobal('Image', ErrorImage);

    const blob = new Blob(['<svg/>'], { type: 'image/svg+xml' });
    await expect(rasterizeSvgBlob(blob, 256)).rejects.toThrow();
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:mock-url');
  });
});

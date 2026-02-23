// @vitest-environment jsdom
import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest';
import { checkMagicBytes, sanitizeSvg, sanitizeImage } from '../image-sanitizer';

// ─── Browser API mocks (jsdom doesn't implement canvas or object URLs) ────────

const mockDrawImage = vi.fn();
const mockGetContext = vi.fn().mockReturnValue({ drawImage: mockDrawImage });
const mockToDataURL = vi.fn().mockReturnValue('data:image/png;base64,bW9jaw==');

let originalCreateElement: typeof document.createElement;

beforeAll(() => {
  // Mock URL.createObjectURL / revokeObjectURL
  URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-object-url');
  URL.revokeObjectURL = vi.fn();

  // Mock Image constructor so img.onload triggers after src is set
  class MockImage {
    naturalWidth = 100;
    naturalHeight = 100;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    private _src = '';

    get src() {
      return this._src;
    }
    set src(value: string) {
      this._src = value;
      setTimeout(() => this.onload?.(), 0);
    }
  }
  (global as unknown as Record<string, unknown>).Image = MockImage;

  // Mock canvas element
  originalCreateElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    if (tagName === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: mockGetContext,
        toDataURL: mockToDataURL,
      } as unknown as HTMLCanvasElement;
    }
    return originalCreateElement(tagName);
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});

// ─── Helper to build a File with specific bytes ───────────────────────────────

function makeFile(bytes: number[], name: string, type: string): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

// ─── checkMagicBytes ──────────────────────────────────────────────────────────

describe('checkMagicBytes', () => {
  it('accepts valid PNG magic bytes', () => {
    const buf = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]).buffer;
    expect(checkMagicBytes(buf, 'image/png')).toBe(true);
  });

  it('rejects wrong bytes for PNG', () => {
    const buf = new Uint8Array([0x00, 0x01, 0x02, 0x03]).buffer;
    expect(checkMagicBytes(buf, 'image/png')).toBe(false);
  });

  it('accepts valid JPEG magic bytes', () => {
    const buf = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]).buffer;
    expect(checkMagicBytes(buf, 'image/jpeg')).toBe(true);
  });

  it('accepts valid GIF magic bytes', () => {
    const buf = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]).buffer;
    expect(checkMagicBytes(buf, 'image/gif')).toBe(true);
  });

  it('accepts valid WebP magic bytes', () => {
    const buf = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, // RIFF at offset 0
      0x00, 0x00, 0x00, 0x00, // file size (ignored)
      0x57, 0x45, 0x42, 0x50, // WEBP at offset 8
    ]).buffer;
    expect(checkMagicBytes(buf, 'image/webp')).toBe(true);
  });

  it('rejects unknown mime type', () => {
    const buf = new Uint8Array([0x89, 0x50]).buffer;
    expect(checkMagicBytes(buf, 'application/octet-stream')).toBe(false);
  });
});

// ─── sanitizeSvg ─────────────────────────────────────────────────────────────

describe('sanitizeSvg', () => {
  it('removes <script> tags', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("xss")</script><rect/></svg>';
    const result = sanitizeSvg(svg);
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
  });

  it('removes <foreignObject> tags', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><div>evil</div></foreignObject></svg>';
    const result = sanitizeSvg(svg);
    expect(result).not.toContain('foreignObject');
    expect(result).not.toContain('evil');
  });

  it('strips on* event attributes', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect onclick="alert(1)" onmouseover="bad()"/></svg>';
    const result = sanitizeSvg(svg);
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('onmouseover');
  });

  it('strips javascript: href attributes', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><rect/></a></svg>';
    const result = sanitizeSvg(svg);
    expect(result).not.toContain('javascript:');
  });

  it('preserves safe SVG content', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="blue"/></svg>';
    const result = sanitizeSvg(svg);
    expect(result).toContain('rect');
    expect(result).toContain('fill');
  });

  it('throws on invalid SVG', () => {
    expect(() => sanitizeSvg('<not-valid-svg')).toThrow();
  });
});

// ─── sanitizeImage ────────────────────────────────────────────────────────────

describe('sanitizeImage', () => {
  describe('SVG files', () => {
    it('accepts valid SVG file', async () => {
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>';
      const file = new File([svgContent], 'logo.svg', { type: 'image/svg+xml' });
      const result = await sanitizeImage(file);
      expect(result.sanitized).toBe(true);
      expect(result.dataUrl).toBeTruthy();
      expect(result.error).toBeUndefined();
    });

    it('strips <script> tags from SVG', async () => {
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("xss")</script><rect/></svg>';
      const file = new File([svgContent], 'evil.svg', { type: 'image/svg+xml' });
      const result = await sanitizeImage(file);
      expect(result.sanitized).toBe(true);
      // The returned dataUrl is base64 — decode and check
      const decoded = atob(result.dataUrl.split(',')[1]);
      expect(decoded).not.toContain('<script');
      expect(decoded).not.toContain('alert');
    });

    it('strips on* event attributes from SVG', async () => {
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><rect onclick="bad()"/></svg>';
      const file = new File([svgContent], 'event.svg', { type: 'image/svg+xml' });
      const result = await sanitizeImage(file);
      expect(result.sanitized).toBe(true);
      const decoded = atob(result.dataUrl.split(',')[1]);
      expect(decoded).not.toContain('onclick');
    });

    it('strips javascript: href from SVG', async () => {
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><rect/></a></svg>';
      const file = new File([svgContent], 'href.svg', { type: 'image/svg+xml' });
      const result = await sanitizeImage(file);
      expect(result.sanitized).toBe(true);
      const decoded = atob(result.dataUrl.split(',')[1]);
      expect(decoded).not.toContain('javascript:');
    });

    it('strips <foreignObject> from SVG', async () => {
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><div>bad</div></foreignObject></svg>';
      const file = new File([svgContent], 'fo.svg', { type: 'image/svg+xml' });
      const result = await sanitizeImage(file);
      expect(result.sanitized).toBe(true);
      const decoded = atob(result.dataUrl.split(',')[1]);
      expect(decoded).not.toContain('foreignObject');
    });

    it('rejects SVG with missing <svg> element', async () => {
      const file = new File(['<xml>not-svg</xml>'], 'bad.svg', { type: 'image/svg+xml' });
      const result = await sanitizeImage(file);
      expect(result.sanitized).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('raster images', () => {
    it('accepts valid PNG file (magic bytes match)', async () => {
      const file = makeFile([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d], 'test.png', 'image/png');
      const result = await sanitizeImage(file);
      expect(result.sanitized).toBe(true);
      expect(result.dataUrl).toBeTruthy();
    });

    it('accepts valid JPEG file', async () => {
      const file = makeFile([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01], 'test.jpg', 'image/jpeg');
      const result = await sanitizeImage(file);
      expect(result.sanitized).toBe(true);
    });

    it('rejects file with mismatched magic bytes (exe renamed to png)', async () => {
      const file = makeFile([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00], 'evil.png', 'image/png');
      const result = await sanitizeImage(file);
      expect(result.sanitized).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('produces a data URL for valid raster (canvas round-trip)', async () => {
      const file = makeFile([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d], 'test.png', 'image/png');
      const result = await sanitizeImage(file);
      expect(result.dataUrl).toMatch(/^data:/);
    });
  });

  describe('unsupported types', () => {
    it('rejects unsupported MIME type', async () => {
      const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
      const result = await sanitizeImage(file);
      expect(result.sanitized).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
});

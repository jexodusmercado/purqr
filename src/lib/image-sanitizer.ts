export type SanitizeResult = {
  dataUrl: string;
  sanitized: boolean;
  error?: string;
};

// Magic byte signatures for supported raster formats
const MAGIC_SIGS: Record<string, { offset: number; bytes: number[] }[]> = {
  'image/png':  [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] }],
  'image/jpeg': [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  'image/gif':  [{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] }],
  'image/webp': [
    { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF
    { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }, // WEBP
  ],
};

/**
 * Checks that the given ArrayBuffer starts with the expected magic bytes
 * for the declared MIME type.
 */
export function checkMagicBytes(buffer: ArrayBuffer, mimeType: string): boolean {
  const sigs = MAGIC_SIGS[mimeType];
  if (!sigs) return false;
  const bytes = new Uint8Array(buffer);
  return sigs.every(sig => sig.bytes.every((b, i) => bytes[sig.offset + i] === b));
}

/**
 * Strips dangerous content from an SVG string using DOMParser/XMLSerializer.
 * Removes: <script>, <foreignObject>, on* attributes, javascript: hrefs.
 */
export function sanitizeSvg(svgText: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) throw new Error('Invalid SVG document');

  doc.querySelectorAll('script').forEach(el => el.remove());
  doc.querySelectorAll('foreignObject').forEach(el => el.remove());

  doc.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.toLowerCase().startsWith('on')) {
        el.removeAttribute(attr.name);
      }
      if (
        (attr.name === 'href' || attr.name === 'xlink:href') &&
        attr.value.replace(/\s/g, '').toLowerCase().startsWith('javascript:')
      ) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return new XMLSerializer().serializeToString(doc);
}

/**
 * Re-encodes a raster image through a canvas to strip EXIF and embedded payloads.
 * Returns a PNG data URL.
 */
function rasterToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 1;
      canvas.height = img.naturalHeight || 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image failed to load'));
    };
    img.src = objectUrl;
  });
}

/**
 * Sanitizes an uploaded image file.
 * SVG: parsed, stripped of scripts/event-handlers, re-serialized.
 * Raster (PNG/JPEG/GIF/WebP): magic bytes validated, then re-encoded through canvas.
 */
export async function sanitizeImage(file: File): Promise<SanitizeResult> {
  const { type: mimeType } = file;

  if (mimeType === 'image/svg+xml') {
    try {
      const text = await file.text();
      if (!text.trim().includes('<svg')) {
        return { dataUrl: '', sanitized: false, error: 'Invalid SVG: missing <svg> element' };
      }
      const cleaned = sanitizeSvg(text);
      const blob = new Blob([cleaned], { type: 'image/svg+xml' });
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      return { dataUrl, sanitized: true };
    } catch (e) {
      return {
        dataUrl: '',
        sanitized: false,
        error: e instanceof Error ? e.message : 'SVG sanitization failed',
      };
    }
  }

  const supported = Object.keys(MAGIC_SIGS);
  if (!supported.includes(mimeType)) {
    return { dataUrl: '', sanitized: false, error: 'Unsupported image type' };
  }

  try {
    const buffer = await file.slice(0, 12).arrayBuffer();
    if (!checkMagicBytes(buffer, mimeType)) {
      return {
        dataUrl: '',
        sanitized: false,
        error: 'File content does not match its declared type',
      };
    }
    const dataUrl = await rasterToDataUrl(file);
    return { dataUrl, sanitized: true };
  } catch (e) {
    return {
      dataUrl: '',
      sanitized: false,
      error: e instanceof Error ? e.message : 'Image processing failed',
    };
  }
}

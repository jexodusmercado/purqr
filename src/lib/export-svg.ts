import type { QrConfig } from '../types/qr-options';
import { buildLibraryOptions } from './qr-engine';
import { sanitizeFilename } from './sanitize-filename';

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportSvg(config: QrConfig): Promise<void> {
  const QRCodeStyling = (await import('qr-code-styling')).default;
  const baseOptions = buildLibraryOptions(config) as Record<string, unknown>;
  const instance = new QRCodeStyling({ ...baseOptions, type: 'svg' });
  // getRawData returns Blob in browser, Buffer in Node.js; this is browser-only code.
  const blob = new Blob(
    [(await instance.getRawData('svg')) as unknown as Blob],
    { type: 'image/svg+xml' },
  );
  triggerDownload(blob, sanitizeFilename('qr-code', 'svg'));
}

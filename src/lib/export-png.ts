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

export async function exportPng(config: QrConfig): Promise<void> {
  const QRCodeStyling = (await import('qr-code-styling')).default;
  const instance = new QRCodeStyling(buildLibraryOptions(config));
  // getRawData returns Blob in browser, Buffer in Node.js; this is browser-only code.
  const blob = new Blob(
    [(await instance.getRawData('png')) as unknown as Blob],
    { type: 'image/png' },
  );
  triggerDownload(blob, sanitizeFilename('qr-code', 'png'));
}

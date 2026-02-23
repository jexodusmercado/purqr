import type { QrConfig } from '../types/qr-options';
import { buildLibraryOptions } from './qr-engine';

export async function copyToClipboard(config: QrConfig): Promise<void> {
  if (!navigator.clipboard?.write) {
    throw new Error('Clipboard API not supported in this browser.');
  }

  const QRCodeStyling = (await import('qr-code-styling')).default;
  const instance = new QRCodeStyling(buildLibraryOptions(config));
  // getRawData returns Blob in browser; cast matches export-png pattern.
  const blob = (await instance.getRawData('png')) as unknown as Blob;

  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

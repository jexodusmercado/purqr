import type { QrConfig } from '../types/qr-options';
import { buildLibraryOptions } from './qr-engine';
import { sanitizeFilename } from './sanitize-filename';

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function exportPdf(config: QrConfig): Promise<void> {
  const QRCodeStyling = (await import('qr-code-styling')).default;
  const instance = new QRCodeStyling(buildLibraryOptions(config));
  // getRawData returns Blob in browser, Buffer in Node.js; this is browser-only code.
  const pngBlob = (await instance.getRawData('png')) as unknown as Blob;

  const dataUrl = await blobToDataUrl(pngBlob);
  const { jsPDF } = await import('jspdf');

  // Create a square PDF sized to match the QR download size.
  // Convert pixels → mm at 96 dpi (1 inch = 25.4 mm).
  const mmPerPx = 25.4 / 96;
  const sizeMm = config.downloadSize * mmPerPx;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [sizeMm, sizeMm],
  });

  doc.addImage(dataUrl, 'PNG', 0, 0, sizeMm, sizeMm);
  doc.save(sanitizeFilename('qr-code', 'pdf'));
}

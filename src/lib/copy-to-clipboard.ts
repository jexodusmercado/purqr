import type { QrConfig } from '../types/qr-options';
import { buildLibraryOptions } from './qr-engine';
import { buildShadowExtension, rasterizeSvgBlob } from './qr-extension';

export async function copyToClipboard(config: QrConfig): Promise<void> {
  if (!navigator.clipboard?.write) {
    throw new Error('Clipboard API not supported in this browser.');
  }

  const QRCodeStyling = (await import('qr-code-styling')).default;

  let blob: Blob;

  if (config.shadow.enabled) {
    // Shadow requires SVG → rasterize to PNG via canvas
    const baseOptions = buildLibraryOptions(config) as Record<string, unknown>;
    const instance = new QRCodeStyling({ ...baseOptions, type: 'svg' });
    const ext = buildShadowExtension(config.shadow);
    if (ext) instance.applyExtension(ext);
    const svgBlob = (await instance.getRawData('svg')) as unknown as Blob;
    blob = await rasterizeSvgBlob(svgBlob, config.downloadSize);
  } else {
    const instance = new QRCodeStyling(buildLibraryOptions(config));
    // getRawData returns Blob in browser; cast matches export-png pattern.
    blob = (await instance.getRawData('png')) as unknown as Blob;
  }

  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

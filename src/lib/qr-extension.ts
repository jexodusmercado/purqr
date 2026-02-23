import type { ShadowOptions } from '../types/qr-options';

const SVG_NS = 'http://www.w3.org/2000/svg';
const FILTER_ID = 'purqr-shadow';

/**
 * Creates an SVG extension function that applies a drop shadow filter.
 * The returned function is called by qr-code-styling's applyExtension API
 * with the root SVGElement after rendering.
 */
export function createShadowExtension(shadow: ShadowOptions): (svg: SVGElement, options: object) => void {
  return (svg: SVGElement) => {
    if (!shadow.enabled) return;

    // Get or create <defs>
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(SVG_NS, 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }

    // Remove existing filter to avoid duplication on updates
    const existing = defs.querySelector(`#${FILTER_ID}`);
    if (existing) {
      defs.removeChild(existing);
    }

    // Create <filter>
    const filter = document.createElementNS(SVG_NS, 'filter');
    filter.setAttribute('id', FILTER_ID);
    filter.setAttribute('x', '-20%');
    filter.setAttribute('y', '-20%');
    filter.setAttribute('width', '140%');
    filter.setAttribute('height', '140%');

    // Create <feDropShadow>
    const feDropShadow = document.createElementNS(SVG_NS, 'feDropShadow');
    feDropShadow.setAttribute('dx', String(shadow.offsetX));
    feDropShadow.setAttribute('dy', String(shadow.offsetY));
    feDropShadow.setAttribute('stdDeviation', String(shadow.blur));
    feDropShadow.setAttribute('flood-color', shadow.color);
    feDropShadow.setAttribute('flood-opacity', String(shadow.opacity));

    filter.appendChild(feDropShadow);
    defs.appendChild(filter);

    // Wrap all non-<defs> children in <g filter="url(#purqr-shadow)">
    const nonDefsChildren = Array.from(svg.childNodes).filter(
      (node) => node !== defs
    );

    if (nonDefsChildren.length > 0) {
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('filter', `url(#${FILTER_ID})`);
      nonDefsChildren.forEach((child) => {
        svg.removeChild(child);
        g.appendChild(child);
      });
      svg.appendChild(g);
    }
  };
}

/**
 * Returns undefined when shadow is disabled (no-op), or the extension
 * function when shadow is enabled. Use with qr-code-styling's applyExtension.
 */
export function buildShadowExtension(
  shadow: ShadowOptions
): ((svg: SVGElement, options: object) => void) | undefined {
  if (!shadow.enabled) return undefined;
  return createShadowExtension(shadow);
}

/**
 * Rasterizes an SVG blob to a PNG blob at the given size via canvas.
 * Used for PNG/PDF/clipboard exports when shadow is enabled (shadow requires SVG).
 */
export function rasterizeSvgBlob(svgBlob: Blob, size: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(svgBlob);
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get 2D canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0, size, size);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('canvas.toBlob returned null'));
            }
          }, 'image/png');
        } catch (err) {
          reject(err);
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG into Image'));
      };
      img.src = url;
    } catch (err) {
      URL.revokeObjectURL(url);
      reject(err);
    }
  });
}

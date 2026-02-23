import { describe, it, expect } from 'vitest';
import { buildLibraryOptions } from '../qr-engine';
import type { QrConfig } from '../../types/qr-options';

const BASE_CONFIG: QrConfig = {
  data: 'https://example.com',
  downloadSize: 1024,
  dotType: 'square',
  dotColor: '#000000',
  dotGradient: undefined,
  cornerSquareType: 'square',
  cornerSquareColor: '#000000',
  cornerDotType: 'square',
  cornerDotColor: '#000000',
  backgroundColor: '#ffffff',
  logo: undefined,
  errorCorrectionLevel: 'Q',
};

describe('buildLibraryOptions', () => {
  it('maps data field', () => {
    const opts = buildLibraryOptions(BASE_CONFIG) as Record<string, unknown>;
    expect(opts.data).toBe('https://example.com');
  });

  it('uses downloadSize for width and height by default', () => {
    const opts = buildLibraryOptions(BASE_CONFIG) as Record<string, unknown>;
    expect(opts.width).toBe(1024);
    expect(opts.height).toBe(1024);
  });

  it('uses size override when provided', () => {
    const opts = buildLibraryOptions(BASE_CONFIG, 300) as Record<string, unknown>;
    expect(opts.width).toBe(300);
    expect(opts.height).toBe(300);
  });

  it('maps dotType and dotColor into dotsOptions', () => {
    const opts = buildLibraryOptions(BASE_CONFIG) as Record<string, unknown>;
    const dots = opts.dotsOptions as Record<string, unknown>;
    expect(dots.type).toBe('square');
    expect(dots.color).toBe('#000000');
  });

  it('maps cornerSquareType and color into cornersSquareOptions', () => {
    const opts = buildLibraryOptions(BASE_CONFIG) as Record<string, unknown>;
    const corners = opts.cornersSquareOptions as Record<string, unknown>;
    expect(corners.type).toBe('square');
    expect(corners.color).toBe('#000000');
  });

  it('maps cornerDotType and color into cornersDotOptions', () => {
    const opts = buildLibraryOptions(BASE_CONFIG) as Record<string, unknown>;
    const corners = opts.cornersDotOptions as Record<string, unknown>;
    expect(corners.type).toBe('square');
    expect(corners.color).toBe('#000000');
  });

  it('maps backgroundColor into backgroundOptions', () => {
    const opts = buildLibraryOptions(BASE_CONFIG) as Record<string, unknown>;
    const bg = opts.backgroundOptions as Record<string, unknown>;
    expect(bg.color).toBe('#ffffff');
  });

  it('omits image key when logo is undefined', () => {
    const opts = buildLibraryOptions(BASE_CONFIG) as Record<string, unknown>;
    expect('image' in opts).toBe(false);
  });

  it('includes image key when logo is set', () => {
    const config: QrConfig = { ...BASE_CONFIG, logo: 'data:image/png;base64,abc123' };
    const opts = buildLibraryOptions(config) as Record<string, unknown>;
    expect(opts.image).toBe('data:image/png;base64,abc123');
  });

  it('omits gradient when dotGradient is undefined', () => {
    const opts = buildLibraryOptions(BASE_CONFIG) as Record<string, unknown>;
    const dots = opts.dotsOptions as Record<string, unknown>;
    expect('gradient' in dots).toBe(false);
  });

  it('includes gradient when dotGradient is set', () => {
    const config: QrConfig = {
      ...BASE_CONFIG,
      dotGradient: {
        type: 'linear',
        rotation: 45,
        colorStops: [
          { offset: 0, color: '#000000' },
          { offset: 1, color: '#ffffff' },
        ],
      },
    };
    const opts = buildLibraryOptions(config) as Record<string, unknown>;
    const dots = opts.dotsOptions as Record<string, unknown>;
    expect(dots.gradient).toEqual(config.dotGradient);
  });

  it('reflects changed dotType correctly', () => {
    const config: QrConfig = { ...BASE_CONFIG, dotType: 'dots' };
    const opts = buildLibraryOptions(config) as Record<string, unknown>;
    const dots = opts.dotsOptions as Record<string, unknown>;
    expect(dots.type).toBe('dots');
  });

  it('reflects all downloadSize values correctly', () => {
    const sizes = [256, 512, 1024, 2048, 4096] as const;
    for (const size of sizes) {
      const config: QrConfig = { ...BASE_CONFIG, downloadSize: size };
      const opts = buildLibraryOptions(config) as Record<string, unknown>;
      expect(opts.width).toBe(size);
      expect(opts.height).toBe(size);
    }
  });

  it('maps errorCorrectionLevel into qrOptions', () => {
    const opts = buildLibraryOptions(BASE_CONFIG) as Record<string, unknown>;
    const qrOpts = opts.qrOptions as Record<string, unknown>;
    expect(qrOpts.errorCorrectionLevel).toBe('Q');
  });

  it('reflects all errorCorrectionLevel values correctly', () => {
    const levels = ['L', 'M', 'Q', 'H'] as const;
    for (const level of levels) {
      const config: QrConfig = { ...BASE_CONFIG, errorCorrectionLevel: level };
      const opts = buildLibraryOptions(config) as Record<string, unknown>;
      const qrOpts = opts.qrOptions as Record<string, unknown>;
      expect(qrOpts.errorCorrectionLevel).toBe(level);
    }
  });
});

import { describe, it, expect } from 'vitest';
import { QR_TEMPLATES } from '../qr-templates';
import type { QrConfig, DotType, CornerSquareType, CornerDotType, QrShape } from '../../types/qr-options';

const VALID_DOT_TYPES: DotType[] = ['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'];
const VALID_CORNER_SQUARE_TYPES: CornerSquareType[] = ['dot', 'square', 'extra-rounded', 'rounded', 'dots', 'classy', 'classy-rounded'];
const VALID_CORNER_DOT_TYPES: CornerDotType[] = ['dot', 'square', 'rounded', 'dots', 'extra-rounded', 'classy', 'classy-rounded'];
const VALID_SHAPES: QrShape[] = ['square', 'circle'];

const PROTECTED_FIELDS: (keyof QrConfig)[] = ['data', 'downloadSize', 'logo', 'errorCorrectionLevel'];

describe('QR_TEMPLATES', () => {
  it('exports at least 6 templates', () => {
    expect(QR_TEMPLATES.length).toBeGreaterThanOrEqual(6);
  });

  it('every template has a unique id', () => {
    const ids = QR_TEMPLATES.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('every template has a non-empty name', () => {
    for (const template of QR_TEMPLATES) {
      expect(template.name.length).toBeGreaterThan(0);
    }
  });

  it('every template has a non-empty description', () => {
    for (const template of QR_TEMPLATES) {
      expect(template.description.length).toBeGreaterThan(0);
    }
  });

  it('every template has an overrides object', () => {
    for (const template of QR_TEMPLATES) {
      expect(typeof template.overrides).toBe('object');
      expect(template.overrides).not.toBeNull();
    }
  });

  it('no template overrides data', () => {
    for (const template of QR_TEMPLATES) {
      expect('data' in template.overrides).toBe(false);
    }
  });

  it('no template overrides downloadSize', () => {
    for (const template of QR_TEMPLATES) {
      expect('downloadSize' in template.overrides).toBe(false);
    }
  });

  it('no template overrides logo', () => {
    for (const template of QR_TEMPLATES) {
      expect('logo' in template.overrides).toBe(false);
    }
  });

  it('no template overrides errorCorrectionLevel', () => {
    for (const template of QR_TEMPLATES) {
      expect('errorCorrectionLevel' in template.overrides).toBe(false);
    }
  });

  it('every override value matches the corresponding QrConfig field type constraints', () => {
    for (const template of QR_TEMPLATES) {
      const { overrides } = template;

      // Protected fields must never appear
      for (const field of PROTECTED_FIELDS) {
        expect(field in overrides).toBe(false);
      }

      // Type-check override values against their allowed types
      if (overrides.dotType !== undefined) {
        expect(VALID_DOT_TYPES).toContain(overrides.dotType);
      }
      if (overrides.cornerSquareType !== undefined) {
        expect(VALID_CORNER_SQUARE_TYPES).toContain(overrides.cornerSquareType);
      }
      if (overrides.cornerDotType !== undefined) {
        expect(VALID_CORNER_DOT_TYPES).toContain(overrides.cornerDotType);
      }
      if (overrides.shape !== undefined) {
        expect(VALID_SHAPES).toContain(overrides.shape);
      }
      if (overrides.backgroundRound !== undefined) {
        expect(typeof overrides.backgroundRound).toBe('number');
        expect(overrides.backgroundRound).toBeGreaterThanOrEqual(0);
        expect(overrides.backgroundRound).toBeLessThanOrEqual(1);
      }
      if (overrides.shadow !== undefined) {
        expect(typeof overrides.shadow.enabled).toBe('boolean');
        expect(typeof overrides.shadow.color).toBe('string');
        expect(typeof overrides.shadow.opacity).toBe('number');
        expect(typeof overrides.shadow.blur).toBe('number');
        expect(typeof overrides.shadow.offsetX).toBe('number');
        expect(typeof overrides.shadow.offsetY).toBe('number');
      }
    }
  });
});

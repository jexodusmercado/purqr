import { describe, it, expect } from 'vitest';
import { sanitizeFilename } from '../sanitize-filename';

describe('sanitizeFilename', () => {
  it('replaces spaces with underscores', () => {
    expect(sanitizeFilename('hello world', 'png')).toBe('hello_world.png');
  });

  it('replaces path traversal characters with underscores', () => {
    expect(sanitizeFilename('../../etc/passwd', 'png')).toBe('______etc_passwd.png');
  });

  it('returns download.<ext> for empty name', () => {
    expect(sanitizeFilename('', 'svg')).toBe('download.svg');
  });

  it('returns download.<ext> for whitespace-only name', () => {
    expect(sanitizeFilename('   ', 'pdf')).toBe('download.pdf');
  });

  it('truncates names longer than 100 characters', () => {
    const longName = 'a'.repeat(150);
    const result = sanitizeFilename(longName, 'png');
    const base = result.slice(0, result.lastIndexOf('.'));
    expect(base.length).toBe(100);
    expect(result).toBe('a'.repeat(100) + '.png');
  });

  it('accepts extension with or without leading dot', () => {
    expect(sanitizeFilename('file', '.png')).toBe('file.png');
    expect(sanitizeFilename('file', 'png')).toBe('file.png');
  });

  it('keeps alphanumeric, underscores, and dashes intact', () => {
    expect(sanitizeFilename('my-qr_code', 'png')).toBe('my-qr_code.png');
  });

  it('replaces dots in filename with underscores', () => {
    expect(sanitizeFilename('file.name', 'png')).toBe('file_name.png');
  });

  it('handles all-special-char names by producing underscores', () => {
    const result = sanitizeFilename('!!!', 'png');
    expect(result).toBe('___.png');
  });

  it('handles normal QR code filename', () => {
    expect(sanitizeFilename('qr-code', 'png')).toBe('qr-code.png');
    expect(sanitizeFilename('qr-code', 'svg')).toBe('qr-code.svg');
    expect(sanitizeFilename('qr-code', 'pdf')).toBe('qr-code.pdf');
  });
});

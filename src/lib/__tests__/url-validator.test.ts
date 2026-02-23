import { describe, it, expect } from 'vitest';
import { validateUrl } from '../url-validator';

describe('validateUrl', () => {
  it('returns invalid with empty message for empty string', () => {
    expect(validateUrl('')).toEqual({ isValid: false, message: '' });
  });

  it('returns invalid with empty message for whitespace-only string', () => {
    expect(validateUrl('   ')).toEqual({ isValid: false, message: '' });
  });

  it('returns valid with no message for https URL', () => {
    expect(validateUrl('https://example.com')).toEqual({ isValid: true, message: '' });
  });

  it('returns valid with no message for http URL', () => {
    expect(validateUrl('http://localhost:3000')).toEqual({ isValid: true, message: '' });
  });

  it('returns valid with no message for URL with path and query', () => {
    expect(validateUrl('https://example.com/path?q=1&foo=bar')).toEqual({ isValid: true, message: '' });
  });

  it('returns valid with advisory message for non-URL text', () => {
    const result = validateUrl('not a url');
    expect(result.isValid).toBe(true);
    expect(result.message).not.toBe('');
    expect(result.message.length).toBeGreaterThan(0);
  });

  it('returns valid with advisory message for plain word', () => {
    const result = validateUrl('hello');
    expect(result.isValid).toBe(true);
    expect(result.message).not.toBe('');
  });

  it('advisory message mentions QR code generation', () => {
    const result = validateUrl('not-a-url');
    expect(result.message).toMatch(/QR code/i);
  });

  it('has no side effects — repeated calls return same result', () => {
    const first = validateUrl('https://example.com');
    const second = validateUrl('https://example.com');
    expect(first).toEqual(second);
  });
});

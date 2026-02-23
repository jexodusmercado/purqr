/**
 * Sanitizes a filename for safe download.
 * Replaces all non-alphanumeric/underscore/dash chars with underscores,
 * truncates the base name to 100 characters, and appends the given extension.
 */
export function sanitizeFilename(name: string, ext: string): string {
  const baseName = name.trim() || 'download';
  // Replace all unsafe characters (including dots and path separators) with underscores
  const sanitized = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
  // Truncate to 100 chars; fall back to 'download' if result is empty
  const truncated = sanitized.slice(0, 100) || 'download';
  const cleanExt = ext.startsWith('.') ? ext.slice(1) : ext;
  return `${truncated}.${cleanExt}`;
}

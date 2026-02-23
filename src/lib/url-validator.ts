const DANGEROUS_SCHEMES = ['javascript:', 'data:', 'vbscript:', 'file:'];

export function validateUrl(input: string): { isValid: boolean; message: string } {
  // Strip leading whitespace and null bytes before any other check
  const cleaned = input.replace(/^[\s\0]+/, '');

  if (cleaned === '') {
    return { isValid: false, message: '' };
  }

  // Block dangerous URI schemes (case-insensitive)
  const lower = cleaned.toLowerCase();
  for (const scheme of DANGEROUS_SCHEMES) {
    if (lower.startsWith(scheme)) {
      return { isValid: false, message: 'This URL scheme is not allowed.' };
    }
  }

  try {
    new URL(cleaned);
    return { isValid: true, message: '' };
  } catch {
    return {
      isValid: true,
      message: "This doesn't look like a valid URL, but a QR code will still be generated.",
    };
  }
}

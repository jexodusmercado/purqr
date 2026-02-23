export function validateUrl(input: string): { isValid: boolean; message: string } {
  if (input.trim() === '') {
    return { isValid: false, message: '' };
  }

  try {
    new URL(input);
    return { isValid: true, message: '' };
  } catch {
    return {
      isValid: true,
      message: "This doesn't look like a valid URL, but a QR code will still be generated.",
    };
  }
}

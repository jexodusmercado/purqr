'use client';

import { useState } from 'react';
import { Input } from '../ui/Input';
import { useQrStore } from '../../stores/qr-store';
import { validateUrl } from '../../lib/url-validator';

export function UrlInput() {
  const setData = useQrStore((s) => s.setData);
  const [localValue, setLocalValue] = useState('');
  const [helperText, setHelperText] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setLocalValue(value);
    setData(value);
  }

  function handleBlur() {
    const { message } = validateUrl(localValue);
    setHelperText(message);
  }

  return (
    <Input
      label="URL"
      placeholder="https://example.com"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      helperText={helperText}
    />
  );
}

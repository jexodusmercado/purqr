'use client';

import { useState } from 'react';
import { Input } from '../ui/Input';
import { useQrStore } from '../../stores/qr-store';
import { validateUrl } from '../../lib/url-validator';

export function UrlInput() {
  const data = useQrStore((s) => s.data);
  const setData = useQrStore((s) => s.setData);
  const [helperText, setHelperText] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setData(e.target.value);
  }

  function handleBlur() {
    const { message } = validateUrl(data);
    setHelperText(message);
  }

  return (
    <Input
      label="URL"
      placeholder="https://example.com"
      value={data}
      onChange={handleChange}
      onBlur={handleBlur}
      helperText={helperText}
    />
  );
}

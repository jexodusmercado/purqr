'use client';

import { useEffect, useState } from 'react';
import { Input } from '../ui/Input';
import { useQrStore } from '../../stores/qr-store';
import { validateUrl } from '../../lib/url-validator';

export function UrlInput() {
  const setData = useQrStore((s) => s.setData);
  const [localValue, setLocalValue] = useState('');
  const [helperText, setHelperText] = useState('');

  // Debounce store update 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setData(localValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue, setData]);

  function handleBlur() {
    const { message } = validateUrl(localValue);
    setHelperText(message);
  }

  return (
    <Input
      label="URL"
      placeholder="https://example.com"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      helperText={helperText}
    />
  );
}

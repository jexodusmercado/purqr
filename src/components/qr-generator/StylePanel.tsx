'use client';

import { useQrStore } from '../../stores/qr-store';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import type { DotType, CornerSquareType, CornerDotType } from '../../types/qr-options';

const DOT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
];

const CORNER_SQUARE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
];

const CORNER_DOT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
];

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-14 cursor-pointer rounded border border-gray-300 p-1"
        />
        <span className="font-mono text-sm text-gray-500">{value.toUpperCase()}</span>
      </div>
    </div>
  );
}

export function StylePanel() {
  const store = useQrStore();

  return (
    <div className="flex flex-col gap-4">
      <Select
        label="Dot Style"
        options={DOT_TYPE_OPTIONS}
        value={store.dotType}
        onChange={(e) => store.setDotType(e.target.value as DotType)}
      />
      <ColorField
        label="Dot Color"
        value={store.dotColor}
        onChange={store.setDotColor}
      />
      <Select
        label="Corner Square Style"
        options={CORNER_SQUARE_TYPE_OPTIONS}
        value={store.cornerSquareType}
        onChange={(e) => store.setCornerSquareType(e.target.value as CornerSquareType)}
      />
      <ColorField
        label="Corner Square Color"
        value={store.cornerSquareColor}
        onChange={store.setCornerSquareColor}
      />
      <Select
        label="Corner Dot Style"
        options={CORNER_DOT_TYPE_OPTIONS}
        value={store.cornerDotType}
        onChange={(e) => store.setCornerDotType(e.target.value as CornerDotType)}
      />
      <ColorField
        label="Corner Dot Color"
        value={store.cornerDotColor}
        onChange={store.setCornerDotColor}
      />
      <ColorField
        label="Background Color"
        value={store.backgroundColor}
        onChange={store.setBackgroundColor}
      />
      <Input
        label="Logo URL (optional)"
        type="url"
        placeholder="https://example.com/logo.png"
        value={store.logoUrl ?? ''}
        onChange={(e) => store.setLogoUrl(e.target.value || undefined)}
        helperText="Enter a publicly accessible image URL to embed as a logo"
      />
    </div>
  );
}

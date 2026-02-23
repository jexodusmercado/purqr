'use client';

import { useQrStore } from '../../stores/qr-store';
import { Select } from '../ui/Select';
import { LogoUpload } from './LogoUpload';
import type { DotType, CornerSquareType, CornerDotType, GradientOptions, ErrorCorrectionLevel } from '../../types/qr-options';

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

const GRADIENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
];

const ERROR_CORRECTION_OPTIONS: { value: string; label: string }[] = [
  { value: 'L', label: 'L — Low (7% recovery)' },
  { value: 'M', label: 'M — Medium (15% recovery)' },
  { value: 'Q', label: 'Q — Quartile (25% recovery)' },
  { value: 'H', label: 'H — High (30% recovery, use with logo)' },
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

const DEFAULT_GRADIENT: GradientOptions = {
  type: 'linear',
  rotation: 0,
  colorStops: [
    { offset: 0, color: '#000000' },
    { offset: 1, color: '#666666' },
  ],
};

export function StylePanel() {
  const store = useQrStore();
  const gradientEnabled = store.dotGradient !== undefined;

  function handleGradientToggle(enabled: boolean) {
    if (enabled) {
      store.setDotGradient({ ...DEFAULT_GRADIENT });
    } else {
      store.setDotGradient(undefined);
    }
  }

  function handleGradientType(type: 'linear' | 'radial') {
    if (!store.dotGradient) return;
    store.setDotGradient({ ...store.dotGradient, type });
  }

  function handleGradientRotation(rotation: number) {
    if (!store.dotGradient) return;
    store.setDotGradient({ ...store.dotGradient, rotation });
  }

  function handleGradientColorStop(index: 0 | 1, color: string) {
    if (!store.dotGradient) return;
    const colorStops = store.dotGradient.colorStops.map((stop, i) =>
      i === index ? { ...stop, color } : stop
    );
    store.setDotGradient({ ...store.dotGradient, colorStops });
  }

  return (
    <div className="flex flex-col gap-4">
      <Select
        label="Dot Style"
        options={DOT_TYPE_OPTIONS}
        value={store.dotType}
        onChange={(e) => store.setDotType(e.target.value as DotType)}
      />

      {!gradientEnabled && (
        <ColorField
          label="Dot Color"
          value={store.dotColor}
          onChange={store.setDotColor}
        />
      )}

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={gradientEnabled}
            onChange={(e) => handleGradientToggle(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm font-medium text-gray-700">Use Gradient for Dots</span>
        </label>

        {gradientEnabled && store.dotGradient && (
          <div className="ml-6 flex flex-col gap-3 border-l-2 border-blue-100 pl-4">
            <Select
              label="Gradient Type"
              options={GRADIENT_TYPE_OPTIONS}
              value={store.dotGradient.type}
              onChange={(e) => handleGradientType(e.target.value as 'linear' | 'radial')}
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="gradient-rotation" className="text-sm font-medium text-gray-700">
                Rotation (0–360°)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="gradient-rotation"
                  type="range"
                  min={0}
                  max={360}
                  value={store.dotGradient.rotation}
                  onChange={(e) => handleGradientRotation(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-right font-mono text-sm text-gray-500">
                  {store.dotGradient.rotation}°
                </span>
              </div>
            </div>
            <ColorField
              label="Gradient Start Color"
              value={store.dotGradient.colorStops[0].color}
              onChange={(color) => handleGradientColorStop(0, color)}
            />
            <ColorField
              label="Gradient End Color"
              value={store.dotGradient.colorStops[1].color}
              onChange={(color) => handleGradientColorStop(1, color)}
            />
          </div>
        )}
      </div>

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
      <LogoUpload />
      <Select
        label="Error Correction Level"
        options={ERROR_CORRECTION_OPTIONS}
        value={store.errorCorrectionLevel}
        onChange={(e) => store.setErrorCorrectionLevel(e.target.value as ErrorCorrectionLevel)}
      />
    </div>
  );
}

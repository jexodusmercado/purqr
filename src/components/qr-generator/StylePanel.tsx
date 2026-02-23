'use client';

import { useQrStore } from '../../stores/qr-store';
import { Select } from '../ui/Select';
import { LogoUpload } from './LogoUpload';
import type {
  DotType,
  CornerSquareType,
  CornerDotType,
  GradientOptions,
  ErrorCorrectionLevel,
  QrShape,
} from '../../types/qr-options';

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
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
];

const CORNER_DOT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
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

const QR_SHAPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'circle', label: 'Circle' },
];

const DEFAULT_GRADIENT: GradientOptions = {
  type: 'linear',
  rotation: 0,
  colorStops: [
    { offset: 0, color: '#000000' },
    { offset: 1, color: '#666666' },
  ],
};

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

interface GradientControlsProps {
  label: string;
  gradient: GradientOptions | undefined;
  fallbackColor: string;
  onGradientChange: (gradient: GradientOptions | undefined) => void;
  onColorChange: (color: string) => void;
}

function GradientControls({
  label,
  gradient,
  fallbackColor,
  onGradientChange,
  onColorChange,
}: GradientControlsProps) {
  const enabled = gradient !== undefined;

  function handleToggle(checked: boolean) {
    if (checked) {
      onGradientChange({ ...DEFAULT_GRADIENT });
    } else {
      onGradientChange(undefined);
    }
  }

  function handleColorStop(index: 0 | 1, color: string) {
    if (!gradient) return;
    const colorStops = gradient.colorStops.map((stop, i) =>
      i === index ? { ...stop, color } : stop
    );
    onGradientChange({ ...gradient, colorStops });
  }

  return (
    <div className="flex flex-col gap-3">
      {!enabled && (
        <ColorField label={label} value={fallbackColor} onChange={onColorChange} />
      )}

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => handleToggle(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600"
        />
        <span className="text-sm font-medium text-gray-700">Use Gradient</span>
      </label>

      {enabled && gradient && (
        <div className="ml-6 flex flex-col gap-3 border-l-2 border-blue-100 pl-4">
          <Select
            label="Gradient Type"
            options={GRADIENT_TYPE_OPTIONS}
            value={gradient.type}
            onChange={(e) => onGradientChange({ ...gradient, type: e.target.value as 'linear' | 'radial' })}
          />
          <div className="flex flex-col gap-1">
            <label htmlFor={`${label.toLowerCase().replace(/\s+/g, '-')}-rotation`} className="text-sm font-medium text-gray-700">
              Rotation (0–360°)
            </label>
            <div className="flex items-center gap-3">
              <input
                id={`${label.toLowerCase().replace(/\s+/g, '-')}-rotation`}
                type="range"
                min={0}
                max={360}
                value={gradient.rotation}
                onChange={(e) => onGradientChange({ ...gradient, rotation: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="w-12 text-right font-mono text-sm text-gray-500">
                {gradient.rotation}°
              </span>
            </div>
          </div>
          <ColorField
            label="Start Color"
            value={gradient.colorStops[0]?.color ?? '#000000'}
            onChange={(color) => handleColorStop(0, color)}
          />
          <ColorField
            label="End Color"
            value={gradient.colorStops[1]?.color ?? '#ffffff'}
            onChange={(color) => handleColorStop(1, color)}
          />
        </div>
      )}
    </div>
  );
}

export function StylePanel() {
  const store = useQrStore();

  return (
    <div className="flex flex-col gap-3">

      {/* Dot Style */}
      <details open>
        <summary className="cursor-pointer select-none text-sm font-semibold text-gray-800 py-1">
          Dot Style
        </summary>
        <div className="mt-3 flex flex-col gap-4 pl-1">
          <Select
            label="Dot Style"
            options={DOT_TYPE_OPTIONS}
            value={store.dotType}
            onChange={(e) => store.setDotType(e.target.value as DotType)}
          />
          <GradientControls
            label="Dot Color"
            gradient={store.dotGradient}
            fallbackColor={store.dotColor}
            onGradientChange={store.setDotGradient}
            onColorChange={store.setDotColor}
          />
        </div>
      </details>

      <hr className="border-gray-100" />

      {/* Finder Patterns */}
      <details open>
        <summary className="cursor-pointer select-none text-sm font-semibold text-gray-800 py-1">
          Finder Patterns
        </summary>
        <div className="mt-3 flex flex-col gap-4 pl-1">
          <Select
            label="Corner Square Style"
            options={CORNER_SQUARE_TYPE_OPTIONS}
            value={store.cornerSquareType}
            onChange={(e) => store.setCornerSquareType(e.target.value as CornerSquareType)}
          />
          <GradientControls
            label="Corner Square Color"
            gradient={store.cornerSquareGradient}
            fallbackColor={store.cornerSquareColor}
            onGradientChange={store.setCornerSquareGradient}
            onColorChange={store.setCornerSquareColor}
          />
          <Select
            label="Corner Dot Style"
            options={CORNER_DOT_TYPE_OPTIONS}
            value={store.cornerDotType}
            onChange={(e) => store.setCornerDotType(e.target.value as CornerDotType)}
          />
          <GradientControls
            label="Corner Dot Color"
            gradient={store.cornerDotGradient}
            fallbackColor={store.cornerDotColor}
            onGradientChange={store.setCornerDotGradient}
            onColorChange={store.setCornerDotColor}
          />
        </div>
      </details>

      <hr className="border-gray-100" />

      {/* Background */}
      <details open>
        <summary className="cursor-pointer select-none text-sm font-semibold text-gray-800 py-1">
          Background
        </summary>
        <div className="mt-3 flex flex-col gap-4 pl-1">
          <GradientControls
            label="Background Color"
            gradient={store.backgroundGradient}
            fallbackColor={store.backgroundColor}
            onGradientChange={store.setBackgroundGradient}
            onColorChange={store.setBackgroundColor}
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="background-round" className="text-sm font-medium text-gray-700">
              Background Rounding (0–1)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="background-round"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={store.backgroundRound}
                onChange={(e) => store.setBackgroundRound(Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-right font-mono text-sm text-gray-500">
                {store.backgroundRound.toFixed(2)}
              </span>
            </div>
          </div>
          <Select
            label="QR Shape"
            options={QR_SHAPE_OPTIONS}
            value={store.shape}
            onChange={(e) => store.setShape(e.target.value as QrShape)}
          />
        </div>
      </details>

      <hr className="border-gray-100" />

      {/* Logo Options — only show controls when logo is present */}
      <details open={!!store.logo}>
        <summary className="cursor-pointer select-none text-sm font-semibold text-gray-800 py-1">
          Logo Options
        </summary>
        <div className="mt-3 flex flex-col gap-4 pl-1">
          <LogoUpload />
          {store.logo && (
            <>
              <div className="flex flex-col gap-1">
                <label htmlFor="image-size" className="text-sm font-medium text-gray-700">
                  Logo Size (0.1–0.5)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="image-size"
                    type="range"
                    min={0.1}
                    max={0.5}
                    step={0.01}
                    value={store.imageSize}
                    onChange={(e) => store.setImageSize(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-mono text-sm text-gray-500">
                    {store.imageSize.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="image-margin" className="text-sm font-medium text-gray-700">
                  Logo Margin (0–50px)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="image-margin"
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={store.imageMargin}
                    onChange={(e) => store.setImageMargin(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-mono text-sm text-gray-500">
                    {store.imageMargin}px
                  </span>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={store.hideBackgroundDots}
                  onChange={(e) => store.setHideBackgroundDots(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Hide Background Dots Under Logo</span>
              </label>
            </>
          )}
        </div>
      </details>

      <hr className="border-gray-100" />

      {/* Effects — closed by default */}
      <details>
        <summary className="cursor-pointer select-none text-sm font-semibold text-gray-800 py-1">
          Effects
        </summary>
        <div className="mt-3 flex flex-col gap-4 pl-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={store.shadow.enabled}
              onChange={(e) => store.setShadow({ ...store.shadow, enabled: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">Enable Drop Shadow</span>
          </label>

          {store.shadow.enabled && (
            <div className="ml-6 flex flex-col gap-3 border-l-2 border-blue-100 pl-4">
              <ColorField
                label="Shadow Color"
                value={store.shadow.color}
                onChange={(color) => store.setShadow({ ...store.shadow, color })}
              />
              <div className="flex flex-col gap-1">
                <label htmlFor="shadow-opacity" className="text-sm font-medium text-gray-700">
                  Opacity (0–1)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="shadow-opacity"
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={store.shadow.opacity}
                    onChange={(e) => store.setShadow({ ...store.shadow, opacity: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-mono text-sm text-gray-500">
                    {store.shadow.opacity.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="shadow-blur" className="text-sm font-medium text-gray-700">
                  Blur (0–30)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="shadow-blur"
                    type="range"
                    min={0}
                    max={30}
                    step={1}
                    value={store.shadow.blur}
                    onChange={(e) => store.setShadow({ ...store.shadow, blur: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-mono text-sm text-gray-500">
                    {store.shadow.blur}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="shadow-offset-x" className="text-sm font-medium text-gray-700">
                  Offset X (-20 to 20)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="shadow-offset-x"
                    type="range"
                    min={-20}
                    max={20}
                    step={1}
                    value={store.shadow.offsetX}
                    onChange={(e) => store.setShadow({ ...store.shadow, offsetX: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-mono text-sm text-gray-500">
                    {store.shadow.offsetX}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="shadow-offset-y" className="text-sm font-medium text-gray-700">
                  Offset Y (-20 to 20)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="shadow-offset-y"
                    type="range"
                    min={-20}
                    max={20}
                    step={1}
                    value={store.shadow.offsetY}
                    onChange={(e) => store.setShadow({ ...store.shadow, offsetY: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-mono text-sm text-gray-500">
                    {store.shadow.offsetY}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </details>

      <hr className="border-gray-100" />

      {/* Error Correction */}
      <details open>
        <summary className="cursor-pointer select-none text-sm font-semibold text-gray-800 py-1">
          Error Correction
        </summary>
        <div className="mt-3 pl-1">
          <Select
            label="Error Correction Level"
            options={ERROR_CORRECTION_OPTIONS}
            value={store.errorCorrectionLevel}
            onChange={(e) => store.setErrorCorrectionLevel(e.target.value as ErrorCorrectionLevel)}
          />
        </div>
      </details>

    </div>
  );
}

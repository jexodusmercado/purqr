'use client';

import { useQrStore } from '../../stores/qr-store';
import { QR_TEMPLATES } from '../../lib/qr-templates';

export function TemplatePanel() {
  const applyTemplate = useQrStore((s) => s.applyTemplate);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">Templates</span>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {QR_TEMPLATES.map((template) => {
          // Derive primary color for swatch from template overrides
          const primaryColor =
            template.overrides.dotGradient?.colorStops?.[0]?.color ??
            template.overrides.dotColor ??
            '#000000';
          const secondaryColor =
            template.overrides.dotGradient?.colorStops?.[1]?.color ??
            template.overrides.backgroundColor ??
            '#ffffff';

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => applyTemplate(template.overrides)}
              className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer rounded-lg border border-gray-200 p-2 hover:border-blue-400 hover:shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              title={template.description}
            >
              {/* Color swatch: 12×12 circle split between primary and secondary */}
              <div
                className="w-12 h-12 rounded-md border border-gray-200"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 50%, ${secondaryColor} 50%)`,
                }}
                aria-hidden="true"
              />
              <span className="text-xs text-gray-600 text-center w-14 leading-tight">
                {template.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

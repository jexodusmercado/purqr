'use client';

import { useEffect, useRef, useState } from 'react';
import { useQrStore } from '../../stores/qr-store';
import {
  buildLibraryOptions,
  createQrInstance,
  updateQrInstance,
} from '../../lib/qr-engine';

const PREVIEW_SIZE = 300;

export function QrPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const store = useQrStore();

  const {
    data,
    dotType,
    dotColor,
    dotGradient,
    cornerSquareType,
    cornerSquareColor,
    cornerDotType,
    cornerDotColor,
    backgroundColor,
    logoUrl,
    errorCorrectionLevel,
  } = store;

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (!containerRef.current) return;

      if (!data) {
        if (instanceRef.current) {
          containerRef.current.innerHTML = '';
          instanceRef.current = null;
        }
        setRenderError(null);
        return;
      }

      try {
        const options = buildLibraryOptions(store, PREVIEW_SIZE);

        if (!instanceRef.current) {
          instanceRef.current = await createQrInstance(
            containerRef.current,
            options
          );
        } else {
          await updateQrInstance(instanceRef.current, options);
        }
        setRenderError(null);
      } catch {
        containerRef.current.innerHTML = '';
        instanceRef.current = null;
        setRenderError('Preview failed. Check your logo URL or try again.');
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    dotType,
    dotColor,
    dotGradient,
    cornerSquareType,
    cornerSquareColor,
    cornerDotType,
    cornerDotColor,
    backgroundColor,
    logoUrl,
    errorCorrectionLevel,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    const container = containerRef.current;
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (container) {
        container.innerHTML = '';
      }
      instanceRef.current = null;
    };
  }, []);

  return (
    <div
      style={{ width: `${PREVIEW_SIZE}px`, height: `${PREVIEW_SIZE}px` }}
      className="relative flex-shrink-0"
    >
      <div
        ref={containerRef}
        style={{ width: `${PREVIEW_SIZE}px`, height: `${PREVIEW_SIZE}px` }}
        className="absolute inset-0"
      />
      {!data && !renderError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded text-center text-sm text-gray-500 px-4">
          Enter a URL to generate a QR code
        </div>
      )}
      {renderError && (
        <div
          role="alert"
          className="absolute inset-0 flex items-center justify-center bg-red-50 rounded text-center text-sm text-red-600 px-4"
        >
          {renderError}
        </div>
      )}
    </div>
  );
}

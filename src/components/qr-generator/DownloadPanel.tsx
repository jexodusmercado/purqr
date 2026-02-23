'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { useQrStore } from '../../stores/qr-store';
import { exportPng } from '../../lib/export-png';
import { exportSvg } from '../../lib/export-svg';
import { exportPdf } from '../../lib/export-pdf';
import type { QrConfig } from '../../types/qr-options';

type LoadingState = { png: boolean; svg: boolean; pdf: boolean };

export function DownloadPanel() {
  const store = useQrStore();
  const [loading, setLoading] = useState<LoadingState>({ png: false, svg: false, pdf: false });

  const isDisabled = store.data === '';

  const config: QrConfig = {
    data: store.data,
    downloadSize: store.downloadSize,
    dotType: store.dotType,
    dotColor: store.dotColor,
    dotGradient: store.dotGradient,
    cornerSquareType: store.cornerSquareType,
    cornerSquareColor: store.cornerSquareColor,
    cornerDotType: store.cornerDotType,
    cornerDotColor: store.cornerDotColor,
    backgroundColor: store.backgroundColor,
    logoUrl: store.logoUrl,
  };

  async function handleExport(
    format: keyof LoadingState,
    fn: (config: QrConfig) => Promise<void>,
  ) {
    setLoading((prev) => ({ ...prev, [format]: true }));
    try {
      await fn(config);
    } catch {
      // Swallow export errors — no unhandled promise rejections
    } finally {
      setLoading((prev) => ({ ...prev, [format]: false }));
    }
  }

  return (
    <div className="flex gap-3">
      <Button
        variant="primary"
        loading={loading.png}
        disabled={isDisabled}
        onClick={() => handleExport('png', exportPng)}
      >
        PNG
      </Button>
      <Button
        variant="primary"
        loading={loading.svg}
        disabled={isDisabled}
        onClick={() => handleExport('svg', exportSvg)}
      >
        SVG
      </Button>
      <Button
        variant="primary"
        loading={loading.pdf}
        disabled={isDisabled}
        onClick={() => handleExport('pdf', exportPdf)}
      >
        PDF
      </Button>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { useQrStore } from '../../stores/qr-store';
import { exportPng } from '../../lib/export-png';
import { exportSvg } from '../../lib/export-svg';
import { exportPdf } from '../../lib/export-pdf';
import { copyToClipboard } from '../../lib/copy-to-clipboard';
import type { QrConfig } from '../../types/qr-options';

type LoadingState = { png: boolean; svg: boolean; pdf: boolean; copy: boolean };

export function DownloadPanel() {
  const store = useQrStore();
  const [loading, setLoading] = useState<LoadingState>({ png: false, svg: false, pdf: false, copy: false });
  const [exportError, setExportError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

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
    errorCorrectionLevel: store.errorCorrectionLevel,
  };

  async function handleExport(
    format: keyof LoadingState,
    fn: (config: QrConfig) => Promise<void>,
  ) {
    setExportError(null);
    setLoading((prev) => ({ ...prev, [format]: true }));
    try {
      await fn(config);
    } catch {
      setExportError(`${format.toUpperCase()} export failed. Please try again.`);
    } finally {
      setLoading((prev) => ({ ...prev, [format]: false }));
    }
  }

  async function handleCopy() {
    setExportError(null);
    setCopySuccess(false);
    setLoading((prev) => ({ ...prev, copy: true }));
    try {
      await copyToClipboard(config);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    } catch {
      setExportError('Copy failed. Your browser may not support copying images.');
    } finally {
      setLoading((prev) => ({ ...prev, copy: false }));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3">
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
        <Button
          variant="outline"
          loading={loading.copy}
          disabled={isDisabled}
          onClick={handleCopy}
        >
          {copySuccess ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      {exportError && (
        <p className="text-sm text-red-600" role="alert">{exportError}</p>
      )}
    </div>
  );
}

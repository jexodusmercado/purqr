'use client';

import { Select } from '../ui/Select';
import { useQrStore } from '../../stores/qr-store';
import type { DownloadSize } from '../../types/qr-options';

const SIZE_OPTIONS = [256, 512, 1024, 2048, 4096] as const;

export function SizeSelector() {
  const downloadSize = useQrStore((s) => s.downloadSize);
  const setDownloadSize = useQrStore((s) => s.setDownloadSize);

  return (
    <Select
      label="Download Size"
      value={String(downloadSize)}
      options={SIZE_OPTIONS.map((size) => ({
        value: String(size),
        label: `${size} x ${size} px`,
      }))}
      onChange={(e) => setDownloadSize(Number(e.target.value) as DownloadSize)}
    />
  );
}

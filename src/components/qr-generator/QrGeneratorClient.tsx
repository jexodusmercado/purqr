'use client';

import { UrlInput } from './UrlInput';
import { SizeSelector } from './SizeSelector';
import { DownloadPanel } from './DownloadPanel';
import { QrPreview } from './QrPreview';

export function QrGeneratorClient() {
  return (
    <div className="md:grid md:grid-cols-2 md:gap-8">
      <div className="flex flex-col gap-6">
        <UrlInput />
        <SizeSelector />
        <DownloadPanel />
      </div>
      <div className="mt-8 md:mt-0 flex justify-center md:justify-start">
        <QrPreview />
      </div>
    </div>
  );
}

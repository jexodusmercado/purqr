'use client';

import { useRef, useState } from 'react';
import { useQrStore } from '../../stores/qr-store';

const ACCEPTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'image/webp',
  'image/gif',
];

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function LogoUpload() {
  const store = useQrStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  async function processFile(file: File) {
    setError(null);

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      setError('Unsupported file type. Use PNG, JPEG, SVG, WebP, or GIF.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('File exceeds 2 MB limit. Please use a smaller image.');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      store.setLogo(dataUrl);
      store.setErrorCorrectionLevel('H');
      setFilename(file.name);
    } catch {
      setError('Failed to read file. Please try again.');
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so the same file can be re-selected after removal
    e.target.value = '';
  }

  function handleRemove() {
    store.setLogo(undefined);
    setFilename(null);
    setError(null);
  }

  const hasLogo = Boolean(store.logo);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">Logo (optional)</span>

      {!hasLogo ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload logo — drop file here or click to browse"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={[
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100',
          ].join(' ')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-sm text-gray-500">
            Drop logo here or{' '}
            <span className="font-medium text-blue-600">click to browse</span>
          </p>
          <p className="text-xs text-gray-400">PNG, JPEG, SVG, WebP, GIF · max 2 MB</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={store.logo}
            alt="Logo preview"
            className="h-16 w-16 rounded object-contain border border-gray-200 bg-white"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {filename && (
              <p className="truncate text-sm font-medium text-gray-700">{filename}</p>
            )}
            <p className="text-xs text-gray-400">Error correction set to H for best scannability</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

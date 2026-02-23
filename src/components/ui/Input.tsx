import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'px-3 py-2 rounded-md border text-sm outline-none transition-colors',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {!error && helperText && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
}

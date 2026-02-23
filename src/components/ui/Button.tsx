import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 border border-transparent',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 border border-transparent',
  outline: 'bg-transparent text-gray-900 hover:bg-gray-50 border border-gray-300',
};

export function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
        variantClasses[variant],
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

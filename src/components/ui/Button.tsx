// ─────────────────────────────────────────────────────────────────────────────
// src/components/ui/Button.tsx
//
// Changes from original:
//   1. `primary` variant uses emerald instead of violet (fintech green palette)
//   2. All other variants unchanged
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  loading?:   boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
  children:   React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // Emerald replaces violet as the primary brand action colour
  primary: `
    bg-emerald-600 text-white border border-emerald-600
    hover:bg-emerald-700 hover:border-emerald-700
    active:bg-emerald-800
    shadow-sm hover:shadow-md
    dark:bg-emerald-600 dark:hover:bg-emerald-500
  `,
  secondary: `
    bg-white text-slate-700 border border-slate-200
    hover:bg-slate-50 hover:border-slate-300
    active:bg-slate-100
    shadow-card hover:shadow-card-md
    dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600
    dark:hover:bg-slate-600
  `,
  ghost: `
    bg-transparent text-slate-600 border border-transparent
    hover:bg-slate-100 hover:text-slate-900
    active:bg-slate-200
    dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100
  `,
  danger: `
    bg-rose-50 text-rose-700 border border-rose-200
    hover:bg-rose-600 hover:text-white hover:border-rose-600
    active:bg-rose-700
    dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800
    dark:hover:bg-rose-600 dark:hover:text-white
  `,
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2   gap-2',
  lg: 'text-sm px-5 py-2.5 gap-2.5',
};

export function Button({
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-xl
        transition-all duration-200
        select-none whitespace-nowrap
        ${SIZE_CLASSES[size]}
        ${VARIANT_CLASSES[variant]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}

      <span>{children}</span>

      {rightIcon && !loading && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
}
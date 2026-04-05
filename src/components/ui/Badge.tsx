// ─────────────────────────────────────────────────────────────────────────────
// src/components/ui/Badge.tsx
// Small pill-shaped label used to show transaction type, category,
// or any status indicator throughout the UI.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

type BadgeVariant = 'income' | 'expense' | 'neutral' | 'info' | 'warning';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

/** Colour mappings for each semantic variant */
const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  income:  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  expense: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
  info:    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
};

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-0.5
        text-xs font-medium
        rounded-full border
        whitespace-nowrap
        ${VARIANT_CLASSES[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dot indicator — small coloured circle used in legend items
// ─────────────────────────────────────────────────────────────────────────────

interface DotProps {
  color: string;
  size?: 'sm' | 'md';
}

export function Dot({ color, size = 'md' }: DotProps) {
  const sizeClass = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  return (
    <span
      className={`${sizeClass} rounded-full flex-shrink-0`}
      style={{ backgroundColor: color }}
    />
  );
}
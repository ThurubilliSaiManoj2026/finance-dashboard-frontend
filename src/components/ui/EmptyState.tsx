// ─────────────────────────────────────────────────────────────────────────────
// src/components/ui/EmptyState.tsx
// Rendered whenever a filtered list or section has zero items.
// A well-designed empty state communicates clearly, offers a next action,
// and prevents the UI from feeling broken.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { SearchX, PlusCircle, BarChart2 } from 'lucide-react';
import { Button } from './Button';

type EmptyStateVariant = 'search' | 'transactions' | 'insights';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  /** Label for the optional action button */
  actionLabel?: string;
  onAction?: () => void;
}

// Default content for each variant
const VARIANTS = {
  search: {
    Icon: SearchX,
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you\'re looking for.',
    color: 'text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-700',
  },
  transactions: {
    Icon: PlusCircle,
    title: 'No transactions yet',
    description: 'Add your first transaction to start tracking your financial activity.',
    color: 'text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
  },
  insights: {
    Icon: BarChart2,
    title: 'Not enough data',
    description: 'Add at least two months of transactions to see spending insights and trends.',
    color: 'text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
};

export function EmptyState({
  variant = 'search',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { Icon, title: defaultTitle, description: defaultDesc, color, bg } = VARIANTS[variant];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {/* Icon container */}
      <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mb-4`}>
        <Icon size={24} className={color} />
      </div>

      {/* Heading */}
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
        {title ?? defaultTitle}
      </h3>

      {/* Description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
        {description ?? defaultDesc}
      </p>

      {/* Optional CTA */}
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
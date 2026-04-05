// ─────────────────────────────────────────────────────────────────────────────
// src/utils/formatters.ts
// Pure, stateless formatting helpers.
// Never import from store or components — this file has zero side-effects.
// ─────────────────────────────────────────────────────────────────────────────

import { format, parseISO } from 'date-fns';
import { TransactionCategory, TransactionType } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Currency
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats a number as Indian Rupees.
 * e.g. formatCurrency(85000) → "₹85,000"
 * e.g. formatCurrency(1234567) → "₹12,34,567"  (Indian number system)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Compact format for large numbers shown in summary cards.
 * e.g. formatCurrencyCompact(125000) → "₹1.25L"
 * e.g. formatCurrencyCompact(1200000) → "₹12L"
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 10_00_000) {
    return `₹${(amount / 10_00_000).toFixed(2)}Cr`;
  }
  if (amount >= 1_00_000) {
    return `₹${(amount / 1_00_000).toFixed(2)}L`;
  }
  if (amount >= 1_000) {
    return `₹${(amount / 1_000).toFixed(1)}K`;
  }
  return `₹${amount}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dates
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats an ISO date string for display in the transaction list.
 * e.g. "2025-06-15" → "15 Jun 2025"
 */
export function formatDate(isoDate: string): string {
  return format(parseISO(isoDate), 'dd MMM yyyy');
}

/**
 * Short month label for chart axes.
 * e.g. "2025-06-15" → "Jun"
 */
export function formatMonthShort(isoDate: string): string {
  return format(parseISO(isoDate), 'MMM');
}

/**
 * Full month + year label for insight headings.
 * e.g. "2025-06-15" → "June 2025"
 */
export function formatMonthFull(isoDate: string): string {
  return format(parseISO(isoDate), 'MMMM yyyy');
}

/**
 * Returns the ISO month key (YYYY-MM) for grouping transactions.
 * e.g. "2025-06-15" → "2025-06"
 */
export function getMonthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/**
 * Converts a YYYY-MM key back to a short label.
 * e.g. "2025-06" → "Jun '25"
 */
export function monthKeyToLabel(key: string): string {
  const [year, month] = key.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return format(date, "MMM ''yy");
}

// ─────────────────────────────────────────────────────────────────────────────
// Category helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Maps every category to a Tailwind-compatible CSS class for its color dot */
export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  Salary:           '#10b981', // emerald-500
  Freelance:        '#06b6d4', // cyan-500
  Investment:       '#3b82f6', // blue-500
  'Food & Dining':  '#f59e0b', // amber-500
  Shopping:         '#ec4899', // pink-500
  Transportation:   '#6366f1', // indigo-500
  Healthcare:       '#ef4444', // red-500
  Entertainment:    '#a855f7', // purple-500
  Utilities:        '#64748b', // slate-500
  Rent:             '#f97316', // orange-500
  Education:        '#14b8a6', // teal-500
  Other:            '#94a3b8', // slate-400
};

/** Emoji icon for each category — adds visual delight to the list */
export const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  Salary:           '💼',
  Freelance:        '💻',
  Investment:       '📈',
  'Food & Dining':  '🍽️',
  Shopping:         '🛍️',
  Transportation:   '🚗',
  Healthcare:       '🏥',
  Entertainment:    '🎬',
  Utilities:        '⚡',
  Rent:             '🏠',
  Education:        '📚',
  Other:            '📌',
};

/** Returns a consistent, readable label for the transaction type badge */
export function formatType(type: TransactionType): string {
  return type === 'income' ? 'Income' : 'Expense';
}

/** Returns how many days ago a date was — for relative display */
export function relativeDays(isoDate: string): string {
  const now = new Date();
  const target = parseISO(isoDate);
  const diffMs = now.getTime() - target.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(isoDate);
}
// ─────────────────────────────────────────────────────────────────────────────
// src/utils/analytics.ts
// Pure analytical functions that compute derived metrics from transaction data.
// These are stateless — they take data in and return derived values out.
// Think of this as the "business logic" layer of the dashboard.
// ─────────────────────────────────────────────────────────────────────────────

import { Transaction, BalanceTrendPoint, CategoryBreakdown, MonthlyStats, TransactionCategory } from '@/types';
import { getMonthKey, monthKeyToLabel } from './formatters';

// ─────────────────────────────────────────────────────────────────────────────
// Summary Metrics (used in Summary Cards)
// ─────────────────────────────────────────────────────────────────────────────

/** Total income across all provided transactions */
export function computeTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Total expenses across all provided transactions */
export function computeTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Net balance = total income − total expenses */
export function computeNetBalance(transactions: Transaction[]): number {
  return computeTotalIncome(transactions) - computeTotalExpenses(transactions);
}

/** Savings rate as a percentage: (net / income) * 100. Returns 0 if no income. */
export function computeSavingsRate(transactions: Transaction[]): number {
  const income = computeTotalIncome(transactions);
  if (income === 0) return 0;
  const net = computeNetBalance(transactions);
  return Math.max(0, Math.round((net / income) * 100));
}

// ─────────────────────────────────────────────────────────────────────────────
// Balance Trend Chart Data (Line/Area Chart)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Produces one data point per month, sorted chronologically.
 * Each point has income, expenses, and the running net balance for that month.
 */
export function computeBalanceTrend(transactions: Transaction[]): BalanceTrendPoint[] {
  // Group transactions by YYYY-MM month key
  const monthMap = new Map<string, { income: number; expenses: number }>();

  for (const t of transactions) {
    const key = getMonthKey(t.date);
    const existing = monthMap.get(key) ?? { income: 0, expenses: 0 };

    if (t.type === 'income') {
      existing.income += t.amount;
    } else {
      existing.expenses += t.amount;
    }

    monthMap.set(key, existing);
  }

  // Sort keys chronologically (lexicographic on YYYY-MM works correctly)
  const sortedKeys = Array.from(monthMap.keys()).sort();

  return sortedKeys.map((key) => {
    const { income, expenses } = monthMap.get(key)!;
    return {
      month: monthKeyToLabel(key),
      income,
      expenses,
      balance: income - expenses,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Category Breakdown (Pie / Donut Chart)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Breaks total expenses down by category.
 * Returns categories sorted by amount (descending), with percentage shares.
 */
export function computeCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  const expenseOnly = transactions.filter((t) => t.type === 'expense');
  const totalExpenses = expenseOnly.reduce((sum, t) => sum + t.amount, 0);

  if (totalExpenses === 0) return [];

  // Aggregate by category
  const categoryMap = new Map<TransactionCategory, number>();
  for (const t of expenseOnly) {
    categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + t.amount);
  }

  // Convert to array, compute percentages, sort descending
  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / totalExpenses) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);
}

// ─────────────────────────────────────────────────────────────────────────────
// Monthly Comparison (Bar Chart — Insights)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Per-month income vs. expense stats, sorted chronologically.
 * Used to render the grouped bar chart in the Insights section.
 */
export function computeMonthlyStats(transactions: Transaction[]): MonthlyStats[] {
  const monthMap = new Map<string, { income: number; expenses: number }>();

  for (const t of transactions) {
    const key = getMonthKey(t.date);
    const existing = monthMap.get(key) ?? { income: 0, expenses: 0 };

    if (t.type === 'income') existing.income += t.amount;
    else existing.expenses += t.amount;

    monthMap.set(key, existing);
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { income, expenses }]) => ({
      month: monthKeyToLabel(key),
      income,
      expenses,
      net: income - expenses,
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Insight Observations (Insights Section)
// ─────────────────────────────────────────────────────────────────────────────

/** The category with the highest cumulative spending */
export function getTopSpendingCategory(transactions: Transaction[]): CategoryBreakdown | null {
  const breakdown = computeCategoryBreakdown(transactions);
  return breakdown[0] ?? null;
}

/**
 * Compares the most recent two months and returns a change object.
 * Used to show whether spending went up or down month-over-month.
 */
export function getMonthlySpendingChange(transactions: Transaction[]): {
  currentMonth: string;
  previousMonth: string;
  currentExpenses: number;
  previousExpenses: number;
  changePercent: number;
  direction: 'up' | 'down' | 'same';
} | null {
  const stats = computeMonthlyStats(transactions);
  if (stats.length < 2) return null;

  const current  = stats[stats.length - 1];
  const previous = stats[stats.length - 2];
  const change   = current.expenses - previous.expenses;
  const pct      = previous.expenses === 0 ? 0 : Math.round((change / previous.expenses) * 100);

  return {
    currentMonth:    current.month,
    previousMonth:   previous.month,
    currentExpenses: current.expenses,
    previousExpenses: previous.expenses,
    changePercent:   Math.abs(pct),
    direction:       pct > 0 ? 'up' : pct < 0 ? 'down' : 'same',
  };
}

/**
 * Identifies the single most expensive transaction.
 * Used as an "alert" insight card.
 */
export function getLargestExpense(transactions: Transaction[]): Transaction | null {
  const expenses = transactions.filter((t) => t.type === 'expense');
  if (expenses.length === 0) return null;
  return expenses.reduce((max, t) => (t.amount > max.amount ? t : max), expenses[0]);
}

/**
 * Average daily spending based on expense transactions.
 * Useful as a quick health metric.
 */
export function getAverageDailySpend(transactions: Transaction[]): number {
  const expenses = transactions.filter((t) => t.type === 'expense');
  if (expenses.length === 0) return 0;

  // Find date range
  const dates = expenses.map((t) => new Date(t.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const totalDays = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1);

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  return Math.round(totalExpenses / totalDays);
}
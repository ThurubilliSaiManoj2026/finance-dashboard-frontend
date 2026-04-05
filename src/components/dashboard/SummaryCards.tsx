// ─────────────────────────────────────────────────────────────────────────────
// src/components/dashboard/SummaryCards.tsx
//
// Changes from original:
//   1. Net Balance card colour: violet → emerald (primary brand colour)
//   2. Savings Rate card colour: blue → teal (fintech green family)
//   3. No emojis were present here — lucide icons stay as-is
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUp, ArrowDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  computeTotalIncome,
  computeTotalExpenses,
  computeNetBalance,
  computeSavingsRate,
  computeMonthlyStats,
} from '@/utils/analytics';
import { formatCurrency } from '@/utils/formatters';

// ─────────────────────────────────────────────────────────────────────────────
// Internal single metric card
// ─────────────────────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  delta?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  icon: React.ElementType;
  color: 'emerald' | 'green' | 'rose' | 'teal';
  delay?: string;
}

const COLOR_MAP = {
  emerald: {
    iconBg:   'bg-emerald-100 dark:bg-emerald-900/30',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    accent:   'bg-emerald-500',
  },
  green: {
    iconBg:   'bg-green-100 dark:bg-green-900/30',
    iconText: 'text-green-600 dark:text-green-400',
    accent:   'bg-green-500',
  },
  rose: {
    iconBg:   'bg-rose-100 dark:bg-rose-900/30',
    iconText: 'text-rose-600 dark:text-rose-400',
    accent:   'bg-rose-500',
  },
  teal: {
    iconBg:   'bg-teal-100 dark:bg-teal-900/30',
    iconText: 'text-teal-600 dark:text-teal-400',
    accent:   'bg-teal-500',
  },
};

function MetricCard({ label, value, delta, icon: Icon, color, delay = '' }: MetricCardProps) {
  const { iconBg, iconText, accent } = COLOR_MAP[color];

  return (
    <div className={`metric-card relative overflow-hidden animate-fade-in opacity-0 ${delay}`}>
      {/* 3px top accent strip */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${accent}`} />

      <div className="flex items-start justify-between pt-1">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {label}
          </p>
          <p className="font-money text-2xl font-medium text-slate-900 dark:text-slate-100 mt-1.5 tracking-tight">
            {value}
          </p>

          {delta && (
            <div className="flex items-center gap-1 mt-2">
              {delta.direction === 'up' && (
                <ArrowUp size={11} className="text-emerald-500 flex-shrink-0" />
              )}
              {delta.direction === 'down' && (
                <ArrowDown size={11} className="text-rose-500 flex-shrink-0" />
              )}
              <span className={`text-xs font-medium ${
                delta.direction === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : delta.direction === 'down'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-500'
              }`}>
                {delta.value}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {delta.label}
              </span>
            </div>
          )}
        </div>

        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0 ml-3`}>
          <Icon size={20} className={iconText} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported 4-card grid
// ─────────────────────────────────────────────────────────────────────────────

export function SummaryCards() {
  const { transactions } = useAppStore();

  const totalIncome   = computeTotalIncome(transactions);
  const totalExpenses = computeTotalExpenses(transactions);
  const netBalance    = computeNetBalance(transactions);
  const savingsRate   = computeSavingsRate(transactions);

  const monthly = computeMonthlyStats(transactions);

  // Month-over-month expense delta
  let expenseDelta: MetricCardProps['delta'] | undefined;
  if (monthly.length >= 2) {
    const curr = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    const pct  = prev.expenses > 0
      ? Math.round(((curr.expenses - prev.expenses) / prev.expenses) * 100)
      : 0;
    expenseDelta = {
      value: `${Math.abs(pct)}%`,
      direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral',
      label: 'vs last month',
    };
  }

  // Month-over-month income delta
  let incomeDelta: MetricCardProps['delta'] | undefined;
  if (monthly.length >= 2) {
    const curr = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    const pct  = prev.income > 0
      ? Math.round(((curr.income - prev.income) / prev.income) * 100)
      : 0;
    incomeDelta = {
      value: `${Math.abs(pct)}%`,
      direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral',
      label: 'vs last month',
    };
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Net Balance — emerald (was violet) */}
      <MetricCard
        label="Net Balance"
        value={formatCurrency(netBalance)}
        delta={{ value: `${savingsRate}% saved`, direction: savingsRate >= 20 ? 'up' : 'down', label: 'of income' }}
        icon={Wallet}
        color="emerald"
        delay="delay-50"
      />
      {/* Income — green */}
      <MetricCard
        label="Total Income"
        value={formatCurrency(totalIncome)}
        delta={incomeDelta}
        icon={TrendingUp}
        color="green"
        delay="delay-100"
      />
      {/* Expenses — rose */}
      <MetricCard
        label="Total Expenses"
        value={formatCurrency(totalExpenses)}
        delta={expenseDelta}
        icon={TrendingDown}
        color="rose"
        delay="delay-150"
      />
      {/* Savings Rate — teal (was blue) */}
      <MetricCard
        label="Savings Rate"
        value={`${savingsRate}%`}
        delta={{ value: savingsRate >= 20 ? 'Healthy' : 'Below target', direction: savingsRate >= 20 ? 'up' : 'down', label: '' }}
        icon={PiggyBank}
        color="teal"
        delay="delay-200"
      />
    </div>
  );
}
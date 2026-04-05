// ─────────────────────────────────────────────────────────────────────────────
// src/components/insights/InsightsSection.tsx
//
// Changes from original:
//   1. Expense Breakdown section: emojis replaced with Lucide icon components
//      styled with a gradient container that gives a subtle 3D/elevated look.
//      This is the ONLY section where category icons are still shown —
//      all other sections use text or Lucide system icons (which they already did).
//   2. Smart Observations section: was already text-only, no change needed.
//   3. InsightCard icons: already used Lucide (Zap, TrendingUp, etc.), no change.
//   4. Emerald replaces blue/violet in progress bars and highlight colours.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  Info,
  Target,
  Zap,
  // Category Lucide icons used in the Expense Breakdown
  Briefcase,
  Laptop2,
  BarChart2,
  UtensilsCrossed,
  ShoppingBag,
  Car,
  Heart,
  Film,
  Zap as ZapIcon,
  Home,
  BookOpen,
  MoreHorizontal,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  computeMonthlyStats,
  computeCategoryBreakdown,
  getTopSpendingCategory,
  getMonthlySpendingChange,
  getLargestExpense,
  getAverageDailySpend,
  computeSavingsRate,
} from '@/utils/analytics';
import { formatCurrency, formatCurrencyCompact, formatDate, CATEGORY_COLORS } from '@/utils/formatters';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Transaction, TransactionCategory } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Category → Lucide icon mapping
// Used ONLY in the Expense Breakdown section of Insights.
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_LUCIDE_ICONS: Record<TransactionCategory, LucideIcon> = {
  'Salary':         Briefcase,
  'Freelance':      Laptop2,
  'Investment':     BarChart2,
  'Food & Dining':  UtensilsCrossed,
  'Shopping':       ShoppingBag,
  'Transportation': Car,
  'Healthcare':     Heart,
  'Entertainment':  Film,
  'Utilities':      ZapIcon,
  'Rent':           Home,
  'Education':      BookOpen,
  'Other':          MoreHorizontal,
};

// ─────────────────────────────────────────────────────────────────────────────
// CategoryIconBadge — 3D-style icon container for the Expense Breakdown
// Gradient background + subtle shadow gives an elevated, premium look.
// ─────────────────────────────────────────────────────────────────────────────

function CategoryIconBadge({ category }: { category: TransactionCategory }) {
  const Icon   = CATEGORY_LUCIDE_ICONS[category];
  const colour = CATEGORY_COLORS[category];

  return (
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{
        background: `linear-gradient(135deg, ${colour}28 0%, ${colour}16 100%)`,
        border: `1px solid ${colour}28`,
        boxShadow: `0 2px 8px ${colour}22, inset 0 1px 0 rgba(255,255,255,0.25)`,
      }}
    >
      <Icon size={14} style={{ color: colour }} strokeWidth={1.75} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// InsightCard — top row KPI tile
// Already uses Lucide icons — no emojis here in original either.
// ─────────────────────────────────────────────────────────────────────────────

interface InsightCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  value: string;
  detail: string;
  delay?: string;
}

function InsightCard({ icon: Icon, iconColor, iconBg, title, value, detail, delay = '' }: InsightCardProps) {
  return (
    <div className={`metric-card flex items-start gap-4 animate-fade-in opacity-0 ${delay}`}>
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {title}
        </p>
        <p className="font-money text-xl font-medium text-slate-900 dark:text-slate-100 mt-0.5 tracking-tight">
          {value}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-snug">{detail}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Monthly comparison grouped bar chart
// ─────────────────────────────────────────────────────────────────────────────

function MonthlyComparisonChart() {
  const { transactions } = useAppStore();
  const data = computeMonthlyStats(transactions);

  if (data.length < 2) return <EmptyState variant="insights" />;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.2)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Outfit' }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tickFormatter={formatCurrencyCompact}
            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Mono' }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
            contentStyle={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontFamily: 'Outfit',
              fontSize: 12,
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, fontFamily: 'Outfit', paddingTop: 12 }}
          />
          <Bar dataKey="income"   name="Income"   fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-generated smart observations
// ─────────────────────────────────────────────────────────────────────────────

interface Observation {
  type: 'good' | 'warning' | 'info';
  text: string;
}

function generateObservations(transactions: Transaction[]): Observation[] {
  const savingsRate   = computeSavingsRate(transactions);
  const monthlyChange = getMonthlySpendingChange(transactions);
  const topCat        = getTopSpendingCategory(transactions);
  const dailySpend    = getAverageDailySpend(transactions);
  const obs: Observation[] = [];

  if (savingsRate >= 30) {
    obs.push({ type: 'good', text: `Excellent! You are saving ${savingsRate}% of your income — well above the recommended 20%.` });
  } else if (savingsRate >= 20) {
    obs.push({ type: 'good', text: `Your savings rate of ${savingsRate}% meets the recommended 20% target. Keep it up!` });
  } else {
    obs.push({ type: 'warning', text: `Your savings rate is ${savingsRate}%, which is below the 20% target. Consider reviewing discretionary spending.` });
  }

  if (monthlyChange) {
    if (monthlyChange.direction === 'down') {
      obs.push({ type: 'good', text: `Expenses dropped ${monthlyChange.changePercent}% in ${monthlyChange.currentMonth} vs ${monthlyChange.previousMonth}.` });
    } else if (monthlyChange.direction === 'up' && monthlyChange.changePercent > 20) {
      obs.push({ type: 'warning', text: `Expenses jumped ${monthlyChange.changePercent}% in ${monthlyChange.currentMonth} vs ${monthlyChange.previousMonth}. Review your spending.` });
    } else if (monthlyChange.direction === 'up') {
      obs.push({ type: 'info', text: `Expenses increased by ${monthlyChange.changePercent}% compared to last month.` });
    }
  }

  if (topCat) {
    obs.push({
      type: topCat.percentage > 40 ? 'warning' : 'info',
      text: `${topCat.category} is your highest expense at ${topCat.percentage}% of total spending (${formatCurrency(topCat.amount)}).`,
    });
  }

  if (dailySpend > 0) {
    obs.push({
      type: 'info',
      text: `Your average daily spend is ${formatCurrency(dailySpend)}. Projected monthly: ${formatCurrency(dailySpend * 30)}.`,
    });
  }

  return obs;
}

const OBS_CONFIG = {
  good:    { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40' },
  warning: { icon: AlertCircle,  color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40'   },
  info:    { icon: Info,         color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40'     },
};

// ─────────────────────────────────────────────────────────────────────────────
// Main exported component
// ─────────────────────────────────────────────────────────────────────────────

export function InsightsSection() {
  const { transactions } = useAppStore();

  if (transactions.length === 0) {
    return (
      <Card className="p-8">
        <EmptyState variant="insights" />
      </Card>
    );
  }

  const topCat        = getTopSpendingCategory(transactions);
  const monthlyChange = getMonthlySpendingChange(transactions);
  const largestExp    = getLargestExpense(transactions);
  const avgDaily      = getAverageDailySpend(transactions);
  const savingsRate   = computeSavingsRate(transactions);
  const breakdown     = computeCategoryBreakdown(transactions);
  const observations  = generateObservations(transactions);

  return (
    <div className="space-y-6">

      {/* ── Row 1: KPI insight cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {topCat && (
          <InsightCard
            icon={Zap}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-50 dark:bg-amber-900/20"
            title="Top Spending"
            value={topCat.category}
            detail={`${formatCurrency(topCat.amount)} · ${topCat.percentage}% of expenses`}
            delay="delay-50"
          />
        )}
        {monthlyChange && (
          <InsightCard
            icon={monthlyChange.direction === 'down' ? TrendingDown : monthlyChange.direction === 'up' ? TrendingUp : Minus}
            iconColor={monthlyChange.direction === 'down' ? 'text-emerald-600 dark:text-emerald-400' : monthlyChange.direction === 'up' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}
            iconBg={monthlyChange.direction === 'down' ? 'bg-emerald-50 dark:bg-emerald-900/20' : monthlyChange.direction === 'up' ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-slate-100 dark:bg-slate-700'}
            title="Month-over-Month"
            value={`${monthlyChange.direction === 'down' ? '↓' : '↑'} ${monthlyChange.changePercent}%`}
            detail={`Expenses: ${monthlyChange.currentMonth} vs ${monthlyChange.previousMonth}`}
            delay="delay-100"
          />
        )}
        <InsightCard
          icon={Target}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          title="Savings Rate"
          value={`${savingsRate}%`}
          detail={savingsRate >= 20 ? 'Above 20% target' : 'Below 20% target'}
          delay="delay-150"
        />
        {largestExp && (
          <InsightCard
            icon={AlertCircle}
            iconColor="text-rose-600 dark:text-rose-400"
            iconBg="bg-rose-50 dark:bg-rose-900/20"
            title="Largest Expense"
            value={formatCurrency(largestExp.amount)}
            detail={`${largestExp.description} · ${formatDate(largestExp.date)}`}
            delay="delay-200"
          />
        )}
      </div>

      {/* ── Row 2: Monthly bar chart ──────────────────────────────────── */}
      <Card className="p-5 animate-fade-in opacity-0 delay-250">
        <CardHeader
          title="Monthly Income vs. Expenses"
          subtitle="Grouped comparison — track budget trends month over month"
          className="mb-5"
        />
        <MonthlyComparisonChart />
      </Card>

      {/* ── Row 3: Expense breakdown + Observations ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/*
          Expense Breakdown — this is the ONLY section that retains
          category icons, as per the brief. Icons are Lucide components
          styled with a gradient + shadow container for a 3D/elevated effect.
        */}
        <Card className="p-5 animate-fade-in opacity-0 delay-300">
          <CardHeader
            title="Expense Breakdown"
            subtitle="All categories ranked by spend"
            className="mb-4"
          />
          <div className="space-y-3">
            {breakdown.map((item, i) => {
              const colour = CATEGORY_COLORS[item.category];
              return (
                <div key={item.category} className={`animate-fade-in opacity-0 delay-${Math.min(300 + i * 40, 500)}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* 3D-style lucide icon badge */}
                      <CategoryIconBadge category={item.category} />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <span className="font-money text-xs text-slate-800 dark:text-slate-200 font-medium">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 w-8 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.percentage}%`, backgroundColor: colour }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Smart observations */}
        <Card className="p-5 animate-fade-in opacity-0 delay-350">
          <CardHeader
            title="Smart Observations"
            subtitle="Auto-generated insights from your data"
            className="mb-4"
          />
          <div className="space-y-2.5">
            {observations.map((obs, i) => {
              const { icon: Icon, color, bg } = OBS_CONFIG[obs.type];
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl ${bg} animate-fade-in opacity-0 delay-${Math.min(350 + i * 40, 500)}`}
                >
                  <Icon size={15} className={`${color} flex-shrink-0 mt-0.5`} />
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{obs.text}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Daily spend summary bar ───────────────────────────────────── */}
      {avgDaily > 0 && (
        <Card className="p-5 animate-fade-in opacity-0 delay-400">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Average Daily Spend
              </p>
              <p className="font-money text-3xl font-medium text-slate-900 dark:text-slate-100 mt-1">
                {formatCurrency(avgDaily)}
                <span className="text-sm font-normal text-slate-400 dark:text-slate-500 ml-2">/ day</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 dark:text-slate-500">Projected monthly</p>
              <p className="font-money text-lg font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                {formatCurrency(avgDaily * 30)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
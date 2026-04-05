// ─────────────────────────────────────────────────────────────────────────────
// src/components/dashboard/BalanceTrendChart.tsx
// A composed area + line chart showing income, expenses, and net balance
// month over month. Built with Recharts' responsive container.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { computeBalanceTrend } from '@/utils/analytics';
import { formatCurrencyCompact, formatCurrency } from '@/utils/formatters';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

// ─────────────────────────────────────────────────────────────────────────────
// Custom tooltip — the default Recharts tooltip is plain; this one is styled
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="
      bg-white dark:bg-slate-800
      border border-slate-200 dark:border-slate-700
      rounded-xl shadow-card-lg
      px-4 py-3 min-w-[160px]
    ">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{entry.name}</span>
          </div>
          <span className="font-money text-xs font-medium text-slate-800 dark:text-slate-200">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function BalanceTrendChart() {
  const { transactions } = useAppStore();
  const data = computeBalanceTrend(transactions);

  return (
    <Card className="p-5 animate-fade-in opacity-0 delay-250">
      <CardHeader
        title="Balance Trend"
        subtitle="Monthly income vs. expenses — net balance line"
        className="mb-5"
      />

      {data.length < 2 ? (
        <EmptyState variant="insights" />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              {/* Subtle horizontal grid lines only */}
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(148,163,184,0.2)"
              />

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

              <Tooltip content={<CustomTooltip />} />

              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, fontFamily: 'Outfit', paddingTop: 12 }}
              />

              {/* Income area — filled emerald */}
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                fill="#d1fae5"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={0.5}
                dot={false}
                activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
              />

              {/* Expenses area — filled rose */}
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                fill="#ffe4e6"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={0.5}
                dot={false}
                activeDot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }}
              />

              {/* Net balance — solid violet line on top */}
              <Line
                type="monotone"
                dataKey="balance"
                name="Net Balance"
                stroke="#7c3aed"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#7c3aed', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#7c3aed', strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
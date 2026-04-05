// ─────────────────────────────────────────────────────────────────────────────
// src/components/dashboard/CategoryChart.tsx
//
// Changes from original:
//   1. Removed CATEGORY_ICONS emoji from legend items — text label only
//   2. Colour dot in legend stays (meaningful visual encoding)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  Tooltip,
} from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { computeCategoryBreakdown } from '@/utils/analytics';
import { formatCurrency } from '@/utils/formatters';
import { CATEGORY_COLORS } from '@/utils/formatters';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import type { TransactionCategory } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Active sector shape — expands the selected slice with a centre label
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

  return (
    <g>
      {/* Category name */}
      <text
        x={cx} y={cy - 10}
        textAnchor="middle"
        fill={fill}
        style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600 }}
      >
        {payload.category}
      </text>
      {/* Amount */}
      <text
        x={cx} y={cy + 10}
        textAnchor="middle"
        fill="#64748b"
        style={{ fontFamily: 'DM Mono', fontSize: 13, fontWeight: 500 }}
      >
        {formatCurrency(payload.amount)}
      </text>
      {/* Percentage */}
      <text
        x={cx} y={cy + 28}
        textAnchor="middle"
        fill="#94a3b8"
        style={{ fontFamily: 'Outfit', fontSize: 11 }}
      >
        {(percent * 100).toFixed(1)}% of expenses
      </text>

      {/* Expanded outer arc */}
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      {/* Inner highlight ring */}
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={innerRadius - 2} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function CategoryChart() {
  const { transactions } = useAppStore();
  const breakdown = computeCategoryBreakdown(transactions);

  const [activeIndex, setActiveIndex] = useState(0);

  const topCategories = breakdown.slice(0, 6);
  const otherAmount   = breakdown.slice(6).reduce((sum, c) => sum + c.amount, 0);

  const chartData = [
    ...topCategories,
    ...(otherAmount > 0 ? [{ category: 'Other' as TransactionCategory, amount: otherAmount, percentage: 0 }] : []),
  ];

  return (
    <Card className="p-5 animate-fade-in opacity-0 delay-300">
      <CardHeader
        title="Spending by Category"
        subtitle="Top expense categories this period"
        className="mb-4"
      />

      {breakdown.length === 0 ? (
        <EmptyState variant="insights" />
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* Donut chart */}
          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="amount"
                  activeIndex={activeIndex}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  activeShape={(p: any) => <ActiveShape {...p} />}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_COLORS[entry.category]}
                      strokeWidth={0}
                      style={{ cursor: 'pointer', outline: 'none' }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  contentStyle={{
                    background: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontFamily: 'Outfit',
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend — colour dot + text label only, no emoji */}
          <div className="w-full space-y-1.5">
            {topCategories.map((item, i) => (
              <button
                key={item.category}
                className="
                  w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left
                  hover:bg-slate-50 dark:hover:bg-slate-700/50
                  transition-colors duration-150
                "
                onClick={() => setActiveIndex(i)}
              >
                {/* Colour swatch */}
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                />

                {/* Category name — text only, no emoji */}
                <span className="text-xs text-slate-600 dark:text-slate-300 flex-1 truncate">
                  {item.category}
                </span>

                {/* Amount */}
                <span className="font-money text-xs text-slate-800 dark:text-slate-200 font-medium">
                  {formatCurrency(item.amount)}
                </span>

                {/* Percentage pill */}
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md min-w-[36px] text-center bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                  {item.percentage}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// src/pages/DashboardPage.tsx
// The main overview page. Composes:
//   1. Summary metric cards (top row)
//   2. Balance trend area chart
//   3. Category donut chart
//   4. Recent transactions list
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { SummaryCards }       from '@/components/dashboard/SummaryCards';
import { BalanceTrendChart }  from '@/components/dashboard/BalanceTrendChart';
import { CategoryChart }      from '@/components/dashboard/CategoryChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* ── Row 1: 4 KPI metric cards ─────────────────────────────────── */}
      <SummaryCards />

      {/* ── Row 2: Charts side by side ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Balance Trend takes more horizontal space (3/5 cols) */}
        <div className="lg:col-span-3">
          <BalanceTrendChart />
        </div>
        {/* Category donut takes remaining space (2/5 cols) */}
        <div className="lg:col-span-2">
          <CategoryChart />
        </div>
      </div>

      {/* ── Row 3: Recent Transactions ────────────────────────────────── */}
      <RecentTransactions />
    </div>
  );
}
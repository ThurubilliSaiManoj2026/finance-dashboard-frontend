// ─────────────────────────────────────────────────────────────────────────────
// src/components/dashboard/RecentTransactions.tsx
//
// Changes from original:
//   1. Replaced emoji icon circles with a colour-coded letter avatar
//      — first letter of the category on a tinted background derived from
//        the category's brand colour. Clean, no emoji.
//   2. "View all" button link colour stays neutral (ghost variant)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate, CATEGORY_COLORS } from '@/utils/formatters';

export function RecentTransactions() {
  const { transactions, setActiveTab } = useAppStore();

  // Sort descending by date and take latest 5
  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <Card className="p-5 animate-fade-in opacity-0 delay-400">
      <CardHeader
        title="Recent Activity"
        subtitle="Latest 5 transactions"
        className="mb-4"
        action={
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight size={13} />}
            onClick={() => setActiveTab('transactions')}
          >
            View all
          </Button>
        }
      />

      {recent.length === 0 ? (
        <EmptyState variant="transactions" />
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700 -mx-1">
          {recent.map((txn, i) => {
            const colour = CATEGORY_COLORS[txn.category];
            const initial = txn.category.charAt(0).toUpperCase();

            return (
              <li
                key={txn.id}
                className={`flex items-center gap-3 px-1 py-3 animate-fade-in opacity-0 delay-${Math.min((i + 1) * 50 + 400, 500)}`}
              >
                {/*
                  Colour-coded letter avatar.
                  Background is the category colour at 15% opacity,
                  letter is the category colour at full opacity.
                  No emoji — clean, professional fintech appearance.
                */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${colour}18`,
                    border: `1px solid ${colour}28`,
                  }}
                >
                  <span
                    className="text-xs font-bold leading-none"
                    style={{ color: colour }}
                  >
                    {initial}
                  </span>
                </div>

                {/* Description + date */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {txn.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {formatDate(txn.date)}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      {txn.category}
                    </span>
                  </div>
                </div>

                {/* Amount + type badge */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`font-money text-sm font-medium ${
                    txn.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {txn.type === 'income' ? '+' : '−'}{formatCurrency(txn.amount)}
                  </span>
                  <Badge variant={txn.type === 'income' ? 'income' : 'expense'}>
                    {txn.type}
                  </Badge>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
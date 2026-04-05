// ─────────────────────────────────────────────────────────────────────────────
// src/pages/TransactionsPage.tsx
// Full transaction management page. Composes:
//   1. Filter bar (search, type, category, date range, sort)
//   2. Paginated transaction table with edit/delete (admin only)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionList }    from '@/components/transactions/TransactionList';

export function TransactionsPage() {
  return (
    <div className="space-y-4">
      {/* Filter controls bar */}
      <TransactionFilters />

      {/* Transaction table with toolbar (add button, export, pagination) */}
      <TransactionList />
    </div>
  );
}
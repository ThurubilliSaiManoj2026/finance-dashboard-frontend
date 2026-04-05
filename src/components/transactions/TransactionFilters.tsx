// ─────────────────────────────────────────────────────────────────────────────
// src/components/transactions/TransactionFilters.tsx
// The full filter bar above the transaction list.
// Includes: text search, type filter, category filter, date range, sort.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useId } from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useAppStore, DEFAULT_FILTERS } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { TransactionCategory, SortField, SortDirection } from '@/types';

const ALL_CATEGORIES: TransactionCategory[] = [
  'Salary', 'Freelance', 'Investment', 'Food & Dining',
  'Shopping', 'Transportation', 'Healthcare', 'Entertainment',
  'Utilities', 'Rent', 'Education', 'Other',
];

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper: a styled <select> dropdown
// ─────────────────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

function FilterSelect({ label, id, ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label htmlFor={id} className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 px-1">
        {label}
      </label>
      <select
        id={id}
        className="
          text-sm text-slate-700 dark:text-slate-200
          bg-white dark:bg-slate-800
          border border-slate-200 dark:border-slate-700
          rounded-xl px-3 py-2
          focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400
          cursor-pointer
          appearance-none
          transition-colors duration-150
        "
        {...rest}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function TransactionFilters() {
  const { filters, setFilters, resetFilters } = useAppStore();
  const uid = useId(); // Generates unique IDs for labels

  // Check whether any filter is active (vs. defaults) to show "clear" button
  const hasActiveFilters =
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    filters.sortField !== DEFAULT_FILTERS.sortField ||
    filters.sortDirection !== DEFAULT_FILTERS.sortDirection;

  return (
    <div className="
      bg-white dark:bg-slate-800
      border border-slate-200 dark:border-slate-700
      rounded-2xl p-4
      space-y-4
      shadow-card
    ">
      {/* ── Row 1: Search + Clear button ─────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder="Search transactions, merchants, categories…"
            className="
              w-full pl-9 pr-4 py-2
              text-sm text-slate-700 dark:text-slate-200
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              bg-slate-50 dark:bg-slate-700
              border border-slate-200 dark:border-slate-600
              rounded-xl
              focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400
              transition-all duration-150
            "
            aria-label="Search transactions"
          />
          {/* Clear search button */}
          {filters.search && (
            <button
              onClick={() => setFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Reset all filters button — only shown when a filter is active */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            leftIcon={<X size={13} />}
            className="flex-shrink-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
          >
            Clear
          </Button>
        )}
      </div>

      {/* ── Row 2: Filter controls ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

        {/* Type filter */}
        <FilterSelect
          id={`${uid}-type`}
          label="Type"
          value={filters.type}
          onChange={(e) => setFilters({ type: e.target.value as typeof filters.type })}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </FilterSelect>

        {/* Category filter */}
        <FilterSelect
          id={`${uid}-category`}
          label="Category"
          value={filters.category}
          onChange={(e) => setFilters({ category: e.target.value as typeof filters.category })}
        >
          <option value="all">All Categories</option>
          {ALL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </FilterSelect>

        {/* Date from */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`${uid}-from`}
            className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 px-1"
          >
            From
          </label>
          <input
            id={`${uid}-from`}
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ dateFrom: e.target.value })}
            className="
              text-sm text-slate-700 dark:text-slate-200
              bg-white dark:bg-slate-800
              border border-slate-200 dark:border-slate-700
              rounded-xl px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400
              cursor-pointer transition-colors duration-150
            "
          />
        </div>

        {/* Date to */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`${uid}-to`}
            className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 px-1"
          >
            To
          </label>
          <input
            id={`${uid}-to`}
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ dateTo: e.target.value })}
            className="
              text-sm text-slate-700 dark:text-slate-200
              bg-white dark:bg-slate-800
              border border-slate-200 dark:border-slate-700
              rounded-xl px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400
              cursor-pointer transition-colors duration-150
            "
          />
        </div>

        {/* Sort control */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 px-1">
            Sort By
          </label>
          <div className="flex gap-1">
            <select
              value={filters.sortField}
              onChange={(e) => setFilters({ sortField: e.target.value as SortField })}
              className="
                flex-1 min-w-0 text-sm text-slate-700 dark:text-slate-200
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                rounded-xl px-2 py-2
                focus:outline-none focus:ring-2 focus:ring-violet-500
                appearance-none cursor-pointer
              "
              aria-label="Sort field"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="category">Category</option>
            </select>
            {/* Direction toggle button */}
            <button
              onClick={() =>
                setFilters({
                  sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc',
                })
              }
              className="
                p-2 rounded-xl
                border border-slate-200 dark:border-slate-700
                bg-white dark:bg-slate-800
                text-slate-500 dark:text-slate-400
                hover:bg-slate-50 dark:hover:bg-slate-700
                hover:text-violet-600 dark:hover:text-violet-400
                transition-colors duration-150
              "
              title={`Sort ${filters.sortDirection === 'asc' ? 'descending' : 'ascending'}`}
              aria-label="Toggle sort direction"
            >
              <ArrowUpDown size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Active filter summary pills ───────────────────────────────────── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
            <SlidersHorizontal size={10} /> Active filters:
          </span>
          {filters.type !== 'all' && (
            <FilterPill label={`Type: ${filters.type}`} onRemove={() => setFilters({ type: 'all' })} />
          )}
          {filters.category !== 'all' && (
            <FilterPill label={`Cat: ${filters.category}`} onRemove={() => setFilters({ category: 'all' })} />
          )}
          {filters.dateFrom && (
            <FilterPill label={`From: ${filters.dateFrom}`} onRemove={() => setFilters({ dateFrom: '' })} />
          )}
          {filters.dateTo && (
            <FilterPill label={`To: ${filters.dateTo}`} onRemove={() => setFilters({ dateTo: '' })} />
          )}
          {filters.search && (
            <FilterPill label={`"${filters.search}"`} onRemove={() => setFilters({ search: '' })} />
          )}
        </div>
      )}
    </div>
  );
}

// Small dismissible pill for active filters
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="
      inline-flex items-center gap-1
      px-2 py-0.5 rounded-full
      text-[10px] font-medium
      bg-violet-50 text-violet-700 border border-violet-200
      dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800
    ">
      {label}
      <button onClick={onRemove} className="hover:text-violet-900 dark:hover:text-violet-200" aria-label={`Remove ${label} filter`}>
        <X size={10} />
      </button>
    </span>
  );
}
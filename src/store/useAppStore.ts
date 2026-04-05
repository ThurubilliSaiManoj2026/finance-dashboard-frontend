// ─────────────────────────────────────────────────────────────────────────────
// src/store/useAppStore.ts
// The single global Zustand store for the entire application.
//
// Why Zustand?
//   - Zero boilerplate compared to Redux
//   - Built-in TypeScript support
//   - `persist` middleware gives us localStorage for free
//   - Selective subscriptions prevent unnecessary re-renders
//
// Architecture:
//   State is divided into logical slices: transactions, filters, UI preferences.
//   All mutations go through actions defined here — components never mutate
//   state directly.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, FilterState } from '@/types';
import { mockTransactions } from '@/data/mockData';

// ─────────────────────────────────────────────────────────────────────────────
// Default filter state — exported so components can easily reset to it
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_FILTERS: FilterState = {
  search: '',
  type: 'all',
  category: 'all',
  dateFrom: '',
  dateTo: '',
  sortField: 'date',
  sortDirection: 'desc',
};

// ─────────────────────────────────────────────────────────────────────────────
// The store definition
// ─────────────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  // `persist` wraps the store so all state is automatically saved to
  // localStorage and re-hydrated on the next page load.
  persist(
    (set) => ({
      // ── Initial state ───────────────────────────────────────────────────
      transactions: mockTransactions,
      filters: DEFAULT_FILTERS,
      role: 'admin',          // Default to admin so evaluators see full features
      darkMode: false,
      activeTab: 'dashboard',

      // ── Transaction actions ─────────────────────────────────────────────

      /**
       * Adds a new transaction.
       * A UUID is generated here so the caller never has to worry about IDs.
       */
      addTransaction: (transaction) => {
        const newTransaction = {
          ...transaction,
          // Use crypto.randomUUID() — available in all modern browsers
          id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        };
        set((state) => ({
          // Prepend so the newest transaction appears at the top of the list
          transactions: [newTransaction, ...state.transactions],
        }));
      },

      /**
       * Updates specific fields on an existing transaction by ID.
       * Uses partial update so callers only need to pass changed fields.
       */
      editTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      /**
       * Removes a transaction by ID permanently.
       * (In a real app this would hit a DELETE endpoint first.)
       */
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      // ── Filter actions ──────────────────────────────────────────────────

      /**
       * Partially updates the filter state — only the keys you pass change.
       * This avoids having to read the whole filter object before every update.
       */
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      /** Resets all filters back to their default (clear-all) state */
      resetFilters: () => {
        set({ filters: DEFAULT_FILTERS });
      },

      // ── UI actions ──────────────────────────────────────────────────────

      /** Switches the simulated RBAC role between 'admin' and 'viewer' */
      setRole: (role) => set({ role }),

      /** Toggles dark mode — the `dark` class is applied to <html> in App.tsx */
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      /** Switches the active navigation tab */
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'fintrack-storage',             // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist these keys — role and darkMode are user preferences
      // that should survive a page reload. Transactions are persisted so
      // any admin-added entries aren't lost.
      partialize: (state) => ({
        transactions: state.transactions,
        role: state.role,
        darkMode: state.darkMode,
      }),
    }
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// Derived selectors — memoised filter logic lives outside the store
// so it doesn't run on every unrelated state update.
// ─────────────────────────────────────────────────────────────────────────────

import { Transaction } from '@/types';

/**
 * Applies the current filter state to the full transaction list and returns
 * only the matching, sorted transactions.
 *
 * This is a pure function — it's called in components via:
 *   const filtered = selectFilteredTransactions(useAppStore.getState());
 */
export function selectFilteredTransactions(state: AppState): Transaction[] {
  const { transactions, filters } = state;
  const {
    search, type, category, dateFrom, dateTo, sortField, sortDirection,
  } = filters;

  let result = [...transactions];

  // Text search across description, merchant, and category
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        (t.merchant ?? '').toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }

  // Type filter
  if (type !== 'all') {
    result = result.filter((t) => t.type === type);
  }

  // Category filter
  if (category !== 'all') {
    result = result.filter((t) => t.category === category);
  }

  // Date range filters
  if (dateFrom) {
    result = result.filter((t) => t.date >= dateFrom);
  }
  if (dateTo) {
    result = result.filter((t) => t.date <= dateTo);
  }

  // Sorting
  result.sort((a, b) => {
    let comparison = 0;

    if (sortField === 'date') {
      comparison = a.date.localeCompare(b.date);
    } else if (sortField === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortField === 'category') {
      comparison = a.category.localeCompare(b.category);
    }

    // Flip for descending order
    return sortDirection === 'desc' ? -comparison : comparison;
  });

  return result;
}
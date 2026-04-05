// ─────────────────────────────────────────────────────────────────────────────
// src/types/index.ts
// Central type definitions for the entire application.
// Every component, hook, and utility imports from this file.
// ─────────────────────────────────────────────────────────────────────────────

/** Whether a transaction adds to or subtracts from balance */
export type TransactionType = 'income' | 'expense';

/** All supported transaction categories */
export type TransactionCategory =
  | 'Salary'
  | 'Freelance'
  | 'Investment'
  | 'Food & Dining'
  | 'Shopping'
  | 'Transportation'
  | 'Healthcare'
  | 'Entertainment'
  | 'Utilities'
  | 'Rent'
  | 'Education'
  | 'Other';

/** App-level role that controls UI permissions */
export type UserRole = 'admin' | 'viewer';

/** Fields on which the transaction list can be sorted */
export type SortField = 'date' | 'amount' | 'category';

/** Sort order */
export type SortDirection = 'asc' | 'desc';

/** Top-level navigation tabs */
export type ActiveTab = 'dashboard' | 'transactions' | 'insights';

// ─────────────────────────────────────────────────────────────────────────────
// Core domain model
// ─────────────────────────────────────────────────────────────────────────────

/** A single financial transaction */
export interface Transaction {
  /** UUID generated at creation time */
  id: string;
  /** ISO 8601 date string (e.g. "2025-06-15") */
  date: string;
  /** Amount in INR — always positive regardless of type */
  amount: number;
  category: TransactionCategory;
  type: TransactionType;
  /** Short human-readable label */
  description: string;
  /** Optional merchant or source name */
  merchant?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI / filter state
// ─────────────────────────────────────────────────────────────────────────────

/** The current state of all transaction list filters */
export interface FilterState {
  search: string;
  type: TransactionType | 'all';
  category: TransactionCategory | 'all';
  /** Inclusive lower bound (ISO date string or empty) */
  dateFrom: string;
  /** Inclusive upper bound (ISO date string or empty) */
  dateTo: string;
  sortField: SortField;
  sortDirection: SortDirection;
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics helpers (used in insights + charts)
// ─────────────────────────────────────────────────────────────────────────────

/** One data point on the balance-trend line chart */
export interface BalanceTrendPoint {
  /** Short month label, e.g. "Jan" */
  month: string;
  income: number;
  expenses: number;
  /** Net balance: income − expenses (can be negative) */
  balance: number;
}

/** One slice of the spending-breakdown pie chart */
export interface CategoryBreakdown {
  category: TransactionCategory;
  amount: number;
  /** 0–100 percentage of total expenses */
  percentage: number;
}

/** Aggregated stats for a single month (used in insights) */
export interface MonthlyStats {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Zustand store shape
// ─────────────────────────────────────────────────────────────────────────────

/** Complete application state + actions */
export interface AppState {
  // ── State slices ──────────────────────────────────────────────────
  transactions: Transaction[];
  filters: FilterState;
  role: UserRole;
  darkMode: boolean;
  activeTab: ActiveTab;

  // ── Transaction actions ───────────────────────────────────────────
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: string, t: Partial<Omit<Transaction, 'id'>>) => void;
  deleteTransaction: (id: string) => void;

  // ── Filter actions ────────────────────────────────────────────────
  setFilters: (f: Partial<FilterState>) => void;
  resetFilters: () => void;

  // ── UI actions ────────────────────────────────────────────────────
  setRole: (r: UserRole) => void;
  toggleDarkMode: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}
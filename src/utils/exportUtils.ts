// ─────────────────────────────────────────────────────────────────────────────
// src/utils/exportUtils.ts
// Utilities for exporting transaction data to CSV and JSON.
// These are browser-side downloads — no server required.
// ─────────────────────────────────────────────────────────────────────────────

import { Transaction } from '@/types';
import { formatDate, formatCurrency } from './formatters';

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper — triggers a browser file download
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a temporary anchor element, clicks it to trigger the download,
 * then removes it from the DOM. This is the standard cross-browser approach
 * for programmatic file downloads without a server.
 */
function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href     = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup — revoke the object URL to avoid memory leaks
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// CSV Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exports a list of transactions to a well-formatted CSV file.
 * Uses human-readable formats (e.g. "₹85,000" and "15 Jun 2025")
 * so the file is immediately usable without post-processing.
 */
export function exportToCSV(transactions: Transaction[], filename = 'transactions.csv'): void {
  // CSV header row — human-readable column names
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount (₹)', 'Merchant'];

  const rows = transactions.map((t) => [
    formatDate(t.date),
    // Wrap in quotes to handle commas inside descriptions
    `"${t.description.replace(/"/g, '""')}"`,
    t.category,
    t.type === 'income' ? 'Income' : 'Expense',
    t.amount.toString(),           // Raw number for spreadsheet compatibility
    `"${(t.merchant ?? '').replace(/"/g, '""')}"`,
  ]);

  // Join header + rows with CRLF (RFC 4180 standard for CSV)
  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\r\n');

  triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exports a list of transactions as a pretty-printed JSON file.
 * The raw Transaction objects are preserved exactly as stored — useful
 * for re-importing data or passing to an API.
 */
export function exportToJSON(transactions: Transaction[], filename = 'transactions.json'): void {
  const jsonContent = JSON.stringify(transactions, null, 2);
  triggerDownload(jsonContent, filename, 'application/json');
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary Report Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exports a human-readable summary report as a plain text file.
 * Includes totals, category breakdown, and individual transactions.
 */
export function exportSummaryReport(
  transactions: Transaction[],
  filename = 'finance-report.txt'
): void {
  const income   = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net      = income - expenses;

  const lines: string[] = [
    'FinTrack — Financial Summary Report',
    '='.repeat(50),
    `Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`,
    '',
    'OVERVIEW',
    '-'.repeat(30),
    `Total Income:    ${formatCurrency(income)}`,
    `Total Expenses:  ${formatCurrency(expenses)}`,
    `Net Balance:     ${formatCurrency(net)}`,
    `Transactions:    ${transactions.length}`,
    '',
    'TRANSACTIONS',
    '-'.repeat(30),
    ...transactions
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(
        (t) =>
          `${formatDate(t.date)}  |  ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount).padEnd(12)}  |  ${t.category.padEnd(18)}  |  ${t.description}`
      ),
    '',
    'FinTrack Finance Dashboard',
  ];

  triggerDownload(lines.join('\n'), filename, 'text/plain;charset=utf-8;');
}
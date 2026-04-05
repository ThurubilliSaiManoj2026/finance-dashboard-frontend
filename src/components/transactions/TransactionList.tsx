// ─────────────────────────────────────────────────────────────────────────────
// src/components/transactions/TransactionList.tsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Pencil, Trash2, Plus, Download, ChevronLeft, ChevronRight, AlertTriangle, X } from 'lucide-react';
import { useAppStore, selectFilteredTransactions } from '@/store/useAppStore';
import { Transaction } from '@/types';
import { formatCurrency, formatDate, CATEGORY_COLORS } from '@/utils/formatters';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TransactionForm } from './TransactionForm';
import { exportToCSV, exportToJSON } from '@/utils/exportUtils';

const PAGE_SIZE = 12;

export function TransactionList() {
  const state = useAppStore();
  const { role, deleteTransaction } = state;
  const filtered = selectFilteredTransactions(state);

  // ── Local UI state ────────────────────────────────────────────────────────
  const [page, setPage]             = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | undefined>(undefined);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Delete confirmation state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openAdd   = () => { setEditTarget(undefined); setIsFormOpen(true); };
  const openEdit  = (t: Transaction) => { setEditTarget(t); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditTarget(undefined); };

  const handleDeleteClick = (id: string) => setDeleteModal({ open: true, id });

  const handleDeleteConfirm = () => {
    if (deleteModal.id) deleteTransaction(deleteModal.id);
    setDeleteModal({ open: false, id: null });
  };

  const handleDeleteCancel = () => setDeleteModal({ open: false, id: null });

  return (
    <>
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200">{filtered.length}</span>{' '}
          {filtered.length === 1 ? 'transaction' : 'transactions'} found
        </p>

        <div className="flex items-center gap-2">
          {/* Export dropdown */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download size={13} />}
              onClick={() => setExportMenuOpen((prev) => !prev)}
            >
              Export
            </Button>

            {exportMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setExportMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 min-w-[140px]">
                  {[
                    { label: 'Export CSV',  action: () => { exportToCSV(filtered);  setExportMenuOpen(false); } },
                    { label: 'Export JSON', action: () => { exportToJSON(filtered); setExportMenuOpen(false); } },
                  ].map(({ label, action }) => (
                    <button
                      key={label}
                      onClick={action}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-150"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Add button — admin only */}
          {role === 'admin' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={openAdd}
            >
              Add Transaction
            </Button>
          )}
        </div>
      </div>

      {/* ── Table card ──────────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState
            variant={filtered.length === 0 ? 'transactions' : 'search'}
            actionLabel={role === 'admin' ? 'Add your first transaction' : undefined}
            onAction={role === 'admin' ? openAdd : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Transactions">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    {['Date', 'Description', 'Category', 'Type', 'Amount', ...(role === 'admin' ? [''] : [])].map((h, idx) => (
                      <th
                        key={idx}
                        className="text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-5 py-3"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {paginated.map((txn, i) => {
                    const colour = CATEGORY_COLORS[txn.category];

                    return (
                      <tr
                        key={txn.id}
                        className={`
                          group hover:bg-slate-50 dark:hover:bg-slate-700/30
                          transition-colors duration-100
                          animate-fade-in opacity-0
                          delay-${Math.min(i * 30, 300)}
                        `}
                      >
                        {/* Date */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(txn.date)}
                          </span>
                        </td>

                        {/* Description + merchant */}
                        <td className="px-5 py-3.5 max-w-[220px]">
                          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {txn.description}
                          </p>
                          {txn.merchant && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                              {txn.merchant}
                            </p>
                          )}
                        </td>

                        {/* Category pill — colour dot + text, no emoji */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                            style={{
                              backgroundColor: `${colour}12`,
                              borderColor: `${colour}30`,
                              color: colour,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: colour }}
                            />
                            {txn.category}
                          </span>
                        </td>

                        {/* Type badge */}
                        <td className="px-5 py-3.5">
                          <Badge variant={txn.type === 'income' ? 'income' : 'expense'}>
                            {txn.type}
                          </Badge>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`font-money font-medium text-sm ${
                            txn.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {txn.type === 'income' ? '+' : '−'}{formatCurrency(txn.amount)}
                          </span>
                        </td>

                        {/* Admin: edit + delete */}
                        {role === 'admin' && (
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => openEdit(txn)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors duration-150"
                                aria-label="Edit transaction"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(txn.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-900/20 transition-colors duration-150"
                                aria-label="Delete transaction"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Page {safePage} of {totalPages} · {filtered.length} results
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    leftIcon={<ChevronLeft size={14} />}
                  >
                    Prev
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                    .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === 'ellipsis' ? (
                        <span key={`e-${idx}`} className="px-1 text-slate-400 text-xs">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item as number)}
                          className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors duration-150 ${
                            safePage === item
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    rightIcon={<ChevronRight size={14} />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* ── Add / Edit Transaction Form ──────────────────────────────────── */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={closeForm}
        editTransaction={editTarget}
      />

      {/* ── Delete Confirmation — inline fixed overlay ───────────────────
          Uses fixed + inset-0 so it always centers in the viewport
          regardless of scroll position or parent container layout.
          This bypasses any positioning issues in the shared Modal component.
      ─────────────────────────────────────────────────────────────────── */}
      {deleteModal.open && (
        <>
          {/* Backdrop — darkens the entire screen behind the popup */}
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleDeleteCancel}
            aria-hidden="true"
          />

          {/* Popup panel — always centered in the viewport */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-in">

              {/* Close button */}
              <button
                onClick={handleDeleteCancel}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors duration-150"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-700">
                <h2
                  id="delete-modal-title"
                  className="text-sm font-semibold text-slate-900 dark:text-slate-100"
                >
                  Delete Transaction
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  This action cannot be undone.
                </p>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-4">
                {/* Warning box */}
                <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-900/40">
                  <AlertTriangle
                    size={17}
                    className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    Are you sure you want to delete this transaction? It will be permanently removed from your dashboard.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handleDeleteCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={handleDeleteConfirm}
                  >
                    Delete
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// src/components/transactions/TransactionForm.tsx
// Modal form for adding a new transaction or editing an existing one.
// Full client-side validation with field-level error messages.
// Only rendered when role === 'admin'.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Transaction, TransactionCategory, TransactionType } from '@/types';

const ALL_CATEGORIES: TransactionCategory[] = [
  'Salary', 'Freelance', 'Investment', 'Food & Dining',
  'Shopping', 'Transportation', 'Healthcare', 'Entertainment',
  'Utilities', 'Rent', 'Education', 'Other',
];

// ─────────────────────────────────────────────────────────────────────────────
// Form state shape
// ─────────────────────────────────────────────────────────────────────────────

interface FormData {
  description: string;
  amount: string;       // String for controlled input; parsed to number on submit
  category: TransactionCategory;
  type: TransactionType;
  date: string;
  merchant: string;
}

interface FormErrors {
  description?: string;
  amount?: string;
  date?: string;
}

const EMPTY_FORM: FormData = {
  description: '',
  amount: '',
  category: 'Food & Dining',
  type: 'expense',
  date: new Date().toISOString().slice(0, 10), // Default to today
  merchant: '',
};

// ─────────────────────────────────────────────────────────────────────────────
// Validation logic
// ─────────────────────────────────────────────────────────────────────────────

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.description.trim()) {
    errors.description = 'Description is required.';
  } else if (data.description.trim().length < 3) {
    errors.description = 'Description must be at least 3 characters.';
  }

  const amt = parseFloat(data.amount);
  if (!data.amount || isNaN(amt)) {
    errors.amount = 'Please enter a valid amount.';
  } else if (amt <= 0) {
    errors.amount = 'Amount must be greater than ₹0.';
  } else if (amt > 100_000_000) {
    errors.amount = 'Amount seems unrealistically large.';
  }

  if (!data.date) {
    errors.date = 'Date is required.';
  } else if (data.date > new Date().toISOString().slice(0, 10)) {
    errors.date = 'Future dates are not allowed.';
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Re-usable field wrapper
// ─────────────────────────────────────────────────────────────────────────────

function Field({ label, error, children }: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
}

const inputClass = `
  w-full text-sm text-slate-800 dark:text-slate-100
  bg-slate-50 dark:bg-slate-700
  border border-slate-200 dark:border-slate-600
  rounded-xl px-3 py-2.5
  placeholder:text-slate-400 dark:placeholder:text-slate-500
  focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400
  transition-all duration-150
`;

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  /** If provided, the form is in edit mode for this transaction */
  editTransaction?: Transaction;
}

export function TransactionForm({ isOpen, onClose, editTransaction }: TransactionFormProps) {
  const { addTransaction, editTransaction: updateTransaction } = useAppStore();

  const isEditMode = Boolean(editTransaction);

  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors]     = useState<FormErrors>({});
  const [touched, setTouched]   = useState<Partial<Record<keyof FormData, boolean>>>({});

  // ── Populate form when editing ─────────────────────────────────────────
  useEffect(() => {
    if (isOpen && editTransaction) {
      setFormData({
        description: editTransaction.description,
        amount:      editTransaction.amount.toString(),
        category:    editTransaction.category,
        type:        editTransaction.type,
        date:        editTransaction.date,
        merchant:    editTransaction.merchant ?? '',
      });
    } else if (isOpen) {
      setFormData(EMPTY_FORM);
    }
    // Reset validation state on open
    setErrors({});
    setTouched({});
  }, [isOpen, editTransaction]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleChange = (key: keyof FormData, value: string) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    // Re-validate only touched fields so errors don't fire before the user types
    if (touched[key]) {
      setErrors(validate(updated));
    }
  };

  const handleBlur = (key: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors(validate(formData));
  };

  const handleSubmit = () => {
    // Mark all fields as touched so all errors show
    setTouched({ description: true, amount: true, date: true });
    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      description: formData.description.trim(),
      amount:      parseFloat(formData.amount),
      category:    formData.category,
      type:        formData.type,
      date:        formData.date,
      merchant:    formData.merchant.trim() || undefined,
    };

    if (isEditMode && editTransaction) {
      updateTransaction(editTransaction.id, payload);
    } else {
      addTransaction(payload);
    }

    onClose();
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Transaction' : 'Add Transaction'}
      subtitle={isEditMode ? 'Update the details below.' : 'Fill in the details to record a new transaction.'}
    >
      <div className="space-y-4">

        {/* Type selector — income / expense toggle */}
        <Field label="Type">
          <div className="grid grid-cols-2 gap-2">
            {(['income', 'expense'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleChange('type', t)}
                className={`
                  py-2.5 rounded-xl text-sm font-medium border capitalize
                  transition-all duration-200
                  ${formData.type === t
                    ? t === 'income'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-slate-300'
                  }
                `}
              >
                {t === 'income' ? '↑ Income' : '↓ Expense'}
              </button>
            ))}
          </div>
        </Field>

        {/* Description */}
        <Field label="Description *" error={errors.description}>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            placeholder="e.g. Monthly salary, Grocery run"
            className={`${inputClass} ${errors.description ? 'border-rose-400 focus:ring-rose-400' : ''}`}
            autoFocus
          />
        </Field>

        {/* Amount + Category — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount (₹) *" error={errors.amount}>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              onBlur={() => handleBlur('amount')}
              placeholder="0"
              min="0"
              step="0.01"
              className={`
                ${inputClass} font-mono
                ${errors.amount ? 'border-rose-400 focus:ring-rose-400' : ''}
              `}
            />
          </Field>

          <Field label="Category">
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={inputClass}
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Date + Merchant — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date *" error={errors.date}>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              onBlur={() => handleBlur('date')}
              max={new Date().toISOString().slice(0, 10)}
              className={`${inputClass} ${errors.date ? 'border-rose-400 focus:ring-rose-400' : ''}`}
            />
          </Field>

          <Field label="Merchant / Source">
            <input
              type="text"
              value={formData.merchant}
              onChange={(e) => handleChange('merchant', e.target.value)}
              placeholder="e.g. Amazon, Swiggy"
              className={inputClass}
            />
          </Field>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSubmit}
          >
            {isEditMode ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// src/components/ui/Modal.tsx
// Accessible modal dialog used for the Add/Edit Transaction form.
// Handles: focus trap, Escape key close, backdrop click close, scroll lock.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Width preset. Defaults to 'md' */
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // ── Side Effects ───────────────────────────────────────────────────────────

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        p-4
        bg-slate-900/60 backdrop-blur-sm
        animate-fade-in
      "
      onClick={(e) => {
        // Close when clicking directly on the backdrop (not the dialog)
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Dialog panel */}
      <div
        ref={dialogRef}
        className={`
          w-full ${SIZE_CLASSES[size]}
          bg-white dark:bg-slate-800
          rounded-2xl
          border border-slate-200 dark:border-slate-700
          shadow-card-lg
          animate-scale-in
          overflow-hidden
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2
              id="modal-title"
              className="text-base font-semibold text-slate-900 dark:text-slate-100"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="
              p-1.5 -mr-1 rounded-lg
              text-slate-400 hover:text-slate-600 hover:bg-slate-100
              dark:hover:text-slate-200 dark:hover:bg-slate-700
              transition-colors duration-200
            "
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
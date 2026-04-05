// ─────────────────────────────────────────────────────────────────────────────
// src/components/layout/Header.tsx
//
// Changes from original:
//   1. Role badge uses emerald instead of violet
//   2. Background uses glass effect consistent with full-light / full-dark theme
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Menu, Shield, Eye } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { format } from 'date-fns';

interface HeaderProps {
  onMobileMenuOpen: () => void;
}

const PAGE_META = {
  dashboard:    { title: 'Dashboard',    subtitle: 'Your complete financial overview'           },
  transactions: { title: 'Transactions', subtitle: 'Browse, filter, and manage all activity'   },
  insights:     { title: 'Insights',     subtitle: 'Spending patterns and monthly analysis'     },
};

export function Header({ onMobileMenuOpen }: HeaderProps) {
  const { activeTab, role } = useAppStore();
  const { title, subtitle } = PAGE_META[activeTab];

  const today = format(new Date(), 'EEEE, d MMMM yyyy');

  return (
    <header className="
      sticky top-0 z-20
      bg-white/80 dark:bg-slate-950/85
      backdrop-blur-md
      border-b border-slate-200/70 dark:border-slate-800
      px-4 sm:px-6 lg:px-8 py-4
    ">
      <div className="flex items-center justify-between gap-4">

        {/* Left: hamburger (mobile) + page title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMobileMenuOpen}
            className="
              lg:hidden flex-shrink-0
              p-2 rounded-xl
              text-slate-500 hover:text-slate-700 hover:bg-slate-100
              dark:hover:text-slate-300 dark:hover:bg-slate-800
              transition-colors duration-200
            "
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight truncate">
              {title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: date + role badge */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <p className="hidden md:block text-xs text-slate-400 dark:text-slate-500">
            {today}
          </p>

          {/* Role badge — emerald for admin, slate for viewer */}
          <div className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border
            ${role === 'admin'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/25 dark:text-emerald-400 dark:border-emerald-800'
              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }
          `}>
            {role === 'admin'
              ? <Shield size={12} />
              : <Eye size={12} />
            }
            <span className="capitalize">{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
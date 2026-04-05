// ─────────────────────────────────────────────────────────────────────────────
// src/components/ui/Card.tsx
//
// Changes from original:
//   1. Uses the `.card` CSS class from index.css instead of inline Tailwind
//      bg/border/shadow utilities — this lets the glassmorphism definition
//      in CSS apply automatically to all Card instances across the app.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Card({ className = '', children, onClick }: CardProps) {
  return (
    <div
      className={`
        card
        ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}
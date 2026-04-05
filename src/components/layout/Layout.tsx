// ─────────────────────────────────────────────────────────────────────────────
// src/components/layout/Layout.tsx
//
// The main content area left-padding must use inline style (not Tailwind class
// switching) so it uses the exact same cubic-bezier timing as the sidebar width.
// Tailwind class switching causes a frame delay; inline style is synchronous.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header }  from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);

  return (
    <div className="flex min-h-screen">

      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
      />

      {/*
        paddingLeft matches sidebar width exactly (240px / 64px) and uses
        the identical cubic-bezier so the content edge tracks the sidebar
        edge in perfect lock-step — no lag, no overshoot, no jitter.
      */}
      <div
        className="flex-1 flex flex-col min-w-0"
        style={{
          paddingLeft: collapsed ? '64px' : '240px',
          transition:  'padding-left 280ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange:  'padding-left',
        }}
      >
        <Header onMobileMenuOpen={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// src/App.tsx
// Application root. Responsibilities:
//   1. Applies/removes the `dark` class on <html> based on Zustand state
//   2. Routes between the three pages based on `activeTab`
//   3. Wraps everything in the Layout (sidebar + header + content area)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Layout }          from '@/components/layout/Layout';
import { DashboardPage }   from '@/pages/DashboardPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { InsightsPage }    from '@/pages/InsightsPage';

function App() {
  const { darkMode, activeTab } = useAppStore();

  // ── Sync dark mode with the HTML element class ─────────────────────────
  // Tailwind's `dark:` variant requires `class="dark"` on <html>.
  // We drive this from Zustand state so it persists across reloads.
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // ── Tab → Page mapping ─────────────────────────────────────────────────
  // Simple in-app routing without React Router — the spec only needs 3 tabs.
  // Each tab transition re-mounts the page component for a clean animation.
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':    return <DashboardPage />;
      case 'transactions': return <TransactionsPage />;
      case 'insights':     return <InsightsPage />;
      default:             return <DashboardPage />;
    }
  };

  return (
    <Layout>
      {/*
        key={activeTab} forces React to unmount/remount the page component
        on tab change, which re-triggers the CSS entry animations cleanly.
      */}
      <div key={activeTab} className="animate-fade-in">
        {renderPage()}
      </div>
    </Layout>
  );
}

export default App;
// ─────────────────────────────────────────────────────────────────────────────
// src/components/layout/Sidebar.tsx
//
// Sidebar with butter-smooth collapse / expand.
//
// Smoothness strategy:
//   • overflow-hidden + will-change: width  → GPU-composited width animation,
//     zero layout reflow during the transition.
//   • whitespace-nowrap on all labels       → text never wraps mid-animation.
//   • Separate opacity transition on labels → they fade out slightly before the
//     width finishes collapsing, so there's no sudden clip.
//   • Single ChevronRight that rotates 180° → smooth icon flip, no hard swap.
//   • Identical duration (280ms) + easing on sidebar width, content padding,
//     and button rotation so every moving part lands at the same time.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Lightbulb,
  Moon,
  Sun,
  Shield,
  Eye,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ActiveTab } from '@/types';

interface SidebarProps {
  mobileOpen:       boolean;
  onMobileClose:    () => void;
  collapsed:        boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id:    ActiveTab;
  label: string;
  icon:  React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight  },
  { id: 'insights',     label: 'Insights',     icon: Lightbulb       },
];

// ─────────────────────────────────────────────────────────────────────────────
// Zorvyn SVG brand mark
// ─────────────────────────────────────────────────────────────────────────────
function ZorvynMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 8 C11 5 18 18 25 13 C32 8 37 5 40 4"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M4 19 C11 16 18 29 25 24 C32 19 37 16 40 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared sidebar body — rendered inside both desktop aside and mobile drawer
// ─────────────────────────────────────────────────────────────────────────────
function SidebarBody({
  collapsed,
  onToggleCollapse,
  onMobileClose,
  isMobile = false,
}: {
  collapsed:        boolean;
  onToggleCollapse: () => void;
  onMobileClose:    () => void;
  isMobile?:        boolean;
}) {
  const { activeTab, setActiveTab, role, setRole, darkMode, toggleDarkMode } = useAppStore();

  const handleNav = (tab: ActiveTab) => {
    setActiveTab(tab);
    onMobileClose();
  };

  return (
    <div className="flex flex-col h-full sidebar-bg">

      {/* ── Brand ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
        <button
          onClick={() => { setActiveTab('dashboard'); onMobileClose(); }}
          className="flex items-center gap-2.5 min-w-0 hover:opacity-70 transition-opacity duration-200 flex-shrink-0"
          aria-label="Go to dashboard"
        >
          {/* Mark is always visible — it's the same width collapsed or expanded */}
          <ZorvynMark
            className={`w-9 h-7 flex-shrink-0 ${darkMode ? 'text-white' : 'text-emerald-600'}`}
          />

          {/*
            Wordmark fades out before the width animation reaches it.
            opacity transition is 180ms so it completes slightly before
            the 280ms width animation does — prevents any visible clipping.
          */}
          <div
            className="min-w-0 leading-none overflow-hidden"
            style={{
              opacity:    collapsed ? 0 : 1,
              transition: 'opacity 180ms ease',
              // Keep the wordmark in flow even when invisible so the brand
              // area doesn't collapse before opacity finishes.
              visibility: collapsed ? 'hidden' : 'visible',
            }}
          >
            <span className={`block text-sm font-bold tracking-wide whitespace-nowrap ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              zorvyn
            </span>
            <span className={`block text-[9px] font-semibold tracking-[0.18em] uppercase mt-0.5 whitespace-nowrap ${darkMode ? 'text-slate-400' : 'text-emerald-600'}`}>
              fintech
            </span>
          </div>
        </button>

        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={onMobileClose}
            className={`ml-auto p-1.5 rounded-lg transition-colors ${darkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <div className={`mx-4 mb-3 border-t ${darkMode ? 'border-white/10' : 'border-slate-200'}`} />

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="flex-1 px-2 space-y-0.5" aria-label="Main navigation">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`nav-item w-full ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? label : undefined}
            >
              {/* Active indicator bar */}
              <span
                className={`w-0.5 h-4 rounded-full flex-shrink-0 transition-all duration-200 ${
                  isActive
                    ? darkMode ? 'bg-white' : 'bg-emerald-500'
                    : 'bg-transparent'
                }`}
              />

              <Icon size={18} className="flex-shrink-0" />

              {/*
                Label: opacity + max-width transition.
                Fading via opacity is smoother than display:none/block,
                and max-width prevents text from wrapping during width animation.
              */}
              <span
                className="whitespace-nowrap overflow-hidden"
                style={{
                  opacity:    collapsed ? 0 : 1,
                  maxWidth:   collapsed ? '0px' : '160px',
                  transition: 'opacity 180ms ease, max-width 280ms ease',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Bottom controls ─────────────────────────────────────────────── */}
      <div className="px-2 pb-5 space-y-1.5">
        <div className={`mx-2 mb-3 border-t ${darkMode ? 'border-white/10' : 'border-slate-200'}`} />

        {/* Role switcher */}
        <button
          onClick={() => setRole(role === 'admin' ? 'viewer' : 'admin')}
          className={`nav-item w-full nav-item-inactive`}
          title={collapsed ? `Role: ${role}` : undefined}
          aria-label={`Switch to ${role === 'admin' ? 'viewer' : 'admin'} role`}
        >
          {role === 'admin'
            ? <Shield size={18} className={`flex-shrink-0 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            : <Eye    size={18} className="flex-shrink-0" />
          }
          <span
            className="whitespace-nowrap overflow-hidden"
            style={{
              opacity:    collapsed ? 0 : 1,
              maxWidth:   collapsed ? '0px' : '160px',
              transition: 'opacity 180ms ease, max-width 280ms ease',
            }}
          >
            {role === 'admin' ? 'Admin' : 'Viewer'}
          </span>
          {/* Toggle pill — hidden when collapsed */}
          {!collapsed && (
            <div
              className={`ml-auto relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-300 ${
                role === 'admin' ? 'bg-emerald-500' : darkMode ? 'bg-slate-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
                  role === 'admin' ? 'left-4' : 'left-0.5'
                }`}
              />
            </div>
          )}
        </button>

        {/* Dark / Light mode */}
        <button
          onClick={toggleDarkMode}
          className="nav-item w-full nav-item-inactive"
          aria-label="Toggle dark mode"
          title={collapsed ? (darkMode ? 'Light mode' : 'Dark mode') : undefined}
        >
          {darkMode
            ? <Sun  size={18} className="flex-shrink-0 text-amber-400" />
            : <Moon size={18} className="flex-shrink-0" />
          }
          <span
            className="whitespace-nowrap overflow-hidden"
            style={{
              opacity:    collapsed ? 0 : 1,
              maxWidth:   collapsed ? '0px' : '160px',
              transition: 'opacity 180ms ease, max-width 280ms ease',
            }}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        {/* Desktop collapse toggle — bottom of sidebar */}
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className={`
              nav-item w-full
              ${darkMode
                ? 'text-slate-500 hover:text-slate-300 hover:bg-white/8'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }
              justify-center mt-1
            `}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {/*
              Single ChevronRight that rotates 180° when expanded.
              CSS transform rotation is composited on the GPU —
              zero layout impact, completely smooth.
            */}
            <ChevronRight
              size={18}
              className="flex-shrink-0 transition-transform duration-280 ease-in-out"
              style={{
                transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
            <span
              className="whitespace-nowrap overflow-hidden text-xs"
              style={{
                opacity:    collapsed ? 0 : 1,
                maxWidth:   collapsed ? '0px' : '100px',
                transition: 'opacity 160ms ease, max-width 280ms ease',
              }}
            >
              Collapse
            </span>
          </button>
        )}

        {/* Version tag */}
        <div
          className="overflow-hidden"
          style={{
            opacity:    collapsed ? 0 : 1,
            maxHeight:  collapsed ? '0px' : '24px',
            transition: 'opacity 160ms ease, max-height 280ms ease',
          }}
        >
          <p className={`text-[10px] text-center pt-1 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`}>
            v1.0 · Zorvyn Assessment
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar — exported component
// ─────────────────────────────────────────────────────────────────────────────
export function Sidebar({ mobileOpen, onMobileClose, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside
        className="hidden lg:block fixed left-0 top-0 h-screen z-30"
        style={{
          /*
            will-change: width tells the browser to promote this element to its
            own compositor layer before the animation starts — eliminates paint
            work during the transition and makes it truly butter-smooth.
          */
          willChange:   'width',
          width:        collapsed ? '64px' : '240px',
          transition:   'width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
          overflow:     'hidden',   // clips content cleanly as width shrinks
        }}
      >
        <SidebarBody
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          onMobileClose={onMobileClose}
          isMobile={false}
        />
      </aside>

      {/* ── Mobile drawer overlay ─────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 animate-slide-in">
            <SidebarBody
              collapsed={false}
              onToggleCollapse={onToggleCollapse}
              onMobileClose={onMobileClose}
              isMobile={true}
            />
          </aside>
        </>
      )}
    </>
  );
}
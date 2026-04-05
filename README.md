# Finance Dashboard — Zorvyn FinTech Frontend Intern Assignment

A production-grade financial dashboard interface built as part of the Zorvyn FinTech Frontend Developer Intern screening assessment. The application enables users to track income, expenses, and spending patterns through a clean, fully responsive interface that meets fintech product UI standards.

---

## Live Demo

| Resource | Link |
|---|---|
| Live Demo | *(Add Vercel URL after deployment)* |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 18.3 |
| Language | TypeScript | 5.5 (strict mode) |
| Styling | Tailwind CSS | 3.4 |
| State Management | Zustand | 4.5 |
| Charts | Recharts | 2.12 |
| Date Utilities | date-fns | 3.6 |
| Icons | lucide-react | 0.400 |
| Build Tool | Vite | 5.3 |

---

## Project Structure

```
finance-dashboard/
├── src/
│   ├── components/
│   │   ├── dashboard/          # Summary cards, trend chart, category chart, recent transactions
│   │   ├── insights/           # Monthly comparison, expense breakdown, smart observations
│   │   ├── layout/             # Sidebar, header, layout wrapper
│   │   ├── transactions/       # Transaction list, filters, add/edit form
│   │   └── ui/                 # Reusable primitives: Button, Card, Badge, Modal, EmptyState
│   ├── data/
│   │   └── mockData.ts         # 70 realistic INR transactions across 6 months
│   ├── pages/                  # Page-level compositors for each tab
│   ├── store/
│   │   └── useAppStore.ts      # Zustand store with localStorage persistence
│   ├── types/
│   │   └── index.ts            # All TypeScript interfaces and type aliases
│   └── utils/
│       ├── analytics.ts        # Pure functions for computing financial metrics
│       ├── exportUtils.ts      # CSV and JSON export helpers
│       └── formatters.ts       # Currency, date, and category formatting
```

---

## Features

**Dashboard Overview** gives users an at-a-glance picture of their finances through four summary metric cards — Net Balance, Total Income, Total Expenses, and Savings Rate — each showing a month-over-month delta indicator. A composed area and line chart visualises income versus expenses over time with the net balance as an overlay. A donut chart breaks down spending by category with an interactive hover effect that expands the selected slice and shows the exact amount and percentage.

**Transactions Section** displays all transactions in a paginated table with 12 rows per page. Users can search by description, merchant, or category, and filter by transaction type, category, and date range simultaneously. All active filters are shown as dismissible pills so the user always knows what is applied. Transactions can be sorted by date, amount, or category in either direction. When a user in the Admin role clicks delete, a confirmation modal appears before the transaction is removed — preventing accidental data loss.

**Role-Based UI** simulates frontend access control without a backend. Switching between Admin and Viewer roles via the sidebar toggle instantly changes what the user can do. The Admin role enables adding, editing, and deleting transactions. The Viewer role restricts the interface to read-only access, hiding all mutation controls.

**Insights Section** derives meaningful observations from the transaction data automatically. It includes a grouped bar chart for monthly income versus expense comparison, an expense breakdown table with progress bars and Lucide icon badges for each category, four key KPI tiles (top spending category, month-over-month change, savings rate, largest single expense), and four auto-generated written observations that evaluate savings health, spending trends, and category concentration.

**Export** lets users download the current filtered transaction list as either a CSV file or a JSON file directly from the browser, with no server required.

---

## Setup Instructions

**Prerequisites** — Node.js 18 or higher and npm 9 or higher.

```bash
# Clone the repository
git clone https://github.com/ThurubilliSaiManoj2026/finance-dashboard-frontend.git
cd finance-dashboard-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

```bash
# Type-check the entire codebase
npx tsc --project tsconfig.app.json --noEmit

# Create a production build
npm run build

# Preview the production build locally
npm run preview
```

---

## Architecture Decisions

**Zustand over Redux** — The state requirements here are straightforward: a list of transactions, a set of filters, a role, and a dark mode flag. Redux would require four times the boilerplate for no meaningful benefit. Zustand's `persist` middleware also handles localStorage synchronisation automatically, eliminating the need for manual sync code.

**Vite over Create React App** — CRA is officially deprecated and significantly slower. Vite's native ES module dev server starts in milliseconds and the production build uses Rollup with manual chunk splitting, keeping each bundle logically isolated.

**Inline style transitions over Tailwind class switching** — The sidebar collapse animation uses inline `style` properties for `width` and `padding-left` rather than toggling Tailwind classes. Class switching happens in the next React render cycle, introducing a one-frame lag that causes visible jitter. Inline styles are applied synchronously in the same paint, so the sidebar and content edge move in perfect lock-step.

**TypeScript strict mode throughout** — Every file passes `tsc --noEmit` with `"strict": true`. This was a deliberate constraint to catch category-mismatch bugs, missing null checks, and incorrect component prop types at compile time rather than at runtime in the browser.

**Glassmorphism via CSS layer, not inline utilities** — The `.card` class in `index.css` owns the `backdrop-filter`, `background`, `border`, and `box-shadow` definitions for both light and dark modes. This means one change in the CSS propagates to every card in the application, rather than having to update dozens of Tailwind class strings scattered across component files.

---

## State Management

All application state lives in a single Zustand store at `src/store/useAppStore.ts`. The store is divided into three logical slices: transaction data with add, edit, and delete actions; a seven-field filter state with a partial-update action and a reset action; and UI preferences for role, dark mode, and active tab. The `persist` middleware saves transactions, role, and dark mode to localStorage automatically. Filters are intentionally excluded from persistence because a user returning to the app should start with a clear view.

The `selectFilteredTransactions` function is a pure selector that lives outside the store. It takes the full store state and returns the filtered, sorted transaction array. Keeping it outside the store means it only runs when a component actually calls it, not on every state update.

---

## Mock Data

The dataset contains 70 transactions spanning January through June 2025, representing the financial activity of a tech professional based in Hyderabad. It includes six categories of income (salary at ₹85,000 per month, freelance projects, and investment dividends) and expenses across rent, groceries, utilities, healthcare, education, entertainment, and transportation. The realistic merchant names, amounts, and dates give the charts and insights enough density to render meaningfully without a backend.

---

## Evaluation Criteria Coverage

| Criterion | Implementation |
|---|---|
| Design and Creativity | Precision-minimal fintech aesthetic with glassmorphism cards, Outfit and DM Mono font pairing, and an emerald-green brand palette |
| Responsiveness | Mobile-first Tailwind grid throughout; sidebar collapses to a drawer on small screens |
| Functionality | All five core sections implemented plus CSV/JSON export and delete confirmation modal |
| User Experience | Butter-smooth sidebar collapse, staggered entrance animations, dismissible filter pills, colour-coded category avatars |
| Technical Quality | TypeScript strict mode, modular folder structure, pure utility functions with zero side effects |
| State Management | Zustand with persist middleware; partial filter updates; pure derived selector |
| Documentation | This README — setup, architecture rationale, feature coverage, and evaluation mapping |
| Attention to Detail | Two-step delete confirmation, month-over-month deltas on summary cards, savings rate health indicator, GPU-composited sidebar animation |

---

## Known Limitations

The application has no backend integration — all data is client-side mock data and any transactions added during a session are stored only in localStorage. Role switching is a UI simulation with no authentication layer. The Recharts bundle adds approximately 158KB gzipped, which is standard for a data-heavy dashboard but worth noting for performance-sensitive contexts.

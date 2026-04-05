// ─────────────────────────────────────────────────────────────────────────────
// src/main.tsx
// React 18 entry point.
// Uses createRoot (concurrent mode) for best performance.
// StrictMode is enabled: highlights potential issues in development.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Get the root DOM node. The non-null assertion is safe because index.html
// always contains <div id="root"></div>.
const rootElement = document.getElementById('root')!;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
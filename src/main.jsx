import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/shared/ErrorBoundary.jsx';
import { ToastProvider } from './components/shared/ToastProvider.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

// Fade out splash screen
setTimeout(() => {
  const splash = document.getElementById('splash');
  if (splash) {
    splash.classList.add('fade');
    setTimeout(() => splash.remove(), 600);
  }
}, 300);

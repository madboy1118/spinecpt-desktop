import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X, ft } from '../../theme.js';

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { success: () => {}, error: () => {}, info: () => {} };
  return ctx;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback((message, type = "success") => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 3000);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
  };

  const colors = {
    success: { bg: X.gD, border: X.g, text: X.g, icon: "\u2713" },
    error: { bg: X.rD, border: X.r, text: X.r, icon: "\u2717" },
    info: { bg: X.acD, border: X.ac, text: X.ac, icon: "\u2139" },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9000, display: "flex", flexDirection: "column-reverse", gap: 8, pointerEvents: "none" }}>
        {toasts.map(t => {
          const c = colors[t.type] || colors.info;
          return (
            <div key={t.id} style={{
              padding: "10px 20px", borderRadius: 10, background: c.bg, border: `1px solid ${c.border}40`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 10,
              fontFamily: ft, fontSize: 13, color: c.text, fontWeight: 600,
              animation: t.exiting ? "toastOut 0.3s ease forwards" : "toastIn 0.3s ease",
              pointerEvents: "auto",
            }}>
              <span style={{ fontSize: 16 }}>{c.icon}</span>
              {t.message}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(16px)}}
      `}</style>
    </ToastContext.Provider>
  );
}

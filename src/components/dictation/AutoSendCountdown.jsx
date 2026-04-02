import { useState, useEffect, useRef } from 'react';
import { X, ft, mn } from '../../theme.js';

export default function AutoSendCountdown({ seconds = 5, onSend, onCancel }) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onSend?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const handleCancel = () => {
    clearInterval(intervalRef.current);
    onCancel?.();
  };

  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      padding: "12px 24px", borderRadius: 12, background: X.s1,
      border: `1.5px solid ${X.ac}60`, boxShadow: `0 8px 32px rgba(0,0,0,0.6)`,
      display: "flex", alignItems: "center", gap: 16, zIndex: 200,
      animation: "fadeUp .3s ease",
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: X.t1 }}>Sending to analysis...</div>
        <div style={{ fontSize: 11, color: X.t3, marginTop: 2 }}>
          Auto-analyzing in <span style={{ color: X.ac, fontFamily: mn, fontWeight: 700 }}>{remaining}s</span>
        </div>
      </div>
      {/* Progress ring */}
      <div style={{ position: "relative", width: 36, height: 36 }}>
        <svg width="36" height="36" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="18" cy="18" r="15" fill="none" stroke={X.s3} strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke={X.ac} strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 15}`}
            strokeDashoffset={`${2 * Math.PI * 15 * (remaining / seconds)}`}
            style={{ transition: "stroke-dashoffset 1s linear" }}
            strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: X.ac, fontFamily: mn }}>
          {remaining}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => { clearInterval(intervalRef.current); onSend?.(); }} style={{
          padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: ft,
          background: `linear-gradient(135deg,${X.ac},${X.p})`, color: X.bg, fontWeight: 700, fontSize: 11,
        }}>Send Now</button>
        <button onClick={handleCancel} style={{
          padding: "6px 14px", borderRadius: 6, border: `1px solid ${X.b2}`, background: "transparent",
          color: X.t3, fontSize: 11, cursor: "pointer", fontFamily: ft,
        }}>Cancel</button>
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  );
}

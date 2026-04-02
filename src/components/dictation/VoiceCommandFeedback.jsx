import { useState, useEffect } from 'react';
import { X, ft } from '../../theme.js';

export default function VoiceCommandFeedback({ command, label }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [command, label]);

  if (!visible || !command) return null;

  const iconMap = {
    nextSection: "\u23ed",
    goBack: "\u23ee",
    readBack: "\ud83d\udd0a",
    done: "\u2713",
    undo: "\u21a9",
    pause: "\u23f8",
  };

  return (
    <div style={{
      position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)",
      padding: "10px 20px", borderRadius: 10, background: X.pD,
      border: `1.5px solid ${X.p}60`, boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
      display: "flex", alignItems: "center", gap: 10, zIndex: 200,
      animation: "fadeIn .2s ease",
    }}>
      <span style={{ fontSize: 18 }}>{iconMap[command] || "\u2022"}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: X.p, fontFamily: ft }}>{label}</span>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateX(-50%) scale(0.9)}to{opacity:1;transform:translateX(-50%) scale(1)}}`}</style>
    </div>
  );
}

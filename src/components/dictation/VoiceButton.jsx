import { X, ft } from '../../theme.js';

export default function VoiceButton({ listening, onStart, onStop, supported, engine, onToggleEngine, whisperFlowSupported }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {supported ? (
        <button onClick={listening ? onStop : onStart} style={{
          padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: ft,
          background: listening ? X.r : `linear-gradient(135deg,${X.ac},${X.p})`,
          color: listening ? "#fff" : X.bg, fontWeight: 700, fontSize: 13,
          boxShadow: listening ? `0 0 12px ${X.r}40` : "none",
          transition: "all .2s",
        }}>
          {listening ? "Stop Dictation" : "Start Dictation"}
        </button>
      ) : (
        <div style={{ fontSize: 11, color: X.t3 }}>Speech recognition not available</div>
      )}
      {/* Engine toggle */}
      {whisperFlowSupported && (
        <button onClick={onToggleEngine} style={{
          padding: "5px 10px", borderRadius: 5, fontSize: 9, fontWeight: 700, fontFamily: ft,
          border: `1px solid ${engine === "whisperflow" ? X.p : X.b1}`,
          background: engine === "whisperflow" ? X.pD : X.s2,
          color: engine === "whisperflow" ? X.p : X.t3,
          cursor: "pointer",
        }}>
          {engine === "whisperflow" ? "WhisperFlow" : "Web Speech"}
        </button>
      )}
      {listening && (
        <span style={{
          display: "inline-block", width: 8, height: 8, borderRadius: "50%",
          background: X.r, animation: "pulse 1s infinite",
        }} />
      )}
    </div>
  );
}

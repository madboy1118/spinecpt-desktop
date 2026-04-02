import { useState } from 'react';
import { X, ft, mn } from '../../theme.js';

const DELIMITERS = [
  /\n={3,}\n/,       // ===
  /\n-{3,}\n/,       // ---
  /\n\*{3,}\n/,      // ***
  /\n{3,}/,          // triple+ newlines
];

function splitNotes(text) {
  for (const delim of DELIMITERS) {
    const parts = text.split(delim).map(s => s.trim()).filter(s => s.length > 50);
    if (parts.length > 1) return parts;
  }
  return [text.trim()].filter(s => s.length > 50);
}

export default function BatchInput({ onQueue, onClose }) {
  const [text, setText] = useState("");

  const notes = text.trim() ? splitNotes(text) : [];

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: X.s1, border: `1px solid ${X.b2}`, borderRadius: 12, padding: 24, maxWidth: 640, width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: X.t1, marginBottom: 4 }}>Batch Import</div>
        <div style={{ fontSize: 12, color: X.t3, marginBottom: 12, lineHeight: 1.5 }}>
          Paste multiple op notes separated by <code style={{ fontFamily: mn, color: X.ac }}>===</code>, <code style={{ fontFamily: mn, color: X.ac }}>---</code>, or blank lines. Each note will be queued for analysis.
        </div>

        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder={"Paste first op note here...\n\n===\n\nPaste second op note here...\n\n===\n\nPaste third op note here..."}
          style={{
            width: "100%", minHeight: 250, padding: 14, borderRadius: 8, background: X.s2,
            border: `1px solid ${X.b1}`, color: X.t1, fontSize: 12, fontFamily: mn,
            lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box",
          }}
          onFocus={e => e.target.style.borderColor = X.ac}
          onBlur={e => e.target.style.borderColor = X.b1}
        />

        {/* Preview */}
        {notes.length > 0 && (
          <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: X.ac, marginBottom: 6 }}>
              {notes.length} note{notes.length !== 1 ? "s" : ""} detected
            </div>
            {notes.map((n, i) => {
              const words = n.split(/\s+/).filter(Boolean).length;
              const preview = n.slice(0, 120).replace(/\n/g, " ") + "...";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderTop: i > 0 ? `1px solid ${X.b1}` : "none" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: X.p, fontFamily: mn, width: 20, textAlign: "center" }}>{i + 1}</span>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 11, color: X.t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{preview}</div>
                  </div>
                  <span style={{ fontSize: 10, color: X.t4, fontFamily: mn, flexShrink: 0 }}>{words} words</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button onClick={() => { if (notes.length > 0) { onQueue(notes); onClose(); } }} disabled={notes.length === 0} style={{
            padding: "10px 24px", borderRadius: 7, border: "none", fontFamily: ft, flex: 1,
            cursor: notes.length > 0 ? "pointer" : "default",
            background: notes.length > 0 ? `linear-gradient(135deg,${X.ac},${X.p})` : X.s3,
            color: notes.length > 0 ? X.bg : X.t4, fontWeight: 700, fontSize: 13,
          }}>Queue {notes.length} Note{notes.length !== 1 ? "s" : ""} for Analysis</button>
          <button onClick={onClose} style={{
            padding: "10px 16px", borderRadius: 7, border: `1px solid ${X.b2}`, background: "transparent",
            color: X.t3, fontSize: 12, cursor: "pointer", fontFamily: ft,
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

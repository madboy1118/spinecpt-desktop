import { useState, useRef, useEffect } from 'react';
import { diffWords, diffLines } from 'diff';
import { X, ft, mn } from '../../theme.js';

export default function DiffView({ original, optimized }) {
  const [mode, setMode] = useState("unified"); // "unified" or "side-by-side"
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  // Sync scroll for side-by-side
  const handleScroll = (source) => {
    if (mode !== "side-by-side") return;
    const other = source === "left" ? rightRef.current : leftRef.current;
    const src = source === "left" ? leftRef.current : rightRef.current;
    if (other && src) {
      other.scrollTop = src.scrollTop;
    }
  };

  const lineDiffs = diffLines(original || "", optimized || "");
  const wordDiffs = diffWords(original || "", optimized || "");

  const addedLines = lineDiffs.filter(d => d.added).reduce((s, d) => s + d.count, 0);
  const removedLines = lineDiffs.filter(d => d.removed).reduce((s, d) => s + d.count, 0);
  const unchangedLines = lineDiffs.filter(d => !d.added && !d.removed).reduce((s, d) => s + d.count, 0);

  if (mode === "unified") {
    return (
      <div>
        <DiffToolbar mode={mode} setMode={setMode} added={addedLines} removed={removedLines} unchanged={unchangedLines} />
        <div style={{ borderRadius: 10, border: `1px solid ${X.b1}`, overflow: "hidden", maxHeight: "62vh", overflowY: "auto", background: X.s1 }}>
          <pre style={{ fontFamily: mn, fontSize: 12, lineHeight: 1.8, margin: 0, padding: 16, whiteSpace: "pre-wrap" }}>
            {wordDiffs.map((part, i) => {
              if (part.added) {
                return <span key={i} style={{ background: X.gD, color: X.g, padding: "1px 0", borderRadius: 2 }}>{part.value}</span>;
              }
              if (part.removed) {
                return <span key={i} style={{ background: X.rD, color: X.r, textDecoration: "line-through", padding: "1px 0", borderRadius: 2, opacity: 0.7 }}>{part.value}</span>;
              }
              return <span key={i} style={{ color: X.t1 }}>{part.value}</span>;
            })}
          </pre>
        </div>
      </div>
    );
  }

  // Side-by-side view
  const leftLines = [];
  const rightLines = [];
  lineDiffs.forEach(part => {
    const lines = part.value.split("\n").filter((l, i, arr) => i < arr.length - 1 || l !== "");
    if (part.removed) {
      lines.forEach(l => {
        leftLines.push({ text: l, type: "removed" });
        rightLines.push({ text: "", type: "spacer" });
      });
    } else if (part.added) {
      lines.forEach(l => {
        leftLines.push({ text: "", type: "spacer" });
        rightLines.push({ text: l, type: "added" });
      });
    } else {
      lines.forEach(l => {
        leftLines.push({ text: l, type: "unchanged" });
        rightLines.push({ text: l, type: "unchanged" });
      });
    }
  });

  const renderColumn = (lines, ref, side) => (
    <div ref={ref} onScroll={() => handleScroll(side)} style={{
      flex: 1, maxHeight: "62vh", overflowY: "auto", borderRadius: 8,
      border: `1px solid ${X.b1}`, background: X.s1,
    }}>
      <div style={{ padding: "4px 8px", background: X.s2, position: "sticky", top: 0, zIndex: 1, fontSize: 10, fontWeight: 700, color: side === "left" ? X.r : X.g }}>
        {side === "left" ? "Original" : "Optimized"}
      </div>
      <pre style={{ fontFamily: mn, fontSize: 11, lineHeight: 1.7, margin: 0, padding: "8px 12px", whiteSpace: "pre-wrap" }}>
        {lines.map((l, i) => {
          const bg = l.type === "removed" ? X.rD : l.type === "added" ? X.gD : "transparent";
          const color = l.type === "removed" ? X.r : l.type === "added" ? X.g : l.type === "spacer" ? "transparent" : X.t2;
          return (
            <div key={i} style={{ background: bg, padding: "0 4px", borderRadius: 2, minHeight: "1.7em" }}>
              <span style={{ color }}>{l.text || "\u00a0"}</span>
            </div>
          );
        })}
      </pre>
    </div>
  );

  return (
    <div>
      <DiffToolbar mode={mode} setMode={setMode} added={addedLines} removed={removedLines} unchanged={unchangedLines} />
      <div style={{ display: "flex", gap: 8 }}>
        {renderColumn(leftLines, leftRef, "left")}
        {renderColumn(rightLines, rightRef, "right")}
      </div>
    </div>
  );
}

function DiffToolbar({ mode, setMode, added, removed, unchanged }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 2, background: X.s1, borderRadius: 5, padding: 2 }}>
        {["unified", "side-by-side"].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: "4px 12px", borderRadius: 3, border: "none", cursor: "pointer",
            fontSize: 10, fontWeight: 600, fontFamily: ft,
            background: mode === m ? X.s3 : "transparent",
            color: mode === m ? X.ac : X.t3,
          }}>{m === "unified" ? "Unified" : "Side-by-Side"}</button>
        ))}
      </div>
      <span style={{ fontSize: 10, color: X.g }}>+{added} lines</span>
      <span style={{ fontSize: 10, color: X.r }}>-{removed} lines</span>
      <span style={{ fontSize: 10, color: X.t4 }}>{unchanged} unchanged</span>
    </div>
  );
}

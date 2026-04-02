import { useState, useEffect, useRef } from 'react';
import { X, ft, mn } from '../../theme.js';
import CPT from '../../data/cptLibrary.js';

const allCPT = Object.values(CPT).flat();

export default function CommandPalette({ onClose, setTab, savedCases, allSurgeons, switchSurgeon, setOpNote, setAnalysis }) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const q = query.toLowerCase().trim();
  const results = [];

  if (q) {
    // Tabs
    const tabs = ["dictate", "analyze", "cases", "library", "training", "profile", "reports", "rules", "settings"];
    tabs.filter(t => t.includes(q)).forEach(t => results.push({ type: "tab", label: `Go to ${t}`, sub: "Navigation", action: () => { setTab(t); onClose(); } }));

    // CPT codes (limit 5)
    allCPT.filter(c => c.c.includes(q) || c.d.toLowerCase().includes(q) || c.k?.some(k => k.toLowerCase().includes(q)))
      .slice(0, 5).forEach(c => results.push({ type: "cpt", label: `${c.c} — ${c.d}`, sub: `${c.v} RVU`, action: () => { setTab("library"); onClose(); } }));

    // Surgeons
    (allSurgeons?.() || []).filter(s => s.name.toLowerCase().includes(q) || s.id.includes(q))
      .forEach(s => results.push({ type: "surgeon", label: s.name, sub: s.builtin ? "Pre-trained" : "Custom", action: () => { switchSurgeon?.(s.id); setTab("profile"); onClose(); } }));

    // Cases (limit 5)
    (savedCases || []).filter(c => (c.dx || "").toLowerCase().includes(q) || (c.procedures || "").toLowerCase().includes(q) || (c.surgeonName || "").toLowerCase().includes(q))
      .slice(0, 5).forEach(c => results.push({ type: "case", label: c.dx || c.summary || "Case", sub: `${c.surgeonName} · ${c.date} · Grade ${c.grade}`, action: () => { setTab("cases"); onClose(); } }));
  }

  useEffect(() => { setSelectedIdx(0); }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(prev => Math.min(prev + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(prev => Math.max(prev - 1, 0)); }
    if (e.key === "Enter" && results[selectedIdx]) { results[selectedIdx].action(); }
  };

  const typeIcons = { tab: "\u2192", cpt: "#", surgeon: "\u263a", case: "\u2630" };
  const typeColors = { tab: X.ac, cpt: X.p, surgeon: X.g, case: X.y };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9500, display: "flex", justifyContent: "center", paddingTop: 80, backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 520, maxHeight: "60vh", background: X.s1, border: `1px solid ${X.b2}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", animation: "paletteIn 0.15s ease" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${X.b1}` }}>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Search CPT codes, cases, surgeons, tabs..."
            style={{ width: "100%", padding: "8px 0", background: "transparent", border: "none", outline: "none", color: X.t1, fontSize: 15, fontFamily: ft }} />
        </div>
        <div style={{ maxHeight: "calc(60vh - 60px)", overflowY: "auto" }}>
          {results.length === 0 && q && (
            <div style={{ padding: 20, textAlign: "center", color: X.t4, fontSize: 12 }}>No results for "{query}"</div>
          )}
          {!q && (
            <div style={{ padding: 20, textAlign: "center", color: X.t4, fontSize: 12 }}>Type to search across codes, cases, surgeons...</div>
          )}
          {results.map((r, i) => (
            <div key={i} onClick={r.action} onMouseEnter={() => setSelectedIdx(i)} style={{
              padding: "8px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
              background: i === selectedIdx ? X.s2 : "transparent",
              borderBottom: `1px solid ${X.b1}`,
            }}>
              <span style={{ fontSize: 12, color: typeColors[r.type] || X.t3, width: 20, textAlign: "center" }}>{typeIcons[r.type] || "\u2022"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: X.t1, fontWeight: i === selectedIdx ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</div>
                <div style={{ fontSize: 10, color: X.t4 }}>{r.sub}</div>
              </div>
              <span style={{ fontSize: 9, color: X.t4, textTransform: "uppercase" }}>{r.type}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "6px 16px", borderTop: `1px solid ${X.b1}`, fontSize: 10, color: X.t4, display: "flex", gap: 12 }}>
          <span><kbd style={{ fontFamily: mn, background: X.s3, padding: "1px 4px", borderRadius: 2 }}>{"\u2191\u2193"}</kbd> navigate</span>
          <span><kbd style={{ fontFamily: mn, background: X.s3, padding: "1px 4px", borderRadius: 2 }}>{"\u23ce"}</kbd> select</span>
          <span><kbd style={{ fontFamily: mn, background: X.s3, padding: "1px 4px", borderRadius: 2 }}>esc</kbd> close</span>
        </div>
      </div>
      <style>{`@keyframes paletteIn{from{opacity:0;transform:scale(0.95) translateY(-10px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  );
}

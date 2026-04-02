import { useState } from 'react';
import { diffWords } from 'diff';
import { X, ft, mn } from '../theme.js';
import TRAINING_EXAMPLES from '../data/trainingExamples.js';

const DIFF_COLORS = { green: X.g, greenBg: X.gD, red: X.r, redBg: X.rD };

export default function TrainingTab() {
  const [selectedId, setSelectedId] = useState(TRAINING_EXAMPLES[0]?.id);
  const [view, setView] = useState("annotated"); // "annotated" | "beforeafter" | "pitfalls"

  const example = TRAINING_EXAMPLES.find(e => e.id === selectedId) || TRAINING_EXAMPLES[0];
  if (!example) return null;

  const diffColor = (d) => d === "beginner" ? X.g : d === "intermediate" ? X.y : X.r;
  const origRVU = example.targetCPT.filter(c => c.status === "supported").reduce((s, c) => s + (c.rvu || 0), 0);
  const enhRVU = example.enhancedCPT.reduce((s, c) => s + (c.rvu || 0), 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 14, minHeight: "70vh" }}>
      {/* Left: Example list */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: X.t1, marginBottom: 8 }}>Training Examples</div>
        <div style={{ fontSize: 11, color: X.t3, marginBottom: 12, lineHeight: 1.5 }}>
          Study annotated op notes to learn what documentation elements matter most for CPT coding.
        </div>
        {TRAINING_EXAMPLES.map(ex => (
          <div key={ex.id} onClick={() => { setSelectedId(ex.id); setView("annotated"); }}
            style={{
              padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 4,
              border: `1px solid ${selectedId === ex.id ? X.ac : X.b1}`,
              background: selectedId === ex.id ? X.acD : X.s1,
            }}
            onMouseEnter={e => { if (selectedId !== ex.id) e.currentTarget.style.background = X.s2; }}
            onMouseLeave={e => { if (selectedId !== ex.id) e.currentTarget.style.background = X.s1; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: diffColor(ex.difficulty), flexShrink: 0 }} />
              <span style={{ fontSize: 9, color: diffColor(ex.difficulty), fontWeight: 700, textTransform: "uppercase" }}>{ex.difficulty}</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: selectedId === ex.id ? X.ac : X.t1, lineHeight: 1.3 }}>{ex.title}</div>
            <div style={{ fontSize: 10, color: X.t4, marginTop: 2 }}>{ex.procedureType}</div>
          </div>
        ))}
      </div>

      {/* Right: Example viewer */}
      <div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: X.t1 }}>{example.title}</div>
          <div style={{ fontSize: 12, color: X.t3, marginTop: 2 }}>{example.description}</div>
        </div>

        {/* View tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 12, background: X.s1, borderRadius: 6, padding: 2, width: "fit-content" }}>
          {[{ id: "annotated", l: "Annotated Note" }, { id: "beforeafter", l: "Before / After" }, { id: "pitfalls", l: "Pitfalls & Codes" }].map(t => (
            <button key={t.id} onClick={() => setView(t.id)} style={{
              padding: "5px 14px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: ft,
              background: view === t.id ? X.s3 : "transparent", color: view === t.id ? X.ac : X.t3,
            }}>{t.l}</button>
          ))}
        </div>

        {/* ANNOTATED VIEW */}
        {view === "annotated" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 12 }}>
            <div style={{ borderRadius: 10, border: `1px solid ${X.b1}`, background: X.s1, padding: 16, maxHeight: "60vh", overflowY: "auto" }}>
              <AnnotatedNote text={example.originalNote} annotations={example.annotations} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}`, padding: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: X.t4, textTransform: "uppercase", marginBottom: 6 }}>Annotations ({example.annotations.length})</div>
                {example.annotations.map((a, i) => (
                  <div key={i} style={{ padding: "6px 0", borderTop: i > 0 ? `1px solid ${X.b1}` : "none" }}>
                    <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: a.type === "missing" ? X.rD : X.yD, color: a.type === "missing" ? X.r : X.y, fontWeight: 700, textTransform: "uppercase" }}>{a.type}</span>
                    <div style={{ fontSize: 10, color: X.t2, marginTop: 3, lineHeight: 1.5 }}>{a.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BEFORE/AFTER VIEW */}
        {view === "beforeafter" && (
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <div style={{ borderRadius: 10, border: `1px solid ${X.b1}`, background: X.s1, padding: 16 }}>
              <pre style={{ fontFamily: mn, fontSize: 11, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>
                {diffWords(example.originalNote, example.enhancedNote).map((part, i) => {
                  if (part.added) return <span key={i} style={{ background: DIFF_COLORS.greenBg, color: DIFF_COLORS.green, padding: "1px 0", borderRadius: 2 }}>{part.value}</span>;
                  if (part.removed) return <span key={i} style={{ background: DIFF_COLORS.redBg, color: DIFF_COLORS.red, textDecoration: "line-through", opacity: 0.6 }}>{part.value}</span>;
                  return <span key={i} style={{ color: X.t2 }}>{part.value}</span>;
                })}
              </pre>
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 12, fontSize: 10, color: X.t4 }}>
              <span><span style={{ background: DIFF_COLORS.redBg, color: DIFF_COLORS.red, padding: "1px 4px", borderRadius: 2 }}>Red</span> = original (removed/changed)</span>
              <span><span style={{ background: DIFF_COLORS.greenBg, color: DIFF_COLORS.green, padding: "1px 4px", borderRadius: 2 }}>Green</span> = enhanced (added)</span>
            </div>
          </div>
        )}

        {/* PITFALLS & CODES VIEW */}
        {view === "pitfalls" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* CPT comparison */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: X.t2, marginBottom: 8 }}>CPT Code Impact</div>

              <div style={{ borderRadius: 8, border: `1px solid ${X.b1}`, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ padding: "6px 10px", background: X.rD, fontSize: 10, fontWeight: 700, color: X.r }}>Original Note — Captured Codes</div>
                {example.targetCPT.map((c, i) => (
                  <div key={i} style={{ padding: "6px 10px", borderTop: `1px solid ${X.b1}`, display: "flex", alignItems: "center", gap: 6 }}>
                    <code style={{ fontFamily: mn, fontSize: 11, fontWeight: 700, color: X.ac, width: 50 }}>{c.code}</code>
                    <span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 3, background: c.status === "supported" ? X.gD : c.status === "partial" ? X.yD : X.rD, color: c.status === "supported" ? X.g : c.status === "partial" ? X.y : X.r, fontWeight: 700, textTransform: "uppercase" }}>{c.status}</span>
                    <span style={{ flex: 1, fontSize: 10, color: X.t3 }}>{c.description}</span>
                    <span style={{ fontSize: 10, color: X.p, fontFamily: mn }}>{c.rvu}</span>
                  </div>
                ))}
                <div style={{ padding: "6px 10px", borderTop: `1px solid ${X.b1}`, textAlign: "right", fontSize: 11, fontWeight: 700, color: X.t2 }}>
                  Total: {origRVU.toFixed(1)} wRVU
                </div>
              </div>

              <div style={{ borderRadius: 8, border: `1px solid ${X.b1}`, overflow: "hidden" }}>
                <div style={{ padding: "6px 10px", background: X.gD, fontSize: 10, fontWeight: 700, color: X.g }}>Enhanced Note — All Codes Captured</div>
                {example.enhancedCPT.map((c, i) => (
                  <div key={i} style={{ padding: "6px 10px", borderTop: `1px solid ${X.b1}`, display: "flex", alignItems: "center", gap: 6 }}>
                    <code style={{ fontFamily: mn, fontSize: 11, fontWeight: 700, color: X.ac, width: 50 }}>{c.code}</code>
                    <span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 3, background: X.gD, color: X.g, fontWeight: 700 }}>SUPPORTED</span>
                    <span style={{ flex: 1, fontSize: 10, color: X.t2 }}>{c.description}</span>
                    <span style={{ fontSize: 10, color: X.g, fontFamily: mn, fontWeight: 700 }}>{c.rvu}</span>
                  </div>
                ))}
                <div style={{ padding: "6px 10px", borderTop: `1px solid ${X.b1}`, textAlign: "right" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: X.g }}>{enhRVU.toFixed(1)} wRVU</span>
                  {enhRVU > origRVU && <span style={{ fontSize: 11, fontWeight: 700, color: X.ac, marginLeft: 8 }}>+{(enhRVU - origRVU).toFixed(1)}</span>}
                </div>
              </div>
            </div>

            {/* Pitfalls */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: X.t2, marginBottom: 8 }}>Common Pitfalls</div>
              <div style={{ borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}`, padding: 10 }}>
                {example.pitfalls.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderTop: i > 0 ? `1px solid ${X.b1}` : "none", alignItems: "flex-start" }}>
                    <span style={{ color: X.r, fontSize: 12, flexShrink: 0, marginTop: 1 }}>{"\u26a0"}</span>
                    <span style={{ fontSize: 11, color: X.t2, lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>

              {/* Missed code reasons */}
              {example.targetCPT.filter(c => c.reason && c.status !== "supported").length > 0 && (
                <div style={{ marginTop: 12, borderRadius: 8, background: X.rD, border: `1px solid ${X.r}20`, padding: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: X.r, marginBottom: 6 }}>Why Codes Were Lost</div>
                  {example.targetCPT.filter(c => c.reason && c.status !== "supported").map((c, i) => (
                    <div key={i} style={{ padding: "4px 0", fontSize: 10, color: X.t2, lineHeight: 1.5 }}>
                      <code style={{ fontFamily: mn, color: X.ac, fontWeight: 700 }}>{c.code}</code>: {c.reason}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Renders note text with annotation highlights
function AnnotatedNote({ text, annotations }) {
  // Build highlighted version
  let parts = [{ text, type: "normal", annotation: null }];

  annotations.forEach(ann => {
    const newParts = [];
    parts.forEach(part => {
      if (part.type !== "normal") { newParts.push(part); return; }
      const idx = part.text.indexOf(ann.text);
      if (idx === -1) { newParts.push(part); return; }
      if (idx > 0) newParts.push({ text: part.text.slice(0, idx), type: "normal" });
      newParts.push({ text: ann.text, type: ann.type, annotation: ann });
      if (idx + ann.text.length < part.text.length) newParts.push({ text: part.text.slice(idx + ann.text.length), type: "normal" });
    });
    parts = newParts;
  });

  return (
    <pre style={{ fontFamily: mn, fontSize: 12, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>
      {parts.map((p, i) => {
        if (p.type === "normal") return <span key={i} style={{ color: X.t2 }}>{p.text}</span>;
        const bg = p.type === "missing" ? X.rD : X.yD;
        const border = p.type === "missing" ? `1px solid ${X.r}40` : `1px solid ${X.y}40`;
        return (
          <span key={i} style={{ background: bg, border, borderRadius: 3, padding: "1px 2px", cursor: "help" }} title={p.annotation?.message}>
            <span style={{ color: p.type === "missing" ? X.r : X.y }}>{p.text}</span>
          </span>
        );
      })}
    </pre>
  );
}

import { useState } from 'react';
import { X, ft, mn } from '../theme.js';
import GradeCircle from './shared/GradeCircle.jsx';

export default function CasesTab({ savedCases, prof, getTraining, onRemoveCase, onReAnalyze, onClearAll }) {
  const [expandedCase, setExpandedCase] = useState(null);
  const [caseFilter, setCaseFilter] = useState("all");

  const copy = s => { try { navigator.clipboard?.writeText(s); } catch {} };
  const filtered = savedCases.filter(c => caseFilter === "all" || c.grade === caseFilter).sort((a, b) => b.id - a.id);

  return (<div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: X.t1 }}>Case Backlog</div>
        <div style={{ fontSize: 11, color: X.t3, marginTop: 2 }}>
          {savedCases.length} saved case{savedCases.length !== 1 ? "s" : ""} for {prof.name || "this surgeon"}
          {getTraining() && ` + ${getTraining().trainingCases} pre-loaded`}
          {" \u00b7 "}Each saved case trains the AI on this surgeon's patterns
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 2, background: X.bg, borderRadius: 5, padding: 2 }}>
          {["all", "A", "B", "C", "D"].map(g => (
            <button key={g} onClick={() => setCaseFilter(g)} style={{
              padding: "4px 10px", borderRadius: 3, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: ft,
              background: caseFilter === g ? X.s3 : "transparent",
              color: caseFilter === g ? (g === "A" ? X.g : g === "B" ? X.ac : g === "C" ? X.y : g === "D" ? X.r : X.ac) : X.t4,
            }}>{g === "all" ? "All" : g}</button>
          ))}
        </div>
        {savedCases.length > 0 && (
          <button onClick={onClearAll} style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${X.rD}`, background: "transparent", color: X.r, fontSize: 10, cursor: "pointer", fontFamily: ft }}>Clear All</button>
        )}
      </div>
    </div>

    {savedCases.length === 0 ? (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: X.t2, marginBottom: 6 }}>No saved cases yet</div>
        <div style={{ fontSize: 12, color: X.t3, maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
          Analyze an op note in the Analyze tab, then click "Save to Training" to add it here.
        </div>
      </div>
    ) : (<div>
      {/* Stats summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8, marginBottom: 14 }}>
        {(() => {
          const grades = { A: 0, B: 0, C: 0, D: 0, F: 0 };
          let totalRvu = 0;
          savedCases.forEach(c => { if (grades[c.grade] !== undefined) grades[c.grade]++; totalRvu += c.codes.reduce((s, cd) => s + (cd.rvu * (cd.qty || 1)), 0); });
          return (<>
            <div style={{ padding: "8px 12px", borderRadius: 7, background: X.s2, border: `1px solid ${X.b1}` }}>
              <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>Total Cases</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: X.ac }}>{savedCases.length}</div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: 7, background: X.s2, border: `1px solid ${X.b1}` }}>
              <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>Avg Grade</div>
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                {Object.entries(grades).filter(([, v]) => v > 0).map(([g, v]) => (
                  <span key={g} style={{ fontSize: 11, fontWeight: 700, color: g === "A" ? X.g : g === "B" ? X.ac : g === "C" ? X.y : X.r }}>{v}{g}</span>
                ))}
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: 7, background: X.s2, border: `1px solid ${X.b1}` }}>
              <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>Total wRVU</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: X.g }}>{totalRvu.toFixed(1)}</div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: 7, background: X.s2, border: `1px solid ${X.b1}` }}>
              <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>Avg wRVU/Case</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: X.p }}>{savedCases.length > 0 ? (totalRvu / savedCases.length).toFixed(1) : "0"}</div>
            </div>
          </>);
        })()}
      </div>

      {/* Case cards */}
      <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
        {filtered.map(tc => {
          const isExpanded = expandedCase === tc.id;
          const codeRvu = tc.codes.reduce((s, c) => s + (c.rvu * (c.qty || 1)), 0);
          return (
            <div key={tc.id} style={{ marginBottom: 6, borderRadius: 8, border: `1px solid ${isExpanded ? X.b2 : X.b1}`, background: X.s1, overflow: "hidden" }}>
              <div onClick={() => setExpandedCase(isExpanded ? null : tc.id)} style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: isExpanded ? X.s2 : "transparent" }}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = X.s2; }}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = "transparent"; }}
              >
                <GradeCircle grade={tc.grade} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: X.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tc.dx || tc.summary || "Case"}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: X.t4 }}>{tc.date}</span>
                    <span style={{ fontSize: 10, color: X.t3 }}>{tc.codes.length} codes</span>
                    <span style={{ fontSize: 10, color: X.p, fontFamily: mn }}>{codeRvu.toFixed(1)} RVU</span>
                    {tc.editsAccepted > 0 && <span style={{ fontSize: 9, color: X.g }}>{"\u2713"}{tc.editsAccepted} edits</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", maxWidth: 200, justifyContent: "flex-end" }}>
                  {tc.codes.slice(0, 4).map((cd, j) => (
                    <span key={j} style={{ fontSize: 8, padding: "1px 4px", borderRadius: 3, background: cd.status === "supported" ? X.gD : cd.status === "partial" ? X.yD : X.rD, color: cd.status === "supported" ? X.g : cd.status === "partial" ? X.y : X.r, fontFamily: mn }}>{cd.code}{cd.qty > 1 ? `\u00d7${cd.qty}` : ""}</span>
                  ))}
                  {tc.codes.length > 4 && <span style={{ fontSize: 8, color: X.t4 }}>+{tc.codes.length - 4}</span>}
                </div>
                <span style={{ fontSize: 11, color: X.t4, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform .15s", flexShrink: 0 }}>{"\u25be"}</span>
              </div>

              {isExpanded && (
                <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${X.b1}` }}>
                  {tc.dx && <div style={{ marginTop: 10 }}><div style={{ fontSize: 10, fontWeight: 700, color: X.t4, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Diagnosis</div><div style={{ fontSize: 12, color: X.t1, lineHeight: 1.5 }}>{tc.dx}</div></div>}
                  {tc.procedures && <div style={{ marginTop: 8 }}><div style={{ fontSize: 10, fontWeight: 700, color: X.t4, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Procedures</div><div style={{ fontSize: 12, color: X.t2, lineHeight: 1.5 }}>{tc.procedures}</div></div>}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: X.t4, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>CPT Codes ({tc.codes.length})</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 4 }}>
                      {tc.codes.map((cd, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 4, background: X.s3 }}>
                          <code style={{ fontFamily: mn, fontWeight: 700, fontSize: 11, color: X.ac }}>{cd.code}</code>
                          {cd.qty > 1 && <span style={{ fontSize: 9, padding: "1px 4px", borderRadius: 3, background: X.acD, color: X.ac, fontWeight: 700 }}>{"\u00d7"}{cd.qty}</span>}
                          <span style={{ fontSize: 9, padding: "1px 4px", borderRadius: 3, fontWeight: 600, background: cd.status === "supported" ? X.gD : cd.status === "partial" ? X.yD : X.rD, color: cd.status === "supported" ? X.g : cd.status === "partial" ? X.y : X.r, textTransform: "uppercase" }}>{cd.status}</span>
                          <span style={{ fontSize: 10, color: X.t3, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cd.desc}</span>
                          <span style={{ fontSize: 10, color: X.p, fontFamily: mn, flexShrink: 0 }}>{(cd.rvu * (cd.qty || 1)).toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {(tc.fullNote || tc.noteExcerpt) && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: X.t4, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Op Note {tc.fullNote ? "(Full)" : "(Excerpt)"}</div>
                      <div style={{ padding: 10, borderRadius: 6, background: X.bg, border: `1px solid ${X.b1}`, maxHeight: 200, overflowY: "auto" }}>
                        <pre style={{ fontFamily: mn, fontSize: 11, lineHeight: 1.6, color: X.t3, whiteSpace: "pre-wrap", margin: 0 }}>{tc.fullNote || tc.noteExcerpt}</pre>
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={() => onReAnalyze(tc.fullNote || tc.noteExcerpt || "")} style={{ padding: "5px 14px", borderRadius: 5, border: `1px solid ${X.ac}40`, background: X.acD, color: X.ac, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: ft }}>Re-Analyze</button>
                    <button onClick={() => copy(tc.fullNote || tc.noteExcerpt || "")} style={{ padding: "5px 14px", borderRadius: 5, border: `1px solid ${X.b2}`, background: "transparent", color: X.t3, fontSize: 11, cursor: "pointer", fontFamily: ft }}>Copy Note</button>
                    <button onClick={() => onRemoveCase(tc.id)} style={{ padding: "5px 14px", borderRadius: 5, border: `1px solid ${X.rD}`, background: "transparent", color: X.r, fontSize: 11, cursor: "pointer", fontFamily: ft, marginLeft: "auto" }}>Remove from Training</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && caseFilter !== "all" && <div style={{ padding: 20, textAlign: "center", color: X.t3, fontSize: 12 }}>No cases with grade {caseFilter}</div>}
      </div>
    </div>)}
  </div>);
}

import { useState, useEffect } from 'react';
import { X, ft, mn } from '../theme.js';
import { ld } from '../modules/storage.js';
import { aggregateBillingStats } from '../modules/billing.js';

export default function ProfileTab({
  prof, surgeon, getTraining, styleMem, editHist, editPrefs, cases,
  savedCases, customProfiles, allSurgeons, switchSurgeon,
  onDeleteProfile, onNewProfile, updateProf, resetLearned, onClearCases,
}) {
  const [billingStats, setBillingStats] = useState(null);

  // Load billing data for this surgeon
  useEffect(() => {
    ld("spinecpt-billing-log", []).then(log => {
      const forSurgeon = log.filter(e => e.surgeonId === surgeon);
      if (forSurgeon.length > 0) setBillingStats(aggregateBillingStats(forSurgeon));
      else setBillingStats(null);
    });
  }, [surgeon]);

  // Compute composite accuracy score
  const editAcceptRate = editHist.length > 0 ? Math.round(editHist.filter(h => h.ok).length / editHist.length * 100) : null;
  const compositeScore = (() => {
    if (editAcceptRate === null && !billingStats) return null;
    if (!billingStats) return editAcceptRate;
    if (editAcceptRate === null) return Math.round((billingStats.avgPrecision + billingStats.avgRecall) / 2);
    return Math.round(editAcceptRate * 0.4 + billingStats.avgPrecision * 0.3 + billingStats.avgRecall * 0.3);
  })();

  return (<div style={{ maxWidth: 700 }}>
    {/* Surgeon header */}
    <div style={{ padding: 16, borderRadius: 10, background: `linear-gradient(135deg,${X.acD}40,${X.pD}40)`, border: `1px solid ${X.ac}30`, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: X.ac }}>{prof.name || "New Surgeon"}</div>
          <div style={{ fontSize: 12, color: X.t2, marginTop: 4 }}>{prof.focus || "Set subspecialty below"}</div>
        </div>
        {getTraining() && <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, background: X.gD, color: X.g, fontWeight: 700 }}>PRE-TRAINED</span>}
        {!getTraining() && <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, background: X.pD, color: X.p, fontWeight: 700 }}>LEARNING</span>}
      </div>
      {getTraining() && (
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: X.gD, color: X.g, fontWeight: 600 }}>Trained on {getTraining().trainingCases} cases</span>
          <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: X.pD, color: X.p, fontWeight: 600 }}>{getTraining().stylePatterns.length} style rules</span>
          <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: X.acD, color: X.ac, fontWeight: 600 }}>{getTraining().terminology.length} terminology rules</span>
          {getTraining().implantSystems && <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: X.s3, color: X.t2 }}>{getTraining().implantSystems.join(" \u00b7 ")}</span>}
        </div>
      )}
      {!getTraining() && (
        <div style={{ marginTop: 8, fontSize: 11, color: X.t3, lineHeight: 1.5 }}>
          No pre-trained data \u2014 the system will learn this surgeon's style from each op note analyzed.
          {styleMem.length > 0 && <span style={{ color: X.g }}> ({styleMem.length} patterns learned so far)</span>}
        </div>
      )}
    </div>

    {/* Accuracy Score Panel */}
    {compositeScore !== null && (
      <div style={{ padding: 14, borderRadius: 10, background: X.s2, border: `1px solid ${X.b1}`, marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: X.t3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>AI Accuracy Score</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Big composite score */}
          <div style={{ width: 64, height: 64, borderRadius: 14, background: compositeScore >= 80 ? X.gD : compositeScore >= 60 ? X.yD : X.rD, border: `2px solid ${compositeScore >= 80 ? X.g : compositeScore >= 60 ? X.y : X.r}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 26, fontWeight: 800, fontFamily: mn, color: compositeScore >= 80 ? X.g : compositeScore >= 60 ? X.y : X.r }}>{compositeScore}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {editAcceptRate !== null && (
                <div>
                  <div style={{ fontSize: 9, color: X.t4, fontWeight: 600 }}>Edit Accept Rate</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: X.p, fontFamily: mn }}>{editAcceptRate}%</div>
                  <div style={{ fontSize: 9, color: X.t4 }}>{editHist.length} decisions</div>
                </div>
              )}
              {billingStats && (
                <>
                  <div>
                    <div style={{ fontSize: 9, color: X.t4, fontWeight: 600 }}>Billing Precision</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: billingStats.avgPrecision >= 80 ? X.g : X.y, fontFamily: mn }}>{billingStats.avgPrecision}%</div>
                    <div style={{ fontSize: 9, color: X.t4 }}>{billingStats.caseCount} cases</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: X.t4, fontWeight: 600 }}>Billing Recall</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: billingStats.avgRecall >= 80 ? X.g : X.y, fontFamily: mn }}>{billingStats.avgRecall}%</div>
                  </div>
                </>
              )}
            </div>
            {!billingStats && <div style={{ fontSize: 10, color: X.t4, marginTop: 4 }}>Add billing comparisons in the Dev tab to track precision/recall</div>}
          </div>
        </div>
      </div>
    )}

    {/* All surgeons */}
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: X.t3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>All Surgeons</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {allSurgeons().map(s => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 0, borderRadius: 6, overflow: "hidden", border: surgeon === s.id ? `1.5px solid ${X.ac}` : `1px solid ${X.b1}` }}>
            <button onClick={() => switchSurgeon(s.id)} style={{ padding: "7px 14px", border: "none", cursor: "pointer", fontFamily: ft, fontSize: 12, fontWeight: surgeon === s.id ? 700 : 500, background: surgeon === s.id ? X.acD : X.s2, color: surgeon === s.id ? X.ac : X.t2 }}>
              {s.name}{s.builtin && <span style={{ fontSize: 8, marginLeft: 4, color: X.t4 }}>(trained)</span>}
            </button>
            {!s.builtin && (
              <button onClick={() => onDeleteProfile(s.id)} style={{ padding: "7px 8px", border: "none", borderLeft: `1px solid ${X.b1}`, cursor: "pointer", background: surgeon === s.id ? X.acD : X.s2, color: X.r, fontSize: 12, fontFamily: ft }} title="Delete profile">{"\u2715"}</button>
            )}
          </div>
        ))}
        <button onClick={onNewProfile} style={{ padding: "7px 14px", borderRadius: 6, border: `1px dashed ${X.b2}`, cursor: "pointer", background: "transparent", color: X.t3, fontSize: 12, fontFamily: ft }}>+ Add Surgeon</button>
      </div>
    </div>

    {/* Editable fields */}
    {[{ k: "name", l: "Name", ph: "Dr. Smith" }, { k: "focus", l: "Subspecialty", ph: "Degenerative lumbar, adult deformity, MIS, trauma..." }].map(f => (
      <div key={f.k} style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: X.t2, display: "block", marginBottom: 4 }}>{f.l}</label>
        <input value={prof[f.k]} onChange={e => updateProf({ ...prof, [f.k]: e.target.value })}
          placeholder={f.ph} style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: X.s2, border: `1px solid ${X.b1}`, color: X.t1, fontSize: 13, fontFamily: ft, outline: "none", boxSizing: "border-box" }} />
      </div>
    ))}

    {/* Pre-loaded training data */}
    {getTraining() && (<>
      <div style={{ marginTop: 20, padding: 14, borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: X.o, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          Pre-Trained Writing Style <span style={{ color: X.t4, fontWeight: 400 }}>({getTraining().stylePatterns.length} rules from {getTraining().trainingCases}-case analysis)</span>
        </div>
        <div style={{ maxHeight: 180, overflowY: "auto" }}>
          {getTraining().stylePatterns.map((s, i) => (
            <div key={i} style={{ fontSize: 11, color: X.t2, padding: "3px 8px", borderRadius: 4, background: X.s3, marginBottom: 2, lineHeight: 1.4 }}>
              <span style={{ color: X.o, marginRight: 6 }}>{"\u25cf"}</span>{s}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 10, padding: 14, borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: X.ac, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          Terminology Rules <span style={{ color: X.t4, fontWeight: 400 }}>({getTraining().terminology.length} rules)</span>
        </div>
        <div style={{ maxHeight: 160, overflowY: "auto" }}>
          {getTraining().terminology.map((s, i) => (
            <div key={i} style={{ fontSize: 11, color: X.t2, padding: "3px 8px", borderRadius: 4, background: X.s3, marginBottom: 2, lineHeight: 1.4 }}>
              <span style={{ color: X.ac, marginRight: 6 }}>{"\u25cf"}</span>{s}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ padding: 14, borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: X.g, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Strengths</div>
          {getTraining().strengths.map((s, i) => (
            <div key={i} style={{ fontSize: 10, color: X.g, padding: "2px 0", lineHeight: 1.4, opacity: .85 }}>{"\u2713"} {s}</div>
          ))}
        </div>
        <div style={{ padding: 14, borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: X.r, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Weaknesses (Edit Targets)</div>
          {getTraining().weaknesses.map((s, i) => (
            <div key={i} style={{ fontSize: 10, color: X.r, padding: "2px 0", lineHeight: 1.4, opacity: .85 }}>{"\u2717"} {s}</div>
          ))}
        </div>
      </div>
    </>)}

    {/* Ongoing learning */}
    <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: X.p, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
        Ongoing Learning {styleMem.length > 0 && <span style={{ color: X.t4, fontWeight: 400 }}>({styleMem.length} new observations + {editHist.length} edit decisions)</span>}
      </div>
      {styleMem.length === 0 && editHist.length === 0 ?
        <div style={{ fontSize: 11, color: X.t3 }}>Run your first analysis \u2014 the system adds to the pre-trained profile with each note.</div>
        : (<>
          {styleMem.length > 0 && (<div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: X.t4, marginBottom: 4 }}>New style observations (auto-learned):</div>
            <div style={{ maxHeight: 120, overflowY: "auto" }}>
              {styleMem.map((s, i) => (
                <div key={i} style={{ fontSize: 11, color: X.t2, padding: "3px 8px", borderRadius: 4, background: X.s3, marginBottom: 2 }}>
                  <span style={{ color: X.g, marginRight: 6 }}>+</span>{s}
                </div>
              ))}
            </div>
          </div>)}
          {editHist.length > 0 && (<>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 8 }}>
              <div><div style={{ fontSize: 9, color: X.t4 }}>New Cases</div><div style={{ fontSize: 18, fontWeight: 700, color: X.ac }}>{cases}</div></div>
              <div><div style={{ fontSize: 9, color: X.t4 }}>Decisions</div><div style={{ fontSize: 18, fontWeight: 700, color: X.p }}>{editHist.length}</div></div>
              <div><div style={{ fontSize: 9, color: X.t4 }}>Accept Rate</div><div style={{ fontSize: 18, fontWeight: 700, color: X.g }}>{Math.round(editHist.filter(h => h.ok).length / editHist.length * 100)}%</div></div>
            </div>
            {editPrefs.map((p, i) => <div key={i} style={{ fontSize: 11, color: X.t2, padding: "3px 8px", borderRadius: 4, background: X.s3, marginBottom: 2 }}>{p}</div>)}
            {(() => {
              const types = {}; editHist.forEach(h => { if (!types[h.et]) types[h.et] = { a: 0, r: 0 }; h.ok ? types[h.et].a++ : types[h.et].r++; });
              return Object.entries(types).map(([t, { a, r }]) => { const pct = Math.round(a / (a + r) * 100); return (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: X.t2, width: 80, textTransform: "capitalize" }}>{t}</span>
                  <div style={{ flex: 1, height: 5, background: X.s3, borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: pct > 60 ? X.g : pct > 30 ? X.y : X.r, borderRadius: 3 }} /></div>
                  <span style={{ fontSize: 10, color: X.t3, width: 35, textAlign: "right" }}>{pct}%</span>
                </div>); });
            })()}
          </>)}
        </>)}
    </div>

    {/* Training Cases */}
    <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: X.y, textTransform: "uppercase", letterSpacing: 1 }}>
          Training Cases <span style={{ color: X.t4, fontWeight: 400 }}>({(getTraining()?.trainingCases || 0) + savedCases.length} total)</span>
        </div>
        {savedCases.length > 0 && (
          <button onClick={onClearCases} style={{ padding: "2px 8px", borderRadius: 4, border: `1px solid ${X.b1}`, background: "transparent", color: X.t4, fontSize: 9, cursor: "pointer", fontFamily: ft }}>Clear All</button>
        )}
      </div>
      {savedCases.length === 0 ? (
        <div style={{ fontSize: 11, color: X.t3, lineHeight: 1.5 }}>No saved cases yet. After analyzing an op note, click "Save to Training".</div>
      ) : (
        <div style={{ maxHeight: 260, overflowY: "auto" }}>
          {savedCases.map(tc => (
            <div key={tc.id} style={{ padding: "8px 10px", borderRadius: 6, background: X.s3, border: `1px solid ${X.b1}`, marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: X.t4, fontFamily: mn }}>{tc.date}</span>
                <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, fontWeight: 700, background: tc.grade === "A" ? X.gD : tc.grade === "B" ? X.acD : tc.grade === "C" ? X.yD : X.rD, color: tc.grade === "A" ? X.g : tc.grade === "B" ? X.ac : tc.grade === "C" ? X.y : X.r }}>{tc.grade}</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: X.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tc.dx || tc.summary}</div>
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 4 }}>
                {tc.codes.slice(0, 8).map((cd, j) => (
                  <span key={j} style={{ fontSize: 8, padding: "1px 4px", borderRadius: 3, background: cd.status === "supported" ? X.gD : cd.status === "partial" ? X.yD : X.rD, color: cd.status === "supported" ? X.g : cd.status === "partial" ? X.y : X.r, fontFamily: mn }}>{cd.code}{cd.qty > 1 ? `\u00d7${cd.qty}` : ""}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
      <button onClick={() => { if (confirm("Erase all learned data for this surgeon?" + (getTraining() ? " Pre-trained profile is preserved." : ""))) resetLearned(); }} style={{ padding: "6px 14px", borderRadius: 5, border: `1px solid ${X.rD}`, background: "transparent", color: X.r, fontSize: 11, cursor: "pointer", fontFamily: ft }}>
        Reset All Learned Data
      </button>
      {!getTraining() && customProfiles.some(cp => cp.id === surgeon) && (
        <button onClick={() => onDeleteProfile(surgeon)} style={{ padding: "6px 14px", borderRadius: 5, border: `1px solid ${X.r}`, background: X.rB, color: X.r, fontSize: 11, cursor: "pointer", fontFamily: ft, fontWeight: 600 }}>
          Delete This Profile
        </button>
      )}
    </div>
  </div>);
}

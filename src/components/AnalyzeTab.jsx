import { useState, useEffect, useRef } from 'react';
import { X, ft, mn } from '../theme.js';
import CPT, { buildRvuLookup } from '../data/cptLibrary.js';
import { analyzeNote } from '../modules/analyzer.js';
import EditBlock from './analysis/EditBlock.jsx';
import RVUComparison from './analysis/RVUComparison.jsx';
import CodesList from './analysis/CodesList.jsx';
import DiffView from './analysis/DiffView.jsx';
import StructuredExport from './analysis/StructuredExport.jsx';
import BatchInput from './analysis/BatchInput.jsx';

const rvuLookup = buildRvuLookup();

function computeRVU(analysis) {
  if (!analysis) return { oRVU: 0, eRVU: 0, oCodes: [], eCodes: [] };

  let oCodes = analysis.original_rvu?.codes || [];
  let eCodes = analysis.enhanced_rvu?.codes || [];
  let apiOrigTotal = analysis.original_rvu?.total || 0;
  let apiEnhTotal = analysis.enhanced_rvu?.total || 0;

  if (apiOrigTotal === 0 && analysis.identified_codes?.length > 0) {
    const supported = analysis.identified_codes.filter(c => c.status === "supported");
    oCodes = [];
    supported.forEach(c => {
      const qty = c.qty || 1; const rvu = rvuLookup[c.code] || c.rvu || 0;
      for (let i = 0; i < qty; i++) oCodes.push({ code: c.code, rvu, description: c.description + (qty > 1 ? ` (#${i + 1})` : "") });
    });
    apiOrigTotal = oCodes.reduce((sum, c) => sum + c.rvu, 0);
  }
  if (apiEnhTotal === 0 && analysis.identified_codes?.length > 0) {
    const billable = analysis.identified_codes.filter(c => c.status === "supported" || c.status === "partial" || (c.status === "gap" && c.suggested_improvement));
    eCodes = [];
    billable.forEach(c => {
      const qty = c.qty || 1; const rvu = rvuLookup[c.code] || c.rvu || 0;
      for (let i = 0; i < qty; i++) eCodes.push({ code: c.code, rvu, description: c.description + (qty > 1 ? ` (#${i + 1})` : ""), new: c.status !== "supported" });
    });
    apiEnhTotal = eCodes.reduce((sum, c) => sum + c.rvu, 0);
  }

  const fixRVU = (codes) => codes.map(c => ({ ...c, rvu: rvuLookup[c.code] !== undefined ? rvuLookup[c.code] : (c.rvu || 0) }));
  oCodes = fixRVU(oCodes);
  eCodes = fixRVU(eCodes);

  const aggregate = (codes) => {
    const map = {};
    codes.forEach(c => {
      if (map[c.code]) { map[c.code].qty += 1; map[c.code].totalRvu += c.rvu; if (c.new) map[c.code].new = true; }
      else { map[c.code] = { code: c.code, description: c.description, rvu: c.rvu, qty: 1, totalRvu: c.rvu, new: !!c.new }; }
    });
    return Object.values(map);
  };

  oCodes = aggregate(oCodes);
  eCodes = aggregate(eCodes);
  const oTotal = oCodes.reduce((s, c) => s + c.totalRvu, 0);
  const eTotal = eCodes.reduce((s, c) => s + c.totalRvu, 0);

  return { oRVU: oTotal, eRVU: Math.max(eTotal, oTotal), oCodes, eCodes };
}

export default function AnalyzeTab({
  opNote, setOpNote, analysis, setAnalysis, loading, setLoading, error, setError,
  prof, surgeon, getTraining, styleMem, editPrefs, savedCases, editHist,
  allSurgeons, switchSurgeon, onNewProfile,
  jobs, activeJobId, setActiveJobId, updateJob, createJob, removeJob, fmtTime,
  logEdit, saveStyle, incrementCases,
  saveToTraining, isCaseSaved,
  autoStartAnalysis, setAutoStartAnalysis, billingCorrections, onAnalysisCompleted,
}) {
  const [activeEdit, setActiveEdit] = useState(null);
  const [accepted, setAccepted] = useState(new Set());
  const [rejected, setRejected] = useState(new Set());
  const [rTab, setRTab] = useState("edits");
  const [rate, setRate] = useState(33.89);
  const [confirmStep, setConfirmStep] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const activeJobIdRef = useRef(activeJobId);

  useEffect(() => {
    activeJobIdRef.current = activeJobId;
  }, [activeJobId]);

  const { oRVU, eRVU, oCodes, eCodes } = computeRVU(analysis);
  const delta = eRVU - oRVU;
  const nEdits = (analysis?.text_edits?.length || 0) + (analysis?.missing_paragraphs?.length || 0);

  const syncJobEdits = (acc, rej) => {
    if (activeJobId) updateJob(activeJobId, { accepted: [...acc], rejected: [...rej] });
  };

  const doAccept = idx => {
    const a = new Set(accepted); a.add(idx); setAccepted(a);
    const r = new Set(rejected); r.delete(idx); setRejected(r); setActiveEdit(null);
    const ed = analysis?.text_edits || []; const item = idx < ed.length ? ed[idx] : (analysis?.missing_paragraphs || [])[idx - ed.length];
    logEdit(item?.edit_type || "addition", true); syncJobEdits(a, r);
  };
  const doReject = idx => {
    const r = new Set(rejected); r.add(idx); setRejected(r);
    const a = new Set(accepted); a.delete(idx); setAccepted(a); setActiveEdit(null);
    const ed = analysis?.text_edits || []; const item = idx < ed.length ? ed[idx] : (analysis?.missing_paragraphs || [])[idx - ed.length];
    logEdit(item?.edit_type || "addition", false); syncJobEdits(a, r);
  };
  const doAcceptAll = () => {
    const all = new Set();
    const ed = analysis?.text_edits || []; const ins = analysis?.missing_paragraphs || [];
    ed.forEach((_, i) => all.add(i)); ins.forEach((_, i) => all.add(i + ed.length));
    setAccepted(all); setRejected(new Set()); setActiveEdit(null);
    ed.forEach(e => logEdit(e.edit_type || "edit", true)); ins.forEach(() => logEdit("addition", true));
    syncJobEdits(all, new Set());
  };

  const getFinal = () => {
    let t = opNote;
    (analysis?.text_edits || []).forEach((e, i) => { if (accepted.has(i)) t = t.replace(e.find, e.replace); });
    (analysis?.missing_paragraphs || []).map((ins, i) => ({ ...ins, idx: i + (analysis?.text_edits?.length || 0) }))
      .filter(ins => accepted.has(ins.idx)).sort((a, b) => t.indexOf(b.insert_after) - t.indexOf(a.insert_after))
      .forEach(ins => { const p = t.indexOf(ins.insert_after); if (p !== -1) { const end = p + ins.insert_after.length; t = t.slice(0, end) + "\n\n" + ins.new_text + t.slice(end); } });
    return t;
  };

  const copy = s => { try { navigator.clipboard?.writeText(s); } catch {} };

  const finishJobSuccess = async (id, parsed, surgeonId, surgeonName) => {
    updateJob(id, { status: "done", analysis: parsed, endTime: Date.now() });
    if (activeJobIdRef.current === id) {
      setAnalysis(parsed);
      setLoading(false);
      setError(null);
    }
    const obs = [...(parsed.style_observations || []), ...(parsed.terminology_observations || [])];
    if (obs.length > 0) await saveStyle(obs);
    await incrementCases();
    await onAnalysisCompleted?.({ jobId: id, surgeonId, surgeonName, result: parsed });
  };

  const finishJobError = (id, err) => {
    const errMsg = err.message?.includes("Failed to fetch") ? "Network error — check connection." : err.message;
    updateJob(id, { status: "error", error: errMsg, endTime: Date.now() });
    if (activeJobIdRef.current === id) {
      setError(errMsg);
      setLoading(false);
    }
  };

  // Auto-start analysis when coming from Dictate tab with auto-analyze flag
  useEffect(() => {
    if (!autoStartAnalysis || !opNote.trim() || analysis || loading) return;
    // Clear flag immediately to prevent re-firing
    setAutoStartAnalysis(false);
    const noteText = opNote;
    const surgeonId = surgeon;
    const surgeonName = prof.name || "Unknown";
    const id = createJob(noteText, surgeonId, surgeonName);
    setLoading(true); setError(null); setAnalysis(null);
    setAccepted(new Set()); setRejected(new Set()); setActiveEdit(null); setRTab("edits");
    (async () => {
      try {
        const parsed = await analyzeNote({
          noteText, prof, styleMem, editPrefs,
          training: getTraining(), savedCases, editHist, billingCorrections,
        });
        await finishJobSuccess(id, parsed, surgeonId, surgeonName);
      } catch (e) {
        finishJobError(id, e);
      }
    })();
  }, [autoStartAnalysis]);

  const requestAnalysis = () => { if (!opNote.trim()) return; setError(null); setConfirmStep(true); };

  const analyze = async () => {
    const noteText = opNote;
    const surgeonId = surgeon;
    const surgeonName = prof.name || "Unknown";
    const id = createJob(noteText, surgeonId, surgeonName);
    setConfirmStep(false); setLoading(true); setError(null); setAnalysis(null);
    setAccepted(new Set()); setRejected(new Set()); setActiveEdit(null); setRTab("edits");

    try {
      const parsed = await analyzeNote({
        noteText, prof, styleMem, editPrefs,
        training: getTraining(), savedCases, editHist, billingCorrections,
      });
      await finishJobSuccess(id, parsed, surgeonId, surgeonName);
    } catch (e) {
      finishJobError(id, e);
    }
  };

  const newNote = () => {
    setActiveJobId(null); setAnalysis(null); setLoading(false); setError(null);
    setAccepted(new Set()); setRejected(new Set()); setOpNote(""); setConfirmStep(false);
  };

  return (<>
    {/* Input */}
    {!analysis && !loading && !confirmStep && (<div>
      <textarea value={opNote} onChange={e => setOpNote(e.target.value)} placeholder="Paste operative note here..."
        style={{ width: "100%", minHeight: 300, padding: 16, borderRadius: 10, background: X.s2, border: `1px solid ${X.b1}`, color: X.t1, fontSize: 13, fontFamily: mn, lineHeight: 1.8, resize: "vertical", outline: "none", boxSizing: "border-box" }}
        onFocus={e => e.target.style.borderColor = X.ac} onBlur={e => e.target.style.borderColor = X.b1} />
      <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={requestAnalysis} disabled={!opNote.trim()} style={{ padding: "10px 28px", borderRadius: 7, border: "none", cursor: opNote.trim() ? "pointer" : "default", background: opNote.trim() ? `linear-gradient(135deg,${X.ac},${X.p})` : X.s3, color: opNote.trim() ? X.bg : X.t4, fontWeight: 700, fontSize: 13, fontFamily: ft }}>Analyze & Optimize</button>
        <button onClick={() => setShowBatch(true)} style={{ padding: "10px 18px", borderRadius: 7, border: `1px solid ${X.b2}`, background: "transparent", color: X.t3, fontWeight: 600, fontSize: 12, fontFamily: ft, cursor: "pointer" }}>Batch Import</button>
        {opNote.trim() && <span style={{ fontSize: 11, color: X.t3 }}>{opNote.split(/\s+/).filter(Boolean).length} words</span>}
        {opNote.trim() && (opNote.includes("HPI") || opNote.includes("Hospital Course") || opNote.includes("HISTORY OF PRESENT")) && (
          <span style={{ fontSize: 11, color: X.o, background: X.oD, padding: "2px 8px", borderRadius: 4 }}>HPI/Hospital Course detected \u2014 will auto-focus on procedure section</span>
        )}
        {prof.name && !opNote.trim() && <span style={{ fontSize: 11, color: X.t3 }}>Analyzing as {prof.name}{getTraining() ? ` (${getTraining().trainingCases}-case trained)` : ""}</span>}
      </div>
      {error && <div style={{ marginTop: 12, padding: 12, borderRadius: 7, background: X.rB, border: `1px solid ${X.rBr}40`, color: X.r, fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{error}</div>}
    </div>)}

    {/* Confirm Step */}
    {confirmStep && !loading && (<div>
      <div style={{ padding: 20, borderRadius: 12, background: X.s1, border: `1.5px solid ${X.ac}40`, maxWidth: 520, margin: "0 auto" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: X.t1, marginBottom: 12 }}>Confirm Attending Surgeon</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}`, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: `linear-gradient(135deg,${X.ac},${X.p})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: X.bg, flexShrink: 0 }}>
            {(prof.name || "?")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: X.ac }}>{prof.name || "No surgeon selected"}</div>
            <div style={{ fontSize: 11, color: X.t3 }}>{prof.focus || "No subspecialty set"}</div>
            {getTraining() && (
              <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: X.gD, color: X.g, fontWeight: 600 }}>Trained on {getTraining().trainingCases} cases</span>
                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: X.pD, color: X.p, fontWeight: 600 }}>{getTraining().stylePatterns.length} style rules</span>
                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: X.oD, color: X.o, fontWeight: 600 }}>{getTraining().terminology.length} terminology rules</span>
                {styleMem.length > 0 && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: X.acD, color: X.ac }}>+{styleMem.length} learned</span>}
              </div>
            )}
            {!getTraining() && <div style={{ fontSize: 10, color: X.y, marginTop: 4 }}>No pre-trained profile \u2014 system will learn from this note</div>}
          </div>
        </div>
        <div style={{ fontSize: 10, color: X.t4, marginBottom: 6 }}>Wrong surgeon? Switch:</div>
        <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
          {allSurgeons().map(s => (
            <button key={s.id} onClick={() => switchSurgeon(s.id)} style={{
              padding: "5px 12px", borderRadius: 5, border: surgeon === s.id ? `1.5px solid ${X.ac}` : `1px solid ${X.b1}`,
              background: surgeon === s.id ? X.acD : X.s2, color: surgeon === s.id ? X.ac : X.t3,
              fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: ft,
            }}>{s.name}</button>
          ))}
          <button onClick={() => { setConfirmStep(false); onNewProfile(); }} style={{ padding: "5px 12px", borderRadius: 5, border: `1px dashed ${X.b2}`, background: "transparent", color: X.t3, fontSize: 11, cursor: "pointer", fontFamily: ft }}>+ New</button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={analyze} style={{ padding: "10px 28px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: ft, background: `linear-gradient(135deg,${X.ac},${X.p})`, color: X.bg, fontWeight: 700, fontSize: 13, flex: 1 }}>Confirm & Analyze as {prof.name?.split(" ").pop() || "Surgeon"}</button>
          <button onClick={() => setConfirmStep(false)} style={{ padding: "10px 16px", borderRadius: 7, border: `1px solid ${X.b2}`, background: "transparent", color: X.t3, fontSize: 12, cursor: "pointer", fontFamily: ft }}>Back</button>
        </div>
      </div>
      <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}`, maxWidth: 520, margin: "12px auto 0" }}>
        <div style={{ fontSize: 10, color: X.t4, marginBottom: 4 }}>Op note preview ({opNote.split(/\s+/).filter(Boolean).length} words):</div>
        <div style={{ fontSize: 11, color: X.t3, maxHeight: 80, overflowY: "auto", fontFamily: mn, lineHeight: 1.5 }}>{opNote.slice(0, 400)}...</div>
      </div>
    </div>)}

    {/* Loading */}
    {loading && (<div style={{ padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 15, color: X.ac, fontWeight: 600 }}>Analyzing for {prof.name || "surgeon"}...</div>
      <div style={{ fontSize: 12, color: X.t3, marginTop: 6, maxWidth: 500, margin: "6px auto 0", lineHeight: 1.6 }}>
        {getTraining() ? `Using ${getTraining().trainingCases}-case training profile \u00b7 ${getTraining().stylePatterns.length} style rules \u00b7 ${getTraining().terminology.length} terminology rules \u00b7 ` : ""}
        Pre-filtering CPT codes \u00b7 computing RVU projections \u00b7 generating inline edits{styleMem.length > 0 ? ` \u00b7 +${styleMem.length} learned patterns` : ""}
      </div>
      <div style={{ marginTop: 20, height: 3, background: X.b1, borderRadius: 2, overflow: "hidden", maxWidth: 280, margin: "20px auto 0" }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg,${X.ac},${X.p})`, borderRadius: 2, animation: "ld 2s ease infinite" }} />
      </div>
      {(() => { const j = jobs.find(j => j.id === activeJobId); return j?.startTime ? (
        <div style={{ fontSize: 13, color: X.ac, marginTop: 14, fontFamily: mn, fontWeight: 600 }}>{fmtTime(Date.now() - j.startTime)}</div>
      ) : null; })()}
      <div style={{ marginTop: 16 }}>
        <button onClick={newNote} style={{ padding: "8px 20px", borderRadius: 6, border: `1px solid ${X.b2}`, background: X.s2, color: X.t2, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: ft }}>Queue Another Note</button>
        <div style={{ fontSize: 10, color: X.t4, marginTop: 6 }}>This analysis continues in the background</div>
      </div>
    </div>)}

    {/* Results */}
    {analysis && (<div>
      <RVUComparison oRVU={oRVU} eRVU={eRVU} oCodes={oCodes} eCodes={eCodes} rate={rate} />

      {/* Stats + rate */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ padding: "6px 14px", borderRadius: 6, background: X.s2, border: `1px solid ${X.b1}` }}>
          <span style={{ fontSize: 10, color: X.t4, marginRight: 6 }}>Grade</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: analysis.overall_documentation_grade === "A" ? X.g : analysis.overall_documentation_grade === "B" ? X.ac : analysis.overall_documentation_grade === "C" ? X.y : X.r }}>{analysis.overall_documentation_grade}</span>
        </div>
        <div style={{ padding: "6px 14px", borderRadius: 6, background: X.s2, border: `1px solid ${X.b1}` }}>
          <span style={{ fontSize: 10, color: X.t4, marginRight: 6 }}>Edits</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: X.p }}>{nEdits}</span>
        </div>
        <div style={{ padding: "6px 14px", borderRadius: 6, background: X.s2, border: `1px solid ${X.b1}`, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: X.t4 }}>$/RVU</span>
          <input type="number" value={rate} onChange={e => setRate(parseFloat(e.target.value) || 0)}
            style={{ width: 55, padding: "2px 6px", borderRadius: 4, border: `1px solid ${X.b1}`, background: X.s3, color: X.t1, fontSize: 12, fontFamily: mn, outline: "none" }} />
        </div>
      </div>

      {/* Save to Training */}
      {!isCaseSaved() && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: `linear-gradient(135deg,${X.gD},${X.acD}40)`, border: `1px solid ${X.g}30`, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: X.g }}>Save this case to training?</div>
            <div style={{ fontSize: 10, color: X.t3, marginTop: 2 }}>Improves future suggestions for {prof.name || "this surgeon"}</div>
          </div>
          <button onClick={() => saveToTraining(accepted)} style={{ padding: "8px 20px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: ft, background: X.g, color: X.bg, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>Save to Training</button>
        </div>
      )}
      {isCaseSaved() && (
        <div style={{ padding: "8px 14px", borderRadius: 8, background: X.gD, border: `1px solid ${X.g}20`, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, color: X.g }}>{"\u2713"}</span>
          <span style={{ fontSize: 12, color: X.g, fontWeight: 600 }}>Saved to training</span>
        </div>
      )}

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 12, background: X.s1, borderRadius: 6, padding: 2, width: "fit-content", flexWrap: "wrap", alignItems: "center" }}>
        {[{ id: "edits", l: `Edits (${nEdits})` }, { id: "codes", l: "Codes" }, { id: "diff", l: "Diff" }, { id: "checklist", l: "Checklist" }, { id: "final", l: "Final Note" }].map(t => (
          <button key={t.id} onClick={() => setRTab(t.id)} style={{ padding: "5px 12px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: ft, background: rTab === t.id ? X.s3 : "transparent", color: rTab === t.id ? X.ac : X.t3 }}>{t.l}</button>
        ))}
        <button onClick={newNote} style={{ padding: "5px 12px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 11, fontFamily: ft, background: "transparent", color: X.t4 }}>{"\u2190"} New Note</button>
        {(() => { const j = jobs.find(j => j.id === activeJobId); if (!j) return null; const elapsed = j.endTime ? j.endTime - j.startTime : Date.now() - j.startTime; return (
          <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: X.s3, color: X.t3, fontFamily: mn, marginLeft: 4 }}>{fmtTime(elapsed)}</span>
        ); })()}
      </div>

      {/* EDITS */}
      {rTab === "edits" && (<div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={doAcceptAll} style={{ padding: "5px 14px", borderRadius: 5, border: `1px solid ${X.g}40`, background: X.gD, color: X.g, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: ft }}>Accept All</button>
          <button onClick={() => { setAccepted(new Set()); setRejected(new Set()); setActiveEdit(null); }} style={{ padding: "5px 14px", borderRadius: 5, border: `1px solid ${X.b1}`, background: "transparent", color: X.t3, fontSize: 11, cursor: "pointer", fontFamily: ft }}>Reset</button>
          <span style={{ fontSize: 10, color: X.t4 }}>{accepted.size} accepted {"\u00b7"} {rejected.size} rejected</span>
        </div>
        <div style={{ maxHeight: "62vh", overflowY: "auto" }}>
          {(analysis.text_edits || []).map((e, i) => (
            <EditBlock key={`e${i}`} type="edit" data={e} idx={i} active={activeEdit === i} onToggle={() => setActiveEdit(activeEdit === i ? null : i)}
              onAccept={() => doAccept(i)} onReject={() => doReject(i)} isA={accepted.has(i)} isR={rejected.has(i)} />
          ))}
          {(analysis.missing_paragraphs || []).map((ins, i) => { const idx = i + (analysis.text_edits?.length || 0); return (
            <EditBlock key={`i${i}`} type="insert" data={ins} idx={idx} active={activeEdit === idx} onToggle={() => setActiveEdit(activeEdit === idx ? null : idx)}
              onAccept={() => doAccept(idx)} onReject={() => doReject(idx)} isA={accepted.has(idx)} isR={rejected.has(idx)} />
          ); })}
          {nEdits === 0 && <div style={{ padding: 20, color: X.t3, fontSize: 12, textAlign: "center" }}>No edits \u2014 documentation looks solid.</div>}
        </div>
      </div>)}

      {/* CODES */}
      {rTab === "codes" && <CodesList analysis={analysis} />}

      {/* DIFF */}
      {rTab === "diff" && <DiffView original={opNote} optimized={getFinal()} />}

      {/* CHECKLIST */}
      {rTab === "checklist" && (<div style={{ maxHeight: "62vh", overflowY: "auto" }}>
        {analysis.checklist?.map((it, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "7px 12px", borderRadius: 5, background: X.s1, border: `1px solid ${X.b1}`, marginBottom: 3 }}>
            <span style={{ fontSize: 14, color: it.present ? X.g : X.r, flexShrink: 0 }}>{it.present ? "\u2713" : "\u2717"}</span>
            <div><div style={{ fontSize: 12, fontWeight: 600, color: it.present ? X.t1 : X.r }}>{it.item}</div>{it.note && <div style={{ fontSize: 10, color: X.t3 }}>{it.note}</div>}</div>
          </div>
        )) || <div style={{ padding: 20, color: X.t3, textAlign: "center", fontSize: 12 }}>No checklist.</div>}
      </div>)}

      {/* FINAL — Structured Export */}
      {rTab === "final" && (
        <StructuredExport
          finalNote={getFinal()}
          analysis={analysis}
          oRVU={oRVU} eRVU={eRVU} oCodes={oCodes} eCodes={eCodes}
          prof={prof} rate={rate}
        />
      )}
    </div>)}

    {/* Job Queue Panel — always visible when jobs exist */}
    {jobs.length > 0 && (
      <div style={{ marginTop: 16, borderRadius: 10, border: `1px solid ${X.b1}`, background: X.s1, overflow: "hidden" }}>
        <JobQueuePanel jobs={jobs} activeJobId={activeJobId} fmtTime={fmtTime}
          onLoad={(id) => {
            const job = jobs.find(j => j.id === id);
            if (!job) return;
            setActiveJobId(id); setOpNote(job.opNote);
            if (job.status === "done") { setAnalysis(job.analysis); setAccepted(new Set(job.accepted || [])); setRejected(new Set(job.rejected || [])); setError(null); setLoading(false); setRTab("edits"); setActiveEdit(null); }
            else if (job.status === "error") { setAnalysis(null); setError(job.error); setLoading(false); }
            else if (job.status === "running") { setAnalysis(null); setError(null); setLoading(true); }
            setConfirmStep(false);
          }}
          onRemove={(id) => {
            removeJob(id);
            if (activeJobId === id) { setActiveJobId(null); setAnalysis(null); setLoading(false); setError(null); }
          }}
          onClear={() => {}}
        />
      </div>
    )}

    {/* Batch Import Modal */}
    {showBatch && (
      <BatchInput
        onClose={() => setShowBatch(false)}
        onQueue={async (notes) => {
          for (const noteText of notes) {
            const surgeonId = surgeon;
            const surgeonName = prof.name || "Unknown";
            const id = createJob(noteText, surgeonId, surgeonName, { setActive: false });
            // Fire analysis for each note (concurrent)
            (async () => {
              try {
                const parsed = await analyzeNote({
                  noteText, prof, styleMem, editPrefs,
                  training: getTraining(), savedCases, editHist, billingCorrections,
                });
                await finishJobSuccess(id, parsed, surgeonId, surgeonName);
              } catch (e) {
                finishJobError(id, e);
              }
            })();
          }
        }}
      />
    )}
  </>);
}

function JobQueuePanel({ jobs, activeJobId, fmtTime, onLoad, onRemove }) {
  const [show, setShow] = useState(false);
  const fmtTimestamp = (ts) => { if (!ts) return ""; return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); };

  return (<>
    <div onClick={() => setShow(!show)} style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: X.s2, borderBottom: show ? `1px solid ${X.b1}` : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: X.t1 }}>Job Queue</span>
        <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: X.acD, color: X.ac, fontWeight: 700 }}>{jobs.length}</span>
        {jobs.some(j => j.status === "running") && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: X.pD, color: X.p, fontWeight: 600 }}>{jobs.filter(j => j.status === "running").length} running</span>}
        {jobs.filter(j => j.status === "done").length > 0 && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: X.gD, color: X.g, fontWeight: 600 }}>{jobs.filter(j => j.status === "done").length} done</span>}
        {jobs.filter(j => j.status === "error").length > 0 && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: X.rD, color: X.r, fontWeight: 600 }}>{jobs.filter(j => j.status === "error").length} failed</span>}
      </div>
      <span style={{ fontSize: 11, color: X.t4, transform: show ? "rotate(180deg)" : "none", transition: "transform .15s" }}>{"\u25be"}</span>
    </div>
    {show && (
      <div style={{ maxHeight: 300, overflowY: "auto" }}>
        {jobs.map(j => {
          const isActive = j.id === activeJobId;
          const elapsed = j.endTime ? j.endTime - j.startTime : (j.status === "running" ? Date.now() - j.startTime : 0);
          return (
            <div key={j.id} onClick={() => { if (j.status !== "running") onLoad(j.id); }} style={{ padding: "10px 14px", borderBottom: `1px solid ${X.b1}`, display: "flex", alignItems: "center", gap: 10, background: isActive ? X.s3 : "transparent", cursor: j.status !== "running" ? "pointer" : "default" }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = X.s2; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: j.status === "done" ? X.g : j.status === "error" ? X.r : X.ac, boxShadow: j.status === "running" ? `0 0 6px ${X.ac}` : "none" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: X.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.noteSnippet || "Op Note"}</span>
                  {isActive && <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: X.acD, color: X.ac, fontWeight: 700, flexShrink: 0 }}>VIEWING</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <span style={{ fontSize: 10, color: X.t3 }}>{j.surgeonName}</span>
                  <span style={{ fontSize: 10, color: X.t4 }}>{fmtTimestamp(j.startTime)}</span>
                  {j.status === "error" && <span style={{ fontSize: 10, color: X.r, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{j.error}</span>}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, minWidth: 50 }}>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: mn, color: j.status === "running" ? X.ac : j.status === "done" ? X.g : X.r }}>{fmtTime(elapsed)}</div>
                <div style={{ fontSize: 9, color: X.t4, textTransform: "uppercase", fontWeight: 600 }}>{j.status}</div>
              </div>
              <button onClick={e => { e.stopPropagation(); onRemove(j.id); }} style={{ padding: "2px 6px", borderRadius: 4, border: `1px solid ${X.b1}`, background: "transparent", color: X.t4, fontSize: 11, cursor: "pointer", fontFamily: ft, flexShrink: 0 }} title="Remove">{"\u2715"}</button>
            </div>
          );
        })}
      </div>
    )}
  </>);
}

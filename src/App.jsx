import { useState, useEffect, useCallback } from 'react';
import { X, ft, setTheme, getTheme, toggleTheme } from './theme.js';
import { useSurgeon } from './hooks/useSurgeon.js';
import { useJobs } from './hooks/useJobs.js';
import { ld, sv } from './modules/storage.js';
import { logApiUsage } from './components/DevTab.jsx';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
import { logAuditEvent } from './modules/auditLog.js';
import Header from './components/Header.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import DictateTab from './components/DictateTab.jsx';
import AnalyzeTab from './components/AnalyzeTab.jsx';
import CasesTab from './components/CasesTab.jsx';
import LibraryTab from './components/LibraryTab.jsx';
import ProfileTab from './components/ProfileTab.jsx';
import RulesTab from './components/RulesTab.jsx';
import DevTab from './components/DevTab.jsx';
import ReportingTab from './components/ReportingTab.jsx';
import UpdateNotification from './components/UpdateNotification.jsx';
import TrainingTab from './components/TrainingTab.jsx';
import SettingsTab, { VERSION } from './components/SettingsTab.jsx';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import { useSessionTimer } from './hooks/useSessionTimer.js';
import { useRecentNotes } from './hooks/useRecentNotes.js';
import { useToast } from './components/shared/ToastProvider.jsx';
import TabTransition from './components/shared/TabTransition.jsx';
import CommandPalette from './components/shared/CommandPalette.jsx';
import Breadcrumb from './components/shared/Breadcrumb.jsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("analyze");
  const [opNote, setOpNote] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFocus, setNewFocus] = useState("");
  const [autoStartAnalysis, setAutoStartAnalysis] = useState(false);

  const surgeonState = useSurgeon();
  const jobState = useJobs();
  const { isOffline, reason: offlineReason } = useOnlineStatus();
  const { duration: sessionDuration } = useSessionTimer();
  const { recentNotes, addRecentNote } = useRecentNotes();
  const toast = useToast();
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [theme, setThemeState] = useState("dark");

  // Load saved theme
  useEffect(() => {
    ld("spinecpt-theme", "dark").then(t => {
      if (t === "light") { setTheme("light"); setThemeState("light"); }
    });
  }, []);

  const handleToggleTheme = useCallback(() => {
    const next = toggleTheme();
    setThemeState(next);
    sv("spinecpt-theme", next);
    document.body.style.background = X.bg;
    document.body.style.color = X.t1;
  }, []);

  const {
    surgeon, prof, styleMem, editHist, editPrefs, cases, savedCases, customProfiles, billingCorrections,
    getTraining, allSurgeons, initSurgeon, switchSurgeon, createProfile, deleteProfile,
    logEdit, saveStyle, updateProf, incrementCases, updateSavedCases, resetLearned, addBillingCorrection, sk,
  } = surgeonState;

  const {
    jobs, activeJobId, setActiveJobId, showQueue, setShowQueue, tick,
    fmtTime, fmtTimestamp, updateJob, createJob, removeJob, clearDoneJobs, initJobs,
  } = jobState;

  // Restore last logged-in user on mount
  useEffect(() => {
    ld("spinecpt-current-user", null).then(u => {
      if (u) setCurrentUser(u);
    });
  }, []);

  // Init app data once logged in
  useEffect(() => {
    if (!currentUser) return;
    initSurgeon();
    initJobs();
  }, [currentUser]);

  // Auto-restore last active job's note and analysis after jobs load
  useEffect(() => {
    if (activeJobId && jobs.length > 0 && !analysis && !loading) {
      const job = jobs.find(j => j.id === activeJobId);
      if (job && job.status === "done" && job.analysis) {
        setOpNote(job.opNote);
        setAnalysis(job.analysis);
      }
    }
  }, [activeJobId, jobs]);

  const handleLogin = async (user) => {
    setCurrentUser(user);
    await sv("spinecpt-current-user", user);
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    await sv("spinecpt-current-user", null);
    setAnalysis(null);
    setOpNote("");
    setTab("analyze");
  };

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onAnalyze: () => { if (tab === "analyze" && opNote.trim() && !loading) setAutoStartAnalysis(true); },
    onNewNote: () => { setOpNote(""); setAnalysis(null); setError(null); },
    onSave: () => { if (analysis) saveToTraining(new Set()); },
    onToggleDictation: () => { if (tab !== "dictate") setTab("dictate"); },
    onCommandPalette: () => setShowCommandPalette(true),
  });

  // Close confirmation listener
  useEffect(() => {
    if (!window.electronAPI?.onCheckUnsaved) return;
    window.electronAPI.onCheckUnsaved(() => {
      const isDirty = !!(opNote.trim() && !analysis) || loading;
      window.electronAPI.respondUnsaved(isDirty);
    });
  }, [opNote, analysis, loading]);

  const handleSwitchSurgeon = async (s) => {
    await switchSurgeon(s);
    setAnalysis(null);
  };

  const isCaseSaved = () => !!activeJobId && savedCases.some(c => c.sourceJobId === activeJobId);

  const handleAnalysisCompleted = async ({ jobId, surgeonId, surgeonName, result }) => {
    if (!currentUser || !result?._usage) return;
    await logApiUsage(result._usage, currentUser.id, surgeonId);
    addRecentNote(opNote, result, surgeonName);
    toast.success(`Analysis complete — Grade ${result.overall_documentation_grade || "?"}`);
    await logAuditEvent("analysis_completed", currentUser.id, surgeonId, surgeonName, jobId, {
      grade: result.overall_documentation_grade,
      codeCount: result.identified_codes?.length || 0,
      editCount: (result.text_edits?.length || 0) + (result.missing_paragraphs?.length || 0),
    });
  };

  const saveToTraining = async (accepted) => {
    if (!analysis || !opNote.trim()) return;
    const codes = analysis.identified_codes || [];
    const tc = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      surgeonId: surgeon,
      surgeonName: prof.name || "Unknown",
      dx: (() => {
        const m = opNote.match(/(?:PREOPERATIVE DIAGNOS[IE]S?|DIAGNOSIS|POSTOPERATIVE DIAGNOS[IE]S?):\s*\n?(.*?)(?:\n\n|\n[A-Z])/is);
        return m ? m[1].trim().slice(0, 150) : (analysis.summary || "").slice(0, 150);
      })(),
      summary: analysis.summary || "",
      sourceJobId: activeJobId || null,
      procedures: (() => {
        const m = opNote.match(/(?:PROCEDURE[S]? PERFORMED|OPERATIVE PROCEDURE|PROCEDURE):\s*\n?(.*?)(?:\n\n|\n[A-Z])/is);
        return m ? m[1].trim().slice(0, 300) : "";
      })(),
      codes: codes.map(c => ({ code: c.code, status: c.status, qty: c.qty || 1, rvu: c.rvu || 0, desc: c.description?.slice(0, 80) || "" })),
      grade: analysis.overall_documentation_grade || "?",
      style: analysis.style_observations || [],
      terminology: analysis.terminology_observations || [],
      noteExcerpt: (() => {
        const markers = ["DESCRIPTION OF PROCEDURE", "PROCEDURE IN DETAIL", "PROCEDURE:"];
        for (const m of markers) { const idx = opNote.toUpperCase().indexOf(m); if (idx !== -1) return opNote.slice(idx, idx + 600); }
        return opNote.slice(0, 600);
      })(),
      fullNote: opNote,
      analysisSnapshot: {
        identified_codes: analysis.identified_codes || [],
        bundling_warnings: analysis.bundling_warnings || [],
        missing_elements: analysis.missing_elements || [],
        text_edits: (analysis.text_edits || []).length,
        missing_paragraphs: (analysis.missing_paragraphs || []).length,
        original_rvu: analysis.original_rvu || { codes: [], total: 0 },
        enhanced_rvu: analysis.enhanced_rvu || { codes: [], total: 0 },
      },
      editsAccepted: accepted?.size || 0,
      editsRejected: 0,
      totalEdits: (analysis.text_edits?.length || 0) + (analysis.missing_paragraphs?.length || 0),
    };
    const updated = (
      tc.sourceJobId
        ? [...savedCases.filter(c => c.sourceJobId !== tc.sourceJobId), tc]
        : [...savedCases, tc]
    ).slice(-50);
    await updateSavedCases(updated);
    if (currentUser) logAuditEvent("case_saved", currentUser.id, surgeon, prof.name, activeJobId, { grade: tc.grade, codes: tc.codes.length });
    toast.success("Case saved to training");
  };

  const handleCreateProfile = async () => {
    const ok = await createProfile(newName, newFocus);
    if (ok) {
      setNewName(""); setNewFocus(""); setShowNewProfile(false);
      setTab("profile");
    }
  };

  // Show login screen if not logged in
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div style={{ fontFamily: ft, background: X.bg, color: X.t1, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      <UpdateNotification />

      <Header
        tab={tab} setTab={setTab} surgeon={surgeon}
        allSurgeons={allSurgeons} switchSurgeon={handleSwitchSurgeon}
        onNewProfile={() => setShowNewProfile(true)}
        getTraining={getTraining} cases={cases} styleMem={styleMem}
        currentUser={currentUser} onLogout={handleLogout}
        jobs={jobs} isOffline={isOffline} offlineReason={offlineReason}
        sessionDuration={sessionDuration}
        theme={theme} onToggleTheme={handleToggleTheme}
      />

      {/* Breadcrumb */}
      <Breadcrumb trail={[
        { label: tab.charAt(0).toUpperCase() + tab.slice(1), onClick: () => {} },
        ...(analysis && tab === "analyze" ? [{ label: "Analysis Results" }] : []),
      ]} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 14px" }}>

        {/* Command Palette */}
        {showCommandPalette && (
          <CommandPalette
            onClose={() => setShowCommandPalette(false)}
            setTab={setTab} savedCases={savedCases} allSurgeons={allSurgeons}
            switchSurgeon={handleSwitchSurgeon} setOpNote={setOpNote} setAnalysis={setAnalysis}
          />
        )}

        {/* New Profile Modal */}
        {showNewProfile && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setShowNewProfile(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background: X.s1, border: `1px solid ${X.b2}`, borderRadius: 12, padding: 24, maxWidth: 440, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: X.t1, marginBottom: 4 }}>Add New Surgeon</div>
              <div style={{ fontSize: 12, color: X.t3, marginBottom: 16 }}>Create a profile that learns from their op notes over time.</div>

              <label style={{ fontSize: 11, fontWeight: 600, color: X.t2, display: "block", marginBottom: 4 }}>Surgeon Name *</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Dr. Lastname" autoFocus
                style={{ width: "100%", padding: "10px 12px", borderRadius: 6, background: X.s2, border: `1px solid ${X.b1}`, color: X.t1, fontSize: 14, fontFamily: ft, outline: "none", boxSizing: "border-box", marginBottom: 12 }}
                onFocus={e => e.target.style.borderColor = X.ac} onBlur={e => e.target.style.borderColor = X.b1}
                onKeyDown={e => { if (e.key === "Enter" && newName.trim()) handleCreateProfile(); }} />

              <label style={{ fontSize: 11, fontWeight: 600, color: X.t2, display: "block", marginBottom: 4 }}>Subspecialty / Focus</label>
              <input value={newFocus} onChange={e => setNewFocus(e.target.value)} placeholder="e.g., Degenerative lumbar, MIS, adult deformity, trauma..."
                style={{ width: "100%", padding: "10px 12px", borderRadius: 6, background: X.s2, border: `1px solid ${X.b1}`, color: X.t1, fontSize: 13, fontFamily: ft, outline: "none", boxSizing: "border-box", marginBottom: 16 }}
                onFocus={e => e.target.style.borderColor = X.ac} onBlur={e => e.target.style.borderColor = X.b1}
                onKeyDown={e => { if (e.key === "Enter" && newName.trim()) handleCreateProfile(); }} />

              <div style={{ padding: 12, borderRadius: 7, background: X.s2, border: `1px solid ${X.b1}`, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: X.t3, lineHeight: 1.5 }}>
                  The system starts blank and auto-learns this surgeon's style, terminology, and documentation patterns from each op note analyzed. After 3\u20135 notes, suggestions will be personalized.
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleCreateProfile} disabled={!newName.trim()} style={{
                  padding: "10px 24px", borderRadius: 7, border: "none", cursor: newName.trim() ? "pointer" : "default", fontFamily: ft,
                  background: newName.trim() ? `linear-gradient(135deg,${X.ac},${X.p})` : X.s3,
                  color: newName.trim() ? X.bg : X.t4, fontWeight: 700, fontSize: 13, flex: 1,
                }}>Create Profile</button>
                <button onClick={() => { setShowNewProfile(false); setNewName(""); setNewFocus(""); }} style={{
                  padding: "10px 16px", borderRadius: 7, border: `1px solid ${X.b2}`, background: "transparent",
                  color: X.t3, fontSize: 12, cursor: "pointer", fontFamily: ft,
                }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <TabTransition tabKey={tab}>

        {/* DICTATE */}
        {tab === "dictate" && (
          <DictateTab
            onSendToAnalyze={(text, opts) => {
              setOpNote(text);
              setTab("analyze");
              if (opts?.autoAnalyze) setAutoStartAnalysis(true);
            }}
            prof={prof}
          />
        )}

        {/* ANALYZE */}
        {tab === "analyze" && (
          <AnalyzeTab
            opNote={opNote} setOpNote={setOpNote}
            analysis={analysis} setAnalysis={setAnalysis}
            loading={loading} setLoading={setLoading}
            error={error} setError={setError}
            prof={prof} surgeon={surgeon} getTraining={getTraining}
            styleMem={styleMem} editPrefs={editPrefs} savedCases={savedCases} editHist={editHist}
            allSurgeons={allSurgeons} switchSurgeon={handleSwitchSurgeon}
            onNewProfile={() => setShowNewProfile(true)}
            jobs={jobs} activeJobId={activeJobId} setActiveJobId={setActiveJobId}
            updateJob={updateJob} createJob={createJob} removeJob={removeJob} fmtTime={fmtTime}
            logEdit={logEdit} saveStyle={saveStyle} incrementCases={incrementCases}
            saveToTraining={saveToTraining} isCaseSaved={isCaseSaved}
            autoStartAnalysis={autoStartAnalysis} setAutoStartAnalysis={setAutoStartAnalysis}
            billingCorrections={billingCorrections}
            onAnalysisCompleted={handleAnalysisCompleted}
          />
        )}

        {/* CASES */}
        {tab === "cases" && (
          <CasesTab
            savedCases={savedCases} prof={prof} getTraining={getTraining}
            onRemoveCase={async (id) => { await updateSavedCases(savedCases.filter(c => c.id !== id)); }}
            onReAnalyze={(text) => { setOpNote(text); setTab("analyze"); setAnalysis(null); }}
            onClearAll={async () => { if (confirm(`Clear all ${savedCases.length} saved cases?`)) await updateSavedCases([]); }}
          />
        )}

        {/* LIBRARY */}
        {tab === "library" && <LibraryTab />}

        {/* PROFILE */}
        {tab === "profile" && (
          <ProfileTab
            prof={prof} surgeon={surgeon} getTraining={getTraining}
            styleMem={styleMem} editHist={editHist} editPrefs={editPrefs}
            cases={cases} savedCases={savedCases} customProfiles={customProfiles}
            allSurgeons={allSurgeons} switchSurgeon={handleSwitchSurgeon}
            onDeleteProfile={deleteProfile} onNewProfile={() => setShowNewProfile(true)}
            updateProf={updateProf} resetLearned={resetLearned}
            onClearCases={async () => { if (confirm(`Clear all saved training cases?`)) await updateSavedCases([]); }}
          />
        )}

        {/* RULES */}
        {tab === "rules" && <RulesTab />}

        {/* TRAINING */}
        {tab === "training" && <TrainingTab />}

        {/* REPORTS */}
        {tab === "reports" && (
          <ReportingTab allSurgeons={allSurgeons} savedCases={savedCases} jobs={jobs} surgeon={surgeon} />
        )}

        {/* SETTINGS */}
        {tab === "settings" && <SettingsTab />}

        {/* DEV — only for developers */}
        {tab === "dev" && currentUser?.role === "developer" && <DevTab jobs={jobs} surgeon={surgeon} allSurgeons={allSurgeons} addBillingCorrection={addBillingCorrection} />}

        </TabTransition>
      </div>

      {/* Version footer */}
      <div style={{ textAlign: "center", padding: "12px 0 16px", borderTop: `1px solid ${X.b1}`, marginTop: 8 }}>
        <span style={{ fontSize: 10, color: X.t4 }}>SpineCPT Pro v{VERSION} &middot; &copy; 2026 University of Maryland</span>
      </div>

      <style>{`
        @keyframes ld{0%{width:5%;opacity:.5}50%{width:70%;opacity:1}100%{width:95%;opacity:.6}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        *{scrollbar-width:thin;scrollbar-color:${X.b1} transparent}
        textarea::placeholder,input::placeholder{color:${X.t4}}
        button:hover{filter:brightness(1.1)}
      `}</style>
    </div>
  );
}

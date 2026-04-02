import { X, ft } from '../theme.js';
import { totalCodeCount } from '../data/cptLibrary.js';

export default function Header({ tab, setTab, surgeon, allSurgeons, switchSurgeon, onNewProfile, getTraining, cases, styleMem, currentUser, onLogout, jobs, isOffline, offlineReason, sessionDuration, theme, onToggleTheme }) {
  const isDev = currentUser?.role === "developer";
  const tabs = ["dictate", "analyze", "cases", "library", "training", "profile", "reports", "rules", "settings"];
  if (isDev) tabs.push("dev");
  const runningJobs = (jobs || []).filter(j => j.status === "running").length;

  return (
    <div style={{ background: X.s1, position: "sticky", top: 0, zIndex: 50 }}>
      {/* Custom title bar — drag region + window controls */}
      <div style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", WebkitAppRegion: "drag", background: X.bg, borderBottom: `1px solid ${X.b1}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, WebkitAppRegion: "no-drag" }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: `linear-gradient(135deg,${X.ac},${X.p})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 9, color: X.bg }}>S</div>
          <span style={{ fontSize: 11, fontWeight: 600, color: X.t2 }}>SpineCPT Pro</span>
          {isOffline && <span style={{ fontSize: 7, padding: "1px 4px", borderRadius: 2, background: X.yD, color: X.y, fontWeight: 700 }}>OFFLINE</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, WebkitAppRegion: "no-drag" }}>
          {sessionDuration && <span style={{ fontSize: 9, color: X.t4, fontFamily: "'JetBrains Mono',monospace", marginRight: 4 }}>{sessionDuration}</span>}
          {/* Theme toggle */}
          <button onClick={onToggleTheme} title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} style={{
            background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "2px 6px",
            color: X.t3, borderRadius: 4,
          }}>{theme === "dark" ? "\u2600" : "\u263d"}</button>
          {/* Window controls */}
          <button onClick={() => window.electronAPI?.windowMinimize?.()} title="Minimize" style={winBtnStyle}>&#x2014;</button>
          <button onClick={() => window.electronAPI?.windowMaximize?.()} title="Maximize" style={winBtnStyle}>&#x25a1;</button>
          <button onClick={() => window.electronAPI?.windowClose?.()} title="Close" style={{ ...winBtnStyle, color: X.r }}>&times;</button>
        </div>
      </div>

      {/* Main header bar */}
      <div style={{ padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${X.b1}`, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 10, color: X.t4 }}>
          {totalCodeCount} codes {"\u00b7"} {getTraining()?.trainingCases || 0} training cases
          {cases > 0 && ` \u00b7 ${cases} new`}
          {styleMem.length > 0 && ` \u00b7 +${styleMem.length} learned`}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Surgeon Selector */}
          <div style={{ display: "flex", gap: 2, background: X.bg, borderRadius: 6, padding: 2, flexWrap: "wrap" }}>
            {allSurgeons().map(s => (
              <button key={s.id} onClick={() => switchSurgeon(s.id)} title={s.name} style={{
                padding: "4px 8px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: ft,
                background: surgeon === s.id ? `linear-gradient(135deg,${X.acD},${X.pD})` : X.s2,
                color: surgeon === s.id ? X.ac : X.t3, transition: "all .15s",
              }}>{s.name.replace("Dr. ", "")}{!s.builtin && " *"}</button>
            ))}
            <button onClick={onNewProfile} title="Add new surgeon profile" style={{
              padding: "4px 8px", borderRadius: 4, border: `1px dashed ${X.b2}`, cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: ft,
              background: "transparent", color: X.t3,
            }}>+</button>
          </div>
          {/* Tab nav */}
          <div style={{ display: "flex", gap: 2, background: X.bg, borderRadius: 6, padding: 2, flexWrap: "wrap" }}>
            {tabs.map(t => {
              const tooltips = { dictate: "Voice dictation (Ctrl+D)", analyze: "Analyze op notes (Ctrl+Enter)", cases: "Saved training cases", library: "CPT code library", training: "Training examples", profile: "Surgeon profiles", reports: "Aggregate reporting", rules: "NCCI rules & compliance", settings: "App settings (Ctrl+,)", dev: "Developer console" };
              return (
                <button key={t} onClick={() => setTab(t)} title={tooltips[t] || t} style={{
                  padding: "4px 10px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: ft,
                  background: tab === t ? X.s3 : "transparent",
                  color: tab === t ? (t === "dev" ? X.p : t === "settings" ? X.t2 : X.ac) : X.t3,
                  textTransform: "capitalize", position: "relative",
                }}>
                  {t === "settings" ? "\u2699" : t}
                  {t === "analyze" && runningJobs > 0 && (
                    <span style={{ position: "absolute", top: -2, right: -2, width: 12, height: 12, borderRadius: "50%", background: X.ac, color: X.bg, fontSize: 7, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{runningJobs}</span>
                  )}
                </button>
              );
            })}
          </div>
          {/* User badge */}
          {currentUser && (
            <button onClick={onLogout} title="Switch user" style={{
              padding: "4px 8px", borderRadius: 5, border: `1px solid ${X.b1}`, background: X.s2,
              color: X.t2, fontSize: 10, fontWeight: 600, fontFamily: ft, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <span style={{ textTransform: "capitalize" }}>{currentUser.name}</span>
              {isDev && <span style={{ fontSize: 7, padding: "1px 3px", borderRadius: 2, background: X.pD, color: X.p, fontWeight: 700 }}>DEV</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const winBtnStyle = {
  background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "2px 8px",
  color: "#94a3b8", borderRadius: 4, lineHeight: 1,
};

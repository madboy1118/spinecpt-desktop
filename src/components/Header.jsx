import { X, ft } from '../theme.js';
import { totalCodeCount } from '../data/cptLibrary.js';

export default function Header({ tab, setTab, surgeon, allSurgeons, switchSurgeon, onNewProfile, getTraining, cases, styleMem, currentUser, onLogout, jobs, isOffline, offlineReason }) {
  const isDev = currentUser?.role === "developer";
  const tabs = ["dictate", "analyze", "cases", "library", "training", "profile", "reports", "rules"];
  if (isDev) tabs.push("dev");
  const runningJobs = (jobs || []).filter(j => j.status === "running").length;

  return (
    <div style={{ borderBottom: `1px solid ${X.b1}`, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: X.s1, position: "sticky", top: 0, zIndex: 50, flexWrap: "wrap", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 6, background: `linear-gradient(135deg,${X.ac},${X.p})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: X.bg }}>S</div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>SpineCPT Pro</span>
            {isOffline && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: X.yD, color: X.y, fontWeight: 700 }} title={offlineReason || "Offline"}>OFFLINE</span>}
          </div>
          <div style={{ fontSize: 10, color: X.t4 }}>
            {totalCodeCount} codes {"\u00b7"} {getTraining()?.trainingCases || 0} training cases
            {cases > 0 && ` \u00b7 ${cases} new`}
            {styleMem.length > 0 && ` \u00b7 +${styleMem.length} learned`}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Surgeon Selector */}
        <div style={{ display: "flex", gap: 2, background: X.bg, borderRadius: 6, padding: 2, flexWrap: "wrap" }}>
          {allSurgeons().map(s => (
            <button key={s.id} onClick={() => switchSurgeon(s.id)} style={{
              padding: "5px 10px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: ft,
              background: surgeon === s.id ? `linear-gradient(135deg,${X.acD},${X.pD})` : X.s2,
              color: surgeon === s.id ? X.ac : X.t3, transition: "all .15s",
            }}>{s.name.replace("Dr. ", "")}{!s.builtin && " *"}</button>
          ))}
          <button onClick={onNewProfile} style={{
            padding: "5px 10px", borderRadius: 4, border: `1px dashed ${X.b2}`, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: ft,
            background: "transparent", color: X.t3,
          }}>+</button>
        </div>
        {/* Tab nav */}
        <div style={{ display: "flex", gap: 2, background: X.bg, borderRadius: 6, padding: 2, flexWrap: "wrap" }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "5px 12px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: ft,
              background: tab === t ? X.s3 : "transparent",
              color: tab === t ? (t === "dev" ? X.p : X.ac) : X.t3,
              textTransform: "capitalize", position: "relative",
            }}>
              {t}
              {t === "analyze" && runningJobs > 0 && (
                <span style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: X.ac, color: X.bg, fontSize: 8, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 6px ${X.ac}40` }}>{runningJobs}</span>
              )}
            </button>
          ))}
        </div>
        {/* User badge + logout */}
        {currentUser && (
          <button onClick={onLogout} title="Switch user" style={{
            padding: "5px 10px", borderRadius: 6, border: `1px solid ${X.b1}`, background: X.s2,
            color: X.t2, fontSize: 10, fontWeight: 600, fontFamily: ft, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ textTransform: "capitalize" }}>{currentUser.name}</span>
            {isDev && <span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 3, background: X.pD, color: X.p, fontWeight: 700 }}>DEV</span>}
          </button>
        )}
      </div>
    </div>
  );
}

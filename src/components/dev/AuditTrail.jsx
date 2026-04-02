import { useState, useEffect } from 'react';
import { X, ft, mn } from '../../theme.js';
import { loadAuditLog, clearAuditLog, exportAuditLog } from '../../modules/auditLog.js';

const ACTION_COLORS = {
  analysis_started: X.ac,
  analysis_completed: X.g,
  analysis_failed: X.r,
  edit_accepted: X.g,
  edit_rejected: X.r,
  edit_accept_all: X.g,
  case_saved: X.p,
  billing_compared: X.y,
};

export default function AuditTrail() {
  const [log, setLog] = useState([]);
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState(null);

  useEffect(() => { loadAuditLog().then(setLog); }, []);

  const filtered = filter === "all" ? log : log.filter(e => e.action === filter);
  const actions = [...new Set(log.map(e => e.action))];

  const copy = (format) => {
    const text = exportAuditLog(filtered, format);
    try { navigator.clipboard?.writeText(text); } catch {}
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ marginTop: 24, borderTop: `1px solid ${X.b2}`, paddingTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: X.t1 }}>Audit Trail</div>
          <div style={{ fontSize: 11, color: X.t3, marginTop: 2 }}>{log.length} events logged</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding: "4px 8px", borderRadius: 4, background: X.s2, border: `1px solid ${X.b1}`, color: X.t1, fontSize: 10, fontFamily: ft, outline: "none" }}>
            <option value="all">All Actions</option>
            {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
          </select>
          <button onClick={() => copy("csv")} style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${X.b1}`, background: "transparent", color: X.t3, fontSize: 10, cursor: "pointer", fontFamily: ft }}>
            {copied === "csv" ? "\u2713 Copied" : "CSV"}
          </button>
          <button onClick={() => copy("json")} style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${X.b1}`, background: "transparent", color: X.t3, fontSize: 10, cursor: "pointer", fontFamily: ft }}>
            {copied === "json" ? "\u2713 Copied" : "JSON"}
          </button>
          <button onClick={() => loadAuditLog().then(setLog)} style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${X.b1}`, background: "transparent", color: X.t3, fontSize: 10, cursor: "pointer", fontFamily: ft }}>Refresh</button>
          {log.length > 0 && (
            <button onClick={async () => { if (confirm("Clear entire audit log?")) { await clearAuditLog(); setLog([]); } }}
              style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${X.rD}`, background: "transparent", color: X.r, fontSize: 10, cursor: "pointer", fontFamily: ft }}>Clear</button>
          )}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div style={{ borderRadius: 8, border: `1px solid ${X.b1}`, overflow: "hidden", maxHeight: "45vh", overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "90px 130px 80px 80px 1fr", padding: "6px 12px", background: X.s3, fontSize: 9, fontWeight: 700, color: X.t4, textTransform: "uppercase", position: "sticky", top: 0 }}>
            <span>Time</span><span>Action</span><span>User</span><span>Surgeon</span><span>Details</span>
          </div>
          {filtered.slice().reverse().slice(0, 200).map((e, i) => (
            <div key={e.id || i} style={{ display: "grid", gridTemplateColumns: "90px 130px 80px 80px 1fr", padding: "6px 12px", borderTop: `1px solid ${X.b1}`, fontSize: 11, alignItems: "center" }}>
              <span style={{ color: X.t4, fontFamily: mn, fontSize: 9 }}>{new Date(e.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              <span style={{ color: ACTION_COLORS[e.action] || X.t2, fontWeight: 600, fontSize: 10 }}>{e.action.replace(/_/g, " ")}</span>
              <span style={{ color: X.t3, fontSize: 10, textTransform: "capitalize" }}>{e.userId}</span>
              <span style={{ color: X.t3, fontSize: 10 }}>{e.surgeonName?.replace("Dr. ", "") || e.surgeonId}</span>
              <span style={{ color: X.t4, fontSize: 9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {e.details ? Object.entries(e.details).map(([k, v]) => `${k}:${typeof v === 'object' ? JSON.stringify(v) : v}`).join(" ") : ""}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: 20, textAlign: "center", color: X.t3, fontSize: 12 }}>No audit events recorded yet.</div>
      )}
    </div>
  );
}

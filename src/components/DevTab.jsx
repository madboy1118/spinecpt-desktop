import { useState, useEffect } from 'react';
import { X, ft, mn } from '../theme.js';
import { ld, sv } from '../modules/storage.js';
import { computeBillingAccuracy, aggregateBillingStats } from '../modules/billing.js';
import BillingInput from './analysis/BillingInput.jsx';
import AuditTrail from './dev/AuditTrail.jsx';

const USAGE_KEY = "spinecpt-api-usage";

// Claude pricing per million tokens
const PRICING = {
  "claude-opus-4-20250514": { input: 15.00, output: 75.00 },
  "claude-opus-4-6-20250514": { input: 15.00, output: 75.00 },
};
const DEFAULT_PRICING = { input: 15.00, output: 75.00 };

function getPricing(model) {
  for (const [key, val] of Object.entries(PRICING)) {
    if (model?.includes(key)) return val;
  }
  return DEFAULT_PRICING;
}

function cost(entry) {
  const p = getPricing(entry.model);
  return (entry.input_tokens * p.input + entry.output_tokens * p.output) / 1_000_000;
}

export async function logApiUsage(usage, userId, surgeonId) {
  if (!usage || !usage.input_tokens) return;
  const log = await ld(USAGE_KEY, []);
  log.push({
    ...usage,
    userId,
    surgeonId,
    timestamp: usage.timestamp || Date.now(),
  });
  // Keep last 1000 entries
  await sv(USAGE_KEY, log.slice(-1000));
}

const BILLING_KEY = "spinecpt-billing-log";

export default function DevTab({ jobs, surgeon, allSurgeons, addBillingCorrection }) {
  const [log, setLog] = useState([]);
  const [range, setRange] = useState("all");
  const [billingLog, setBillingLog] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showBilling, setShowBilling] = useState(false);

  useEffect(() => {
    ld(USAGE_KEY, []).then(setLog);
    ld(BILLING_KEY, []).then(setBillingLog);
  }, []);

  const now = Date.now();
  const filtered = log.filter(e => {
    if (range === "today") return now - e.timestamp < 86400000;
    if (range === "week") return now - e.timestamp < 604800000;
    if (range === "month") return now - e.timestamp < 2592000000;
    return true;
  });

  const totalIn = filtered.reduce((s, e) => s + (e.input_tokens || 0), 0);
  const totalOut = filtered.reduce((s, e) => s + (e.output_tokens || 0), 0);
  const totalCost = filtered.reduce((s, e) => s + cost(e), 0);
  const totalCalls = filtered.length;

  // Per-user breakdown
  const byUser = {};
  filtered.forEach(e => {
    const uid = e.userId || "unknown";
    if (!byUser[uid]) byUser[uid] = { calls: 0, input: 0, output: 0, cost: 0 };
    byUser[uid].calls++;
    byUser[uid].input += e.input_tokens || 0;
    byUser[uid].output += e.output_tokens || 0;
    byUser[uid].cost += cost(e);
  });

  // Per-day breakdown (last 14 days)
  const byDay = {};
  filtered.forEach(e => {
    const day = new Date(e.timestamp).toISOString().split("T")[0];
    if (!byDay[day]) byDay[day] = { calls: 0, input: 0, output: 0, cost: 0 };
    byDay[day].calls++;
    byDay[day].input += e.input_tokens || 0;
    byDay[day].output += e.output_tokens || 0;
    byDay[day].cost += cost(e);
  });
  const days = Object.entries(byDay).sort((a, b) => b[0].localeCompare(a[0]));

  const clearLog = async () => {
    if (confirm("Clear all API usage logs?")) {
      await sv(USAGE_KEY, []);
      setLog([]);
    }
  };

  return (<div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: X.t1 }}>Developer Console</div>
        <div style={{ fontSize: 11, color: X.t3, marginTop: 2 }}>API usage tracking and cost monitoring</div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 2, background: X.bg, borderRadius: 5, padding: 2 }}>
          {["today", "week", "month", "all"].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: "4px 10px", borderRadius: 3, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: ft,
              background: range === r ? X.s3 : "transparent",
              color: range === r ? X.ac : X.t4, textTransform: "capitalize",
            }}>{r}</button>
          ))}
        </div>
        <button onClick={() => ld(USAGE_KEY, []).then(setLog)} style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${X.b1}`, background: "transparent", color: X.t3, fontSize: 10, cursor: "pointer", fontFamily: ft }}>Refresh</button>
        {log.length > 0 && (
          <button onClick={clearLog} style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${X.rD}`, background: "transparent", color: X.r, fontSize: 10, cursor: "pointer", fontFamily: ft }}>Clear</button>
        )}
      </div>
    </div>

    {/* Summary cards */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 16 }}>
      <div style={{ padding: "12px 14px", borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
        <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>Total Cost</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: X.r, fontFamily: mn }}>${totalCost.toFixed(4)}</div>
      </div>
      <div style={{ padding: "12px 14px", borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
        <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>API Calls</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: X.ac }}>{totalCalls}</div>
      </div>
      <div style={{ padding: "12px 14px", borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
        <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>Input Tokens</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: X.p, fontFamily: mn }}>{(totalIn / 1000).toFixed(1)}k</div>
      </div>
      <div style={{ padding: "12px 14px", borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
        <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>Output Tokens</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: X.o, fontFamily: mn }}>{(totalOut / 1000).toFixed(1)}k</div>
      </div>
      <div style={{ padding: "12px 14px", borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
        <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>Avg Cost/Call</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: X.y, fontFamily: mn }}>${totalCalls > 0 ? (totalCost / totalCalls).toFixed(4) : "0"}</div>
      </div>
    </div>

    {/* Per-user breakdown */}
    {Object.keys(byUser).length > 0 && (<div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: X.t2, marginBottom: 8 }}>Usage by User</div>
      <div style={{ borderRadius: 8, border: `1px solid ${X.b1}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 80px 80px 80px", padding: "6px 12px", background: X.s3, fontSize: 9, fontWeight: 700, color: X.t4, textTransform: "uppercase" }}>
          <span>User</span><span style={{ textAlign: "right" }}>Calls</span><span style={{ textAlign: "right" }}>Input</span><span style={{ textAlign: "right" }}>Output</span><span style={{ textAlign: "right" }}>Cost</span>
        </div>
        {Object.entries(byUser).sort((a, b) => b[1].cost - a[1].cost).map(([uid, d]) => (
          <div key={uid} style={{ display: "grid", gridTemplateColumns: "1fr 60px 80px 80px 80px", padding: "8px 12px", borderTop: `1px solid ${X.b1}`, fontSize: 12, alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: X.t1, textTransform: "capitalize" }}>{uid}</span>
            <span style={{ textAlign: "right", color: X.t2, fontFamily: mn }}>{d.calls}</span>
            <span style={{ textAlign: "right", color: X.p, fontFamily: mn, fontSize: 11 }}>{(d.input / 1000).toFixed(1)}k</span>
            <span style={{ textAlign: "right", color: X.o, fontFamily: mn, fontSize: 11 }}>{(d.output / 1000).toFixed(1)}k</span>
            <span style={{ textAlign: "right", color: X.r, fontFamily: mn, fontWeight: 700 }}>${d.cost.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>)}

    {/* Daily breakdown */}
    {days.length > 0 && (<div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: X.t2, marginBottom: 8 }}>Daily Breakdown</div>
      <div style={{ borderRadius: 8, border: `1px solid ${X.b1}`, overflow: "hidden", maxHeight: "40vh", overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "100px 60px 80px 80px 80px", padding: "6px 12px", background: X.s3, fontSize: 9, fontWeight: 700, color: X.t4, textTransform: "uppercase", position: "sticky", top: 0 }}>
          <span>Date</span><span style={{ textAlign: "right" }}>Calls</span><span style={{ textAlign: "right" }}>Input</span><span style={{ textAlign: "right" }}>Output</span><span style={{ textAlign: "right" }}>Cost</span>
        </div>
        {days.map(([day, d]) => (
          <div key={day} style={{ display: "grid", gridTemplateColumns: "100px 60px 80px 80px 80px", padding: "8px 12px", borderTop: `1px solid ${X.b1}`, fontSize: 12, alignItems: "center" }}>
            <span style={{ color: X.t2, fontFamily: mn, fontSize: 11 }}>{day}</span>
            <span style={{ textAlign: "right", color: X.t2, fontFamily: mn }}>{d.calls}</span>
            <span style={{ textAlign: "right", color: X.p, fontFamily: mn, fontSize: 11 }}>{(d.input / 1000).toFixed(1)}k</span>
            <span style={{ textAlign: "right", color: X.o, fontFamily: mn, fontSize: 11 }}>{(d.output / 1000).toFixed(1)}k</span>
            <span style={{ textAlign: "right", color: X.r, fontFamily: mn, fontWeight: 700 }}>${d.cost.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>)}

    {/* Recent calls */}
    {filtered.length > 0 && (<div>
      <div style={{ fontSize: 12, fontWeight: 700, color: X.t2, marginBottom: 8 }}>Recent Calls ({Math.min(filtered.length, 20)} of {filtered.length})</div>
      <div style={{ borderRadius: 8, border: `1px solid ${X.b1}`, overflow: "hidden", maxHeight: "35vh", overflowY: "auto" }}>
        {filtered.slice().reverse().slice(0, 20).map((e, i) => (
          <div key={i} style={{ padding: "8px 12px", borderTop: i > 0 ? `1px solid ${X.b1}` : "none", display: "flex", alignItems: "center", gap: 10, fontSize: 11 }}>
            <span style={{ color: X.t4, fontFamily: mn, fontSize: 10, minWidth: 50 }}>{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            <span style={{ color: X.t3, textTransform: "capitalize", minWidth: 60 }}>{e.userId || "?"}</span>
            <span style={{ color: X.t4, minWidth: 60 }}>{e.surgeonId || "?"}</span>
            <span style={{ color: X.p, fontFamily: mn, fontSize: 10 }}>{e.input_tokens?.toLocaleString()} in</span>
            <span style={{ color: X.o, fontFamily: mn, fontSize: 10 }}>{e.output_tokens?.toLocaleString()} out</span>
            <span style={{ color: X.r, fontFamily: mn, fontWeight: 700, fontSize: 10, marginLeft: "auto" }}>${cost(e).toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>)}

    {filtered.length === 0 && (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: X.t2, marginBottom: 6 }}>No API calls recorded</div>
        <div style={{ fontSize: 12, color: X.t3 }}>Usage will appear here after notes are analyzed.</div>
      </div>
    )}

    {/* Pricing reference */}
    <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
      <div style={{ fontSize: 10, color: X.t4, lineHeight: 1.6 }}>
        Pricing: Claude Opus 4 — $15.00/MTok input, $75.00/MTok output
      </div>
    </div>

    {/* ═══ BILLING ACCURACY TRACKER ═══ */}
    <div style={{ marginTop: 24, borderTop: `1px solid ${X.b2}`, paddingTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: X.t1 }}>Billing Accuracy Tracker</div>
          <div style={{ fontSize: 11, color: X.t3, marginTop: 2 }}>Compare AI predictions against actual billed codes</div>
        </div>
        <button onClick={() => setShowBilling(!showBilling)} style={{
          padding: "6px 14px", borderRadius: 5, border: `1px solid ${X.b1}`,
          background: showBilling ? X.acD : "transparent", color: showBilling ? X.ac : X.t3,
          fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: ft,
        }}>{showBilling ? "Hide" : "New Comparison"}</button>
      </div>

      {/* New comparison input */}
      {showBilling && (() => {
        const doneJobs = (jobs || []).filter(j => j.status === "done" && j.analysis);
        const selectedJob = doneJobs.find(j => j.id === selectedJobId);
        return (
          <div style={{ padding: 14, borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}`, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: X.t2, marginBottom: 6 }}>Select a completed analysis:</div>
            <select value={selectedJobId || ""} onChange={e => setSelectedJobId(Number(e.target.value) || null)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: X.s3, border: `1px solid ${X.b1}`, color: X.t1, fontSize: 12, fontFamily: ft, outline: "none", marginBottom: 8 }}>
              <option value="">Choose a job...</option>
              {doneJobs.map(j => (
                <option key={j.id} value={j.id}>{j.surgeonName} — {j.noteSnippet} ({new Date(j.startTime).toLocaleDateString()})</option>
              ))}
            </select>
            {selectedJob && (
              <BillingInput
                predictedCodes={selectedJob.analysis.identified_codes || []}
                onResult={async (accuracy) => {
                  const entry = {
                    ...accuracy,
                    jobId: selectedJob.id,
                    surgeonId: selectedJob.surgeonId,
                    surgeonName: selectedJob.surgeonName,
                    timestamp: Date.now(),
                  };
                  const updated = [...billingLog, entry].slice(-200);
                  setBillingLog(updated);
                  await sv(BILLING_KEY, updated);
                  // Feed corrections back into surgeon profile
                  if (addBillingCorrection) {
                    addBillingCorrection({
                      jobId: selectedJob.id,
                      timestamp: Date.now(),
                      missedCodes: accuracy.falseNegatives,
                      overPredicted: accuracy.falsePositives,
                      surgeonId: selectedJob.surgeonId,
                    });
                  }
                }}
              />
            )}
          </div>
        );
      })()}

      {/* Aggregate billing stats */}
      {billingLog.length > 0 && (() => {
        const stats = aggregateBillingStats(billingLog);
        if (!stats) return null;

        // Per-surgeon breakdown
        const bySurgeon = {};
        billingLog.forEach(e => {
          const sid = e.surgeonId || "unknown";
          if (!bySurgeon[sid]) bySurgeon[sid] = [];
          bySurgeon[sid].push(e);
        });

        return (<>
          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginBottom: 14 }}>
            <div style={{ padding: "12px 14px", borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
              <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>Cases Compared</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: X.ac }}>{stats.caseCount}</div>
            </div>
            <div style={{ padding: "12px 14px", borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
              <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>Avg Precision</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: stats.avgPrecision >= 80 ? X.g : stats.avgPrecision >= 60 ? X.y : X.r }}>{stats.avgPrecision}%</div>
            </div>
            <div style={{ padding: "12px 14px", borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
              <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>Avg Recall</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: stats.avgRecall >= 80 ? X.g : stats.avgRecall >= 60 ? X.y : X.r }}>{stats.avgRecall}%</div>
            </div>
          </div>

          {/* Per-surgeon breakdown */}
          {Object.keys(bySurgeon).length > 1 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: X.t2, marginBottom: 8 }}>Accuracy by Surgeon</div>
              <div style={{ borderRadius: 8, border: `1px solid ${X.b1}`, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 70px 70px", padding: "6px 12px", background: X.s3, fontSize: 9, fontWeight: 700, color: X.t4, textTransform: "uppercase" }}>
                  <span>Surgeon</span><span style={{ textAlign: "right" }}>Cases</span><span style={{ textAlign: "right" }}>Precision</span><span style={{ textAlign: "right" }}>Recall</span>
                </div>
                {Object.entries(bySurgeon).map(([sid, entries]) => {
                  const s = aggregateBillingStats(entries);
                  return (
                    <div key={sid} style={{ display: "grid", gridTemplateColumns: "1fr 60px 70px 70px", padding: "8px 12px", borderTop: `1px solid ${X.b1}`, fontSize: 12, alignItems: "center" }}>
                      <span style={{ fontWeight: 600, color: X.t1, textTransform: "capitalize" }}>{entries[0]?.surgeonName || sid}</span>
                      <span style={{ textAlign: "right", color: X.t2, fontFamily: mn }}>{s.caseCount}</span>
                      <span style={{ textAlign: "right", color: s.avgPrecision >= 80 ? X.g : X.y, fontFamily: mn, fontWeight: 700 }}>{s.avgPrecision}%</span>
                      <span style={{ textAlign: "right", color: s.avgRecall >= 80 ? X.g : X.y, fontFamily: mn, fontWeight: 700 }}>{s.avgRecall}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top missed / over-predicted codes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            {stats.topMissed.length > 0 && (
              <div style={{ borderRadius: 8, border: `1px solid ${X.b1}`, overflow: "hidden" }}>
                <div style={{ padding: "6px 12px", background: X.rD, fontSize: 10, fontWeight: 700, color: X.r }}>Top Missed Codes</div>
                {stats.topMissed.map(([code, count], i) => (
                  <div key={i} style={{ padding: "4px 12px", borderTop: `1px solid ${X.b1}`, display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <code style={{ fontFamily: mn, color: X.ac }}>{code}</code>
                    <span style={{ color: X.r, fontFamily: mn }}>{count}x</span>
                  </div>
                ))}
              </div>
            )}
            {stats.topOverPredicted.length > 0 && (
              <div style={{ borderRadius: 8, border: `1px solid ${X.b1}`, overflow: "hidden" }}>
                <div style={{ padding: "6px 12px", background: X.yD, fontSize: 10, fontWeight: 700, color: X.y }}>Top Over-Predicted</div>
                {stats.topOverPredicted.map(([code, count], i) => (
                  <div key={i} style={{ padding: "4px 12px", borderTop: `1px solid ${X.b1}`, display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <code style={{ fontFamily: mn, color: X.ac }}>{code}</code>
                    <span style={{ color: X.y, fontFamily: mn }}>{count}x</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clear billing log */}
          <button onClick={async () => { if (confirm("Clear all billing comparisons?")) { await sv(BILLING_KEY, []); setBillingLog([]); } }}
            style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${X.rD}`, background: "transparent", color: X.r, fontSize: 10, cursor: "pointer", fontFamily: ft }}>
            Clear Billing Log
          </button>
        </>);
      })()}

      {billingLog.length === 0 && !showBilling && (
        <div style={{ padding: 20, textAlign: "center", color: X.t3, fontSize: 12 }}>
          No billing comparisons yet. Click "New Comparison" to compare AI predictions against actual billed codes.
        </div>
      )}
    </div>

    {/* Audit Trail */}
    <AuditTrail />
  </div>);
}

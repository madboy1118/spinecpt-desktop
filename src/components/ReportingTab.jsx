import { useState, useEffect } from 'react';
import { X, ft, mn } from '../theme.js';
import { ld } from '../modules/storage.js';
import { computeReportingStats, statsToCSV } from '../modules/reporting.js';

export default function ReportingTab({ allSurgeons, savedCases, jobs, surgeon }) {
  const [allCases, setAllCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  // Load cases from ALL surgeons
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      const surgeons = allSurgeons();
      const cases = [];
      for (const s of surgeons) {
        const tc = await ld(`${s.id}-tcases`, []);
        cases.push(...tc);
      }
      setAllCases(cases);
      setLoading(false);
    };
    loadAll();
  }, [allSurgeons, surgeon]);

  const stats = computeReportingStats(allCases);

  const copy = (format) => {
    const text = format === "csv" ? statsToCSV(stats) : JSON.stringify(stats, null, 2);
    try { navigator.clipboard?.writeText(text); } catch {}
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: X.t3 }}>Loading reporting data...</div>;

  if (stats.totalNotes === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: X.t2, marginBottom: 6 }}>No data yet</div>
        <div style={{ fontSize: 12, color: X.t3, maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
          Analyze op notes and save them to training to populate the reporting dashboard.
        </div>
      </div>
    );
  }

  const gradeColor = (g) => g === "A" ? X.g : g === "B" ? X.ac : g === "C" ? X.y : X.r;
  const weeks = Object.entries(stats.byWeek).sort((a, b) => a[0].localeCompare(b[0]));
  const maxWeekNotes = Math.max(...weeks.map(([, w]) => w.notes), 1);

  return (<div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: X.t1 }}>Reporting Dashboard</div>
        <div style={{ fontSize: 11, color: X.t3, marginTop: 2 }}>Aggregate statistics across all surgeons and cases</div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => copy("csv")} style={{ padding: "5px 12px", borderRadius: 4, border: `1px solid ${X.b1}`, background: "transparent", color: X.t3, fontSize: 10, cursor: "pointer", fontFamily: ft }}>
          {copied === "csv" ? "\u2713 Copied" : "Export CSV"}
        </button>
        <button onClick={() => copy("json")} style={{ padding: "5px 12px", borderRadius: 4, border: `1px solid ${X.b1}`, background: "transparent", color: X.t3, fontSize: 10, cursor: "pointer", fontFamily: ft }}>
          {copied === "json" ? "\u2713 Copied" : "Export JSON"}
        </button>
      </div>
    </div>

    {/* Summary cards */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 16 }}>
      <div style={{ padding: "12px 14px", borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
        <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>Total Notes</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: X.ac }}>{stats.totalNotes}</div>
      </div>
      <div style={{ padding: "12px 14px", borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
        <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>Avg Grade</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: gradeColor(stats.avgGrade) }}>{stats.avgGrade}</div>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {Object.entries(stats.gradeDistribution).filter(([, v]) => v > 0).map(([g, v]) => (
            <span key={g} style={{ fontSize: 10, fontWeight: 700, color: gradeColor(g) }}>{v}{g}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 14px", borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
        <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>Original wRVU</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: X.t2, fontFamily: mn }}>{stats.totalOrigRVU.toFixed(1)}</div>
      </div>
      <div style={{ padding: "12px 14px", borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
        <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>Enhanced wRVU</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: X.g, fontFamily: mn }}>{stats.totalEnhRVU.toFixed(1)}</div>
      </div>
      <div style={{ padding: "12px 14px", borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
        <div style={{ fontSize: 9, color: X.t4, fontWeight: 700, textTransform: "uppercase" }}>wRVU Improvement</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: X.ac, fontFamily: mn }}>+{stats.rvuDelta.toFixed(1)}</div>
        <div style={{ fontSize: 10, color: X.t4 }}>
          {stats.totalOrigRVU > 0 ? `+${((stats.rvuDelta / stats.totalOrigRVU) * 100).toFixed(0)}%` : ""}
        </div>
      </div>
    </div>

    {/* Per-surgeon breakdown */}
    {Object.keys(stats.bySurgeon).length > 0 && (<div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: X.t2, marginBottom: 8 }}>By Surgeon</div>
      <div style={{ borderRadius: 8, border: `1px solid ${X.b1}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 50px 50px 70px 70px 70px", padding: "6px 12px", background: X.s3, fontSize: 9, fontWeight: 700, color: X.t4, textTransform: "uppercase" }}>
          <span>Surgeon</span><span style={{ textAlign: "right" }}>Notes</span><span style={{ textAlign: "right" }}>Grade</span><span style={{ textAlign: "right" }}>Orig RVU</span><span style={{ textAlign: "right" }}>Enh RVU</span><span style={{ textAlign: "right" }}>Delta</span>
        </div>
        {Object.entries(stats.bySurgeon).sort((a, b) => b[1].notes - a[1].notes).map(([sid, bs]) => (
          <div key={sid} style={{ display: "grid", gridTemplateColumns: "1fr 50px 50px 70px 70px 70px", padding: "8px 12px", borderTop: `1px solid ${X.b1}`, fontSize: 12, alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: X.t1 }}>{bs.name}</span>
            <span style={{ textAlign: "right", color: X.t2, fontFamily: mn }}>{bs.notes}</span>
            <span style={{ textAlign: "right", fontWeight: 700, color: gradeColor(bs.avgGrade) }}>{bs.avgGrade}</span>
            <span style={{ textAlign: "right", color: X.t3, fontFamily: mn, fontSize: 11 }}>{bs.avgOrigRVU}</span>
            <span style={{ textAlign: "right", color: X.g, fontFamily: mn, fontSize: 11 }}>{bs.avgEnhRVU}</span>
            <span style={{ textAlign: "right", color: X.ac, fontFamily: mn, fontWeight: 700, fontSize: 11 }}>+{(bs.enhRVU - bs.origRVU).toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>)}

    {/* Weekly trend */}
    {weeks.length > 0 && (<div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: X.t2, marginBottom: 8 }}>Weekly Trend</div>
      <div style={{ borderRadius: 8, border: `1px solid ${X.b1}`, overflow: "hidden", maxHeight: "35vh", overflowY: "auto" }}>
        {weeks.map(([wk, w]) => (
          <div key={wk} style={{ padding: "6px 12px", borderBottom: `1px solid ${X.b1}`, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 10, color: X.t4, fontFamily: mn, width: 70, flexShrink: 0 }}>{wk}</span>
            <span style={{ fontSize: 10, color: X.t2, width: 30, textAlign: "right" }}>{w.notes}</span>
            <div style={{ flex: 1, height: 6, background: X.s3, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${(w.notes / maxWeekNotes) * 100}%`, height: "100%", background: `linear-gradient(90deg,${X.ac},${X.p})`, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: gradeColor(w.avgGrade), width: 16, textAlign: "center" }}>{w.avgGrade}</span>
            <span style={{ fontSize: 10, color: X.g, fontFamily: mn, width: 55, textAlign: "right" }}>+{(w.enhRVU - w.origRVU).toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>)}

    {/* Top documentation gaps */}
    {stats.topGaps.length > 0 && (<div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: X.t2, marginBottom: 8 }}>Most Common Documentation Gaps</div>
      <div style={{ borderRadius: 8, border: `1px solid ${X.b1}`, overflow: "hidden" }}>
        {stats.topGaps.map((g, i) => (
          <div key={i} style={{ padding: "6px 12px", borderTop: i > 0 ? `1px solid ${X.b1}` : "none", display: "flex", alignItems: "center", gap: 8 }}>
            <code style={{ fontFamily: mn, fontWeight: 700, fontSize: 11, color: X.ac, width: 50 }}>{g.code}</code>
            <span style={{ flex: 1, fontSize: 11, color: X.t2 }}>{g.desc}</span>
            <span style={{ fontSize: 10, color: X.r, fontFamily: mn, fontWeight: 700 }}>{g.count}x</span>
          </div>
        ))}
      </div>
    </div>)}
  </div>);
}

import { X, ft, mn } from '../../theme.js';

export default function TemplateGuide({ sections, currentSectionIndex, progress, allRequiredComplete, onAdvance, onGoBack, onGoToSection, onInsertHeaders, autoHeaders, onToggleAutoHeaders }) {
  if (!sections || sections.length === 0) return null;

  const statusColor = (s) => s === "complete" ? X.g : s === "partial" ? X.y : s === "active" ? X.ac : X.t4;
  const statusBg = (s) => s === "complete" ? X.gD : s === "partial" ? X.yD : s === "active" ? X.acD : X.s3;
  const statusIcon = (s) => s === "complete" ? "\u2713" : s === "partial" ? "\u25cb" : s === "active" ? "\u25cf" : "\u25cb";

  const current = sections[currentSectionIndex];

  return (
    <div style={{ borderRadius: 10, background: X.s1, border: `1px solid ${X.b1}`, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "8px 12px", background: X.s2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: X.ac }}>Template Guide</span>
          <span style={{ fontSize: 10, color: X.t3, fontFamily: mn }}>{progress}%</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 9, color: X.t4 }}>
            <input type="checkbox" checked={autoHeaders} onChange={onToggleAutoHeaders}
              style={{ width: 12, height: 12, accentColor: X.ac }} />
            Auto-headers
          </label>
          <button onClick={onInsertHeaders} style={{
            padding: "3px 8px", borderRadius: 4, border: `1px solid ${X.b2}`,
            background: "transparent", color: X.t3, fontSize: 9, cursor: "pointer", fontFamily: ft,
          }}>Insert All</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: X.s3 }}>
        <div style={{ height: "100%", width: `${progress}%`, background: allRequiredComplete ? X.g : X.ac, transition: "width .5s ease", borderRadius: 2 }} />
      </div>

      {/* Current section prompt (prominent) */}
      {current && (
        <div style={{ padding: "10px 12px", background: `${X.ac}08`, borderBottom: `1px solid ${X.b1}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: X.ac, textTransform: "uppercase", letterSpacing: 1 }}>
              Now: Section {currentSectionIndex + 1}/{sections.length}
            </span>
            {current.required && <span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 3, background: X.rD, color: X.r, fontWeight: 700 }}>REQ</span>}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: X.t1, marginBottom: 4 }}>{current.title}</div>
          <div style={{ fontSize: 11, color: X.t2, lineHeight: 1.6 }}>{current.prompt}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button onClick={onGoBack} disabled={currentSectionIndex <= 0} style={{
              padding: "4px 12px", borderRadius: 4, border: `1px solid ${X.b1}`,
              background: "transparent", color: currentSectionIndex > 0 ? X.t3 : X.t4,
              fontSize: 10, cursor: currentSectionIndex > 0 ? "pointer" : "default", fontFamily: ft,
            }}>{"\u2190"} Back</button>
            <button onClick={onAdvance} disabled={currentSectionIndex >= sections.length - 1} style={{
              padding: "4px 12px", borderRadius: 4, border: "none",
              background: currentSectionIndex < sections.length - 1 ? X.acD : X.s3,
              color: currentSectionIndex < sections.length - 1 ? X.ac : X.t4,
              fontSize: 10, fontWeight: 600, cursor: currentSectionIndex < sections.length - 1 ? "pointer" : "default", fontFamily: ft,
            }}>Next {"\u2192"}</button>
          </div>
        </div>
      )}

      {/* Section list */}
      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {sections.map((s, i) => {
          const isCurrent = i === currentSectionIndex;
          const status = isCurrent && s.status === "pending" ? "active" : s.status;
          return (
            <div key={i} onClick={() => onGoToSection(i)} style={{
              padding: "6px 12px", display: "flex", alignItems: "center", gap: 8,
              borderBottom: `1px solid ${X.b1}`, cursor: "pointer",
              background: isCurrent ? `${X.ac}10` : "transparent",
            }}
              onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = X.s2; }}
              onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = isCurrent ? `${X.ac}10` : "transparent"; }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, flexShrink: 0,
                background: statusBg(status), color: statusColor(status),
                border: isCurrent ? `1.5px solid ${X.ac}` : "none",
              }}>{statusIcon(status)}</span>
              <span style={{
                fontSize: 11, fontWeight: isCurrent ? 700 : 500,
                color: status === "complete" ? X.g : isCurrent ? X.ac : X.t2,
                flex: 1,
              }}>{s.title}</span>
              <span style={{
                fontSize: 8, padding: "1px 5px", borderRadius: 3,
                background: s.required ? (status === "complete" ? X.gD : X.rD) : X.s3,
                color: s.required ? (status === "complete" ? X.g : X.r) : X.t4,
                fontWeight: 600, flexShrink: 0,
              }}>{s.required ? "REQ" : "OPT"}</span>
            </div>
          );
        })}
      </div>

      {/* Completion state */}
      {allRequiredComplete && (
        <div style={{ padding: "8px 12px", background: X.gD, borderTop: `1px solid ${X.g}30`, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, color: X.g }}>{"\u2713"}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: X.g }}>All required sections covered</span>
        </div>
      )}
    </div>
  );
}

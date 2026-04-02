import { X, mn } from '../../theme.js';

export default function NCCIWarnings({ warnings }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div style={{ borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}`, overflow: "hidden" }}>
      <div style={{ padding: "6px 12px", background: X.yD, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: X.y }}>Bundling Warnings ({warnings.length})</span>
      </div>
      <div style={{ maxHeight: 160, overflowY: "auto" }}>
        {warnings.map((w, i) => (
          <div key={i} style={{ padding: "6px 12px", borderTop: i > 0 ? `1px solid ${X.b1}` : "none", display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{
              fontSize: 8, padding: "2px 5px", borderRadius: 3, flexShrink: 0, fontWeight: 700, marginTop: 1,
              background: w.severity === "error" ? X.rD : X.yD,
              color: w.severity === "error" ? X.r : X.y,
              textTransform: "uppercase",
            }}>{w.severity}</span>
            <div>
              <div style={{ display: "flex", gap: 4, marginBottom: 2 }}>
                <code style={{ fontFamily: mn, fontSize: 10, fontWeight: 700, color: X.ac }}>{w.code1}</code>
                <span style={{ fontSize: 10, color: X.t4 }}>+</span>
                <code style={{ fontFamily: mn, fontSize: 10, fontWeight: 700, color: X.ac }}>{w.code2}</code>
              </div>
              <div style={{ fontSize: 10, color: X.t3, lineHeight: 1.4 }}>{w.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

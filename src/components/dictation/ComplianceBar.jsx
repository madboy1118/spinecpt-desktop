import { X, mn } from '../../theme.js';

export default function ComplianceBar({ score, results }) {
  const col = score >= 80 ? X.g : score >= 50 ? X.y : X.r;
  return (
    <div style={{ padding: 12, borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: X.t2 }}>Documentation Compliance</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: col, fontFamily: mn }}>{score}%</span>
      </div>
      <div style={{ height: 6, background: X.s3, borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ width: `${score}%`, height: "100%", background: col, borderRadius: 3, transition: "width .3s" }} />
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {results?.map((r, i) => (
          <span key={i} style={{
            fontSize: 9, padding: "2px 6px", borderRadius: 3,
            background: r.present ? X.gD : X.rD,
            color: r.present ? X.g : X.r,
            fontWeight: 600,
          }}>{r.icon} {r.name}</span>
        ))}
      </div>
    </div>
  );
}

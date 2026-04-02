import { X, mn } from '../../theme.js';

export default function RVUComparison({ oRVU, eRVU, oCodes, eCodes, rate }) {
  const delta = eRVU - oRVU;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 50px 1fr", marginBottom: 14, background: X.s1, borderRadius: 10, border: `1px solid ${X.b1}`, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: X.t3, textTransform: "uppercase", letterSpacing: 1 }}>Current Note</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: X.t2, marginTop: 4 }}>{oRVU.toFixed(1)}<span style={{ fontSize: 11, fontWeight: 400 }}> wRVU</span></div>
        <div style={{ fontSize: 13, color: X.t3, fontWeight: 600 }}>${(oRVU * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        <div style={{ marginTop: 6, display: "flex", gap: 3, flexWrap: "wrap" }}>
          {oCodes.map((co, i) => (
            <span key={i} style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: X.s3, color: X.t3, fontFamily: mn }} title={co.description}>
              {co.code}{co.qty > 1 ? ` \u00d7${co.qty}` : ""}<span style={{ color: X.t4, marginLeft: 3 }}>{co.totalRvu.toFixed(1)}</span>
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderLeft: `1px solid ${X.b1}`, borderRight: `1px solid ${X.b1}` }}>
        <span style={{ fontSize: 22, color: delta > 0 ? X.g : X.t4 }}>{"\u2192"}</span>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: X.g, textTransform: "uppercase", letterSpacing: 1 }}>Optimized Note</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: X.g, marginTop: 4 }}>{eRVU.toFixed(1)}<span style={{ fontSize: 11, fontWeight: 400 }}> wRVU</span></div>
        <div style={{ fontSize: 13, color: X.g, fontWeight: 600 }}>${(eRVU * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        {delta > 0 && <div style={{ fontSize: 12, fontWeight: 700, color: X.g, marginTop: 2 }}>+{delta.toFixed(1)} wRVU · +${(delta * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>}
        <div style={{ marginTop: 6, display: "flex", gap: 3, flexWrap: "wrap" }}>
          {eCodes.map((co, i) => (
            <span key={i} style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: co.new ? X.gD : X.s3, color: co.new ? X.g : X.t3, fontFamily: mn }} title={co.description}>
              {co.code}{co.qty > 1 ? ` \u00d7${co.qty}` : ""}{co.new ? " \u2605" : ""}<span style={{ color: co.new ? X.g + "99" : X.t4, marginLeft: 3 }}>{co.totalRvu.toFixed(1)}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

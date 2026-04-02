import { X, mn } from '../../theme.js';

export default function CodesList({ analysis }) {
  const levelWarningCodes = new Set((analysis.level_warnings || []).map(w => w.code));

  return (
    <div style={{ maxHeight: "62vh", overflowY: "auto" }}>
      <div style={{ fontSize: 12, color: X.t2, marginBottom: 10 }}>{analysis.summary}</div>

      {/* Documented levels summary */}
      {analysis._documented_levels && analysis._documented_levels.levelCount > 0 && (
        <div style={{ padding: "6px 10px", borderRadius: 5, background: X.s2, border: `1px solid ${X.b1}`, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: X.t4, fontWeight: 600 }}>Documented levels:</span>
          <span style={{ fontSize: 11, color: X.ac, fontFamily: mn, fontWeight: 600 }}>{analysis._documented_levels.levels.join(", ")}</span>
          <span style={{ fontSize: 10, color: X.t3 }}>({analysis._documented_levels.levelCount} levels, {analysis._documented_levels.interspaceCount} interspaces)</span>
        </div>
      )}

      {analysis.identified_codes?.map((co, i) => {
        const hasLevelWarning = levelWarningCodes.has(co.code);
        const levelWarn = (analysis.level_warnings || []).find(w => w.code === co.code);
        return (
          <div key={i} style={{ padding: 10, borderRadius: 6, marginBottom: 4, background: X.s1, borderLeft: `3px solid ${co.status === "supported" ? X.g : co.status === "partial" ? X.y : X.r}`, border: `1px solid ${hasLevelWarning ? X.o : X.b1}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <code style={{ fontFamily: mn, fontWeight: 700, fontSize: 13, color: X.ac }}>{co.code}</code>
                {(co.qty || 1) > 1 && <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: X.acD, color: X.ac, fontWeight: 700, fontFamily: mn }}>{"\u00d7"}{co.qty}</span>}
                {co.is_addon && <span style={{ fontSize: 8, padding: "2px 4px", borderRadius: 3, background: X.pD, color: X.p, fontWeight: 700 }}>ADD-ON</span>}
                <span style={{
                  fontSize: 8, padding: "2px 4px", borderRadius: 3, fontWeight: 700,
                  background: co.status === "supported" ? X.gD : co.status === "partial" ? X.yD : X.rD,
                  color: co.status === "supported" ? X.g : co.status === "partial" ? X.y : X.r,
                  textTransform: "uppercase",
                }}>{co.status}</span>
                {hasLevelWarning && <span style={{ fontSize: 8, padding: "2px 5px", borderRadius: 3, background: X.oD, color: X.o, fontWeight: 700 }}>QTY?</span>}
              </div>
              <span style={{ fontSize: 10, color: X.p, fontFamily: mn }}>
                {co.rvu > 0 ? `${((co.qty || 1) * co.rvu).toFixed(1)} RVU${(co.qty || 1) > 1 ? ` (${co.rvu}\u00d7${co.qty})` : ""}` : ""}
              </span>
            </div>
            <div style={{ fontSize: 11, color: X.t2, marginTop: 2 }}>{co.description}</div>
            {/* Modifiers */}
            {co.modifiers?.length > 0 && (
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                {co.modifiers.map((m, mi) => (
                  <span key={mi} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: X.pD, color: X.p, fontWeight: 700, fontFamily: mn }}>-{m}</span>
                ))}
              </div>
            )}
            {/* ICD-10 linkage */}
            {co.linked_icd10?.length > 0 && (
              <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9, color: X.t4 }}>Dx:</span>
                {co.linked_icd10.map((dx, di) => (
                  <span key={di} style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: X.yD, color: X.y, fontFamily: mn }}>{dx}</span>
                ))}
              </div>
            )}
            {levelWarn && (
              <div style={{ marginTop: 5, padding: 6, borderRadius: 4, background: X.oD, fontSize: 10, color: X.o, lineHeight: 1.5 }}>
                {"\u26a0"} {levelWarn.message}
              </div>
            )}
            {co.suggested_improvement && <div style={{ marginTop: 5, padding: 6, borderRadius: 4, background: X.gD, fontSize: 10, color: X.g, lineHeight: 1.5 }}>{co.suggested_improvement}</div>}
          </div>
        );
      })}
      {analysis.bundling_warnings?.map((w, i) => <div key={i} style={{ padding: 6, borderRadius: 4, background: X.yB, fontSize: 11, color: X.y, marginBottom: 3 }}>{"\u26a0"} {w}</div>)}
      {analysis.missing_elements?.map((m, i) => <div key={i} style={{ padding: 6, borderRadius: 4, background: X.rB, fontSize: 11, color: X.r, marginBottom: 3 }}>{m}</div>)}
    </div>
  );
}

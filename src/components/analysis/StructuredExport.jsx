import { useState } from 'react';
import { X, ft, mn } from '../../theme.js';

export default function StructuredExport({ finalNote, analysis, oRVU, eRVU, oCodes, eCodes, prof, rate }) {
  const [copied, setCopied] = useState(null); // "emr" | "note" | null

  const codes = analysis?.identified_codes?.filter(c => c.status === "supported" || c.status === "partial") || [];
  const icd10 = analysis?.icd10_codes || [];
  const grade = analysis?.overall_documentation_grade || "?";
  const date = new Date().toISOString().split("T")[0];
  const delta = eRVU - oRVU;

  const buildEMRBlock = () => {
    const lines = [];
    lines.push("=" .repeat(50));
    lines.push(`OPERATIVE NOTE — ${prof?.name || "Surgeon"}`);
    lines.push(`Date: ${date}`);
    lines.push("=".repeat(50));
    lines.push("");
    lines.push(finalNote);
    lines.push("");
    lines.push("=".repeat(50));
    lines.push("BILLING SUMMARY");
    lines.push("=".repeat(50));
    lines.push("");
    lines.push("CPT CODES:");
    codes.forEach(c => {
      const qty = c.qty || 1;
      const rvu = (c.rvu * qty).toFixed(1);
      lines.push(`  ${c.code} — ${c.description || ""}${qty > 1 ? ` x${qty}` : ""} (${rvu} RVU)`);
    });
    if (icd10.length > 0) {
      lines.push("");
      lines.push("ICD-10 DIAGNOSES:");
      icd10.forEach(d => {
        lines.push(`  ${d.code} — ${d.description || ""}`);
      });
    }
    lines.push("");
    lines.push("RVU SUMMARY:");
    lines.push(`  Original:  ${oRVU.toFixed(2)} wRVU ($${(oRVU * rate).toFixed(0)})`);
    lines.push(`  Enhanced:  ${eRVU.toFixed(2)} wRVU ($${(eRVU * rate).toFixed(0)})`);
    if (delta > 0) lines.push(`  Delta:     +${delta.toFixed(2)} wRVU (+$${(delta * rate).toFixed(0)})`);
    lines.push(`  Documentation Grade: ${grade}`);
    lines.push("=".repeat(50));
    return lines.join("\n");
  };

  const copy = (type) => {
    const text = type === "emr" ? buildEMRBlock() : finalNote;
    try { navigator.clipboard?.writeText(text); } catch {}
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <button onClick={() => copy("emr")} style={{
          padding: "6px 16px", borderRadius: 5, border: "none", cursor: "pointer", fontFamily: ft,
          background: `linear-gradient(135deg,${X.ac},${X.p})`, color: X.bg, fontWeight: 700, fontSize: 11,
        }}>{copied === "emr" ? "\u2713 Copied!" : "Copy EMR Block"}</button>
        <button onClick={() => copy("note")} style={{
          padding: "6px 16px", borderRadius: 5, border: `1px solid ${X.ac}40`, cursor: "pointer", fontFamily: ft,
          background: X.acD, color: X.ac, fontWeight: 600, fontSize: 11,
        }}>{copied === "note" ? "\u2713 Copied!" : "Copy Note Only"}</button>
      </div>

      {/* Preview of the structured export */}
      <div style={{ borderRadius: 10, border: `1px solid ${X.b1}`, overflow: "hidden", maxHeight: "62vh", overflowY: "auto" }}>
        {/* Note */}
        <div style={{ padding: 16, background: X.s1, borderBottom: `1px solid ${X.b1}` }}>
          <pre style={{ fontFamily: mn, fontSize: 12, lineHeight: 1.8, color: X.t1, whiteSpace: "pre-wrap", margin: 0 }}>{finalNote}</pre>
        </div>

        {/* Billing Summary */}
        <div style={{ padding: 16, background: X.s2 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: X.t1, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Billing Summary</div>

          {/* CPT Codes */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: X.t4, marginBottom: 4 }}>CPT CODES</div>
            {codes.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                <code style={{ fontFamily: mn, fontWeight: 700, fontSize: 12, color: X.ac, width: 50 }}>{c.code}</code>
                <span style={{ flex: 1, fontSize: 11, color: X.t2 }}>{c.description}</span>
                {(c.qty || 1) > 1 && <span style={{ fontSize: 9, padding: "1px 4px", borderRadius: 3, background: X.acD, color: X.ac, fontFamily: mn, fontWeight: 700 }}>x{c.qty}</span>}
                <span style={{ fontSize: 10, color: X.p, fontFamily: mn, fontWeight: 600 }}>{((c.rvu || 0) * (c.qty || 1)).toFixed(1)}</span>
              </div>
            ))}
          </div>

          {/* ICD-10 */}
          {icd10.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: X.t4, marginBottom: 4 }}>ICD-10 DIAGNOSES</div>
              {icd10.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                  <code style={{ fontFamily: mn, fontWeight: 600, fontSize: 11, color: X.y, width: 70 }}>{d.code}</code>
                  <span style={{ fontSize: 11, color: X.t2 }}>{d.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* RVU Summary */}
          <div style={{ padding: 12, borderRadius: 8, background: X.s3, border: `1px solid ${X.b1}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: X.t3 }}>Original</span>
              <span style={{ fontSize: 12, fontFamily: mn, color: X.t2 }}>{oRVU.toFixed(2)} wRVU (${(oRVU * rate).toFixed(0)})</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: X.t3 }}>Enhanced</span>
              <span style={{ fontSize: 12, fontFamily: mn, color: X.g, fontWeight: 700 }}>{eRVU.toFixed(2)} wRVU (${(eRVU * rate).toFixed(0)})</span>
            </div>
            {delta > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderTop: `1px solid ${X.b1}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: X.ac }}>Delta</span>
                <span style={{ fontSize: 12, fontFamily: mn, color: X.ac, fontWeight: 700 }}>+{delta.toFixed(2)} wRVU (+${(delta * rate).toFixed(0)})</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: X.t3 }}>Grade</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: grade === "A" ? X.g : grade === "B" ? X.ac : grade === "C" ? X.y : X.r }}>{grade}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { X, mn } from '../theme.js';

const RULES = [
  { r: "Separate Procedures", d: "Each component (decompression, fusion, instrumentation, graft) in a DISTINCT paragraph.", i: "\u00a7" },
  { r: "Level Specificity", d: "Every level explicitly named ('L4-L5'). Never 'the affected level.'", i: "L" },
  { r: "Laterality", d: "Bilateral vs. unilateral for ALL decompression and instrumentation.", i: "\u2194" },
  { r: "Medical Necessity", d: "Link each procedure to specific pathology (stenosis, instability, HNP).", i: "Dx" },
  { r: "Graft Sourcing", d: "Auto vs. allo, morselized vs. structural, harvest site, separate incision.", i: "\u2295" },
  { r: "Instrumentation Detail", d: "EACH screw by level+side. Rods, set screws, cross-links.", i: "#" },
  { r: "Add-on Language", d: "'Each additional' or 'at each subsequent level' to support add-on codes.", i: "+" },
  { r: "Distinct Procedures", d: "Decompression + fusion at same level must be SEPARATE documented procedures.", i: "\u2260" },
  { r: "Intraop Findings", d: "Describe pathology found (thickened ligamentum, osteophyte, HNP).", i: "\u2299" },
  { r: "Time & Complexity", d: "Op time, EBL, complexity factors for high-RVU codes.", i: "\u23f1" },
];

export default function RulesTab() {
  return (<div>
    {RULES.map((rule, i) => (
      <div key={i} style={{ padding: 10, borderRadius: 6, background: X.s2, border: `1px solid ${X.b1}`, marginBottom: 4, display: "flex", gap: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 5, background: X.s3, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mn, fontWeight: 700, fontSize: 12, color: X.ac, flexShrink: 0 }}>{rule.i}</div>
        <div><div style={{ fontWeight: 700, fontSize: 12, color: X.ac }}>{rule.r}</div><div style={{ fontSize: 11, color: X.t2, lineHeight: 1.5, marginTop: 2 }}>{rule.d}</div></div>
      </div>
    ))}
    <div style={{ marginTop: 16, padding: 12, borderRadius: 7, background: X.gD, border: `1px solid ${X.g}20` }}>
      <div style={{ fontWeight: 700, fontSize: 12, color: X.g, marginBottom: 4 }}>Ethical Coding</div>
      <div style={{ fontSize: 11, color: X.g, lineHeight: 1.7, opacity: .85 }}>
        This tool captures legitimate work \u2014 not upcode. The #1 spine billing error is undercoding: missing add-on codes for procedures genuinely performed. Your accept/reject patterns continuously train the system to match your documentation philosophy.
      </div>
    </div>
  </div>);
}

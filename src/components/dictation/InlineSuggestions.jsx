import { X, ft } from '../../theme.js';

export default function InlineSuggestions({ complianceResults, aiMissingElements, aiInlinePrompts, sectionCoverage, template }) {
  // Combine compliance failures + AI missing elements + AI prompts
  const items = [];

  // AI inline prompts (highest priority — contextual)
  (aiInlinePrompts || []).forEach(p => {
    items.push({ text: p.message, priority: p.priority || "medium", source: "ai" });
  });

  // AI missing elements
  (aiMissingElements || []).forEach(e => {
    items.push({ text: `${e.element} — ${e.suggestion}`, priority: e.priority || "medium", source: "ai" });
  });

  // Compliance rule failures (lower priority, deduplicate against AI items)
  const aiTexts = new Set(items.map(i => i.text.toLowerCase().slice(0, 30)));
  (complianceResults || []).filter(r => !r.present).forEach(r => {
    const text = `${r.name}: ${r.description}`;
    if (!aiTexts.has(text.toLowerCase().slice(0, 30))) {
      items.push({ text, priority: r.weight >= 2 ? "high" : "low", source: "rule" });
    }
  });

  // Section coverage gaps from template
  if (template && sectionCoverage) {
    template.sections.filter(s => s.required).forEach(s => {
      const status = sectionCoverage[s.title];
      if (status === "missing") {
        items.push({ text: `Section needed: ${s.title} — ${s.prompt}`, priority: "medium", source: "template" });
      }
    });
  }

  // Sort: high first, then medium, then low
  const order = { high: 0, medium: 1, low: 2 };
  items.sort((a, b) => (order[a.priority] || 1) - (order[b.priority] || 1));

  if (items.length === 0) return null;

  const priorityColor = (p) => p === "high" ? X.r : p === "medium" ? X.y : X.t3;
  const priorityBg = (p) => p === "high" ? X.rD : p === "medium" ? X.yD : X.s3;
  const sourceIcon = (s) => s === "ai" ? "\u2728" : s === "template" ? "\u00a7" : "\u2022";

  return (
    <div style={{ borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}`, overflow: "hidden" }}>
      <div style={{ padding: "6px 12px", background: X.s3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: X.y }}>Missing Documentation ({items.length})</span>
      </div>
      <div style={{ maxHeight: 240, overflowY: "auto" }}>
        {items.slice(0, 12).map((item, i) => (
          <div key={i} style={{
            padding: "6px 12px", borderBottom: `1px solid ${X.b1}`,
            display: "flex", alignItems: "flex-start", gap: 8,
          }}>
            <span style={{ fontSize: 10, flexShrink: 0, marginTop: 1 }}>{sourceIcon(item.source)}</span>
            <div style={{ flex: 1, fontSize: 10, color: X.t2, lineHeight: 1.5 }}>{item.text}</div>
            <span style={{
              fontSize: 8, padding: "1px 5px", borderRadius: 3, flexShrink: 0,
              background: priorityBg(item.priority), color: priorityColor(item.priority),
              fontWeight: 700, textTransform: "uppercase",
            }}>{item.priority}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { X, mn } from '../../theme.js';

export default function CPTSidebar({ matches, totalRvu, aiCodes, isAnalyzing }) {
  const hasKeyword = matches && matches.length > 0;
  const hasAI = aiCodes && aiCodes.length > 0;

  if (!hasKeyword && !hasAI) {
    return (
      <div style={{ padding: 12, borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}`, fontSize: 11, color: X.t3, textAlign: "center" }}>
        Start typing or dictating to detect CPT codes
      </div>
    );
  }

  // Merge: AI codes take priority, supplement with keyword-only matches
  const aiCodeSet = new Set((aiCodes || []).map(c => c.code));
  const keywordOnly = (matches || []).filter(m => !aiCodeSet.has(m.code));
  const aiTotalRvu = (aiCodes || []).reduce((s, c) => s + (c.rvu || 0), 0);
  const combinedRvu = hasAI ? aiTotalRvu : totalRvu;

  return (
    <div style={{ borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}`, overflow: "hidden" }}>
      <div style={{ padding: "8px 12px", background: X.s3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: X.t1 }}>
            Detected Codes ({(hasAI ? aiCodes.length : 0) + keywordOnly.length})
          </span>
          {isAnalyzing && <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: X.pD, color: X.p, fontWeight: 700, animation: "pulse 1.5s infinite" }}>AI</span>}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: X.g, fontFamily: mn }}>{combinedRvu.toFixed(1)} wRVU</span>
      </div>
      <div style={{ maxHeight: 350, overflowY: "auto" }}>
        {/* AI-detected codes */}
        {hasAI && aiCodes.map((c, i) => (
          <div key={`ai-${i}`} style={{ padding: "6px 12px", borderBottom: `1px solid ${X.b1}`, display: "flex", alignItems: "center", gap: 8 }}>
            <code style={{ fontFamily: mn, fontWeight: 700, fontSize: 11, color: X.p, flexShrink: 0, width: 50 }}>{c.code}</code>
            <div style={{ flex: 1, fontSize: 10, color: X.t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.description}</div>
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
              {c.confidence != null && (
                <div style={{ width: 30, height: 4, background: X.s3, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${c.confidence * 100}%`, height: "100%", background: c.confidence > 0.7 ? X.g : c.confidence > 0.4 ? X.y : X.r, borderRadius: 2 }} />
                </div>
              )}
              <span style={{ fontSize: 9, color: X.p, fontFamily: mn }}>{(c.rvu || 0).toFixed(1)}</span>
            </div>
          </div>
        ))}
        {/* Keyword-only codes (supplement) */}
        {keywordOnly.map((m, i) => (
          <div key={`kw-${i}`} style={{ padding: "6px 12px", borderBottom: `1px solid ${X.b1}`, display: "flex", alignItems: "center", gap: 8, opacity: hasAI ? 0.6 : 1 }}>
            <code style={{ fontFamily: mn, fontWeight: 700, fontSize: 11, color: X.ac, flexShrink: 0, width: 50 }}>{m.code}</code>
            <div style={{ flex: 1, fontSize: 10, color: X.t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.description}</div>
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 30, height: 4, background: X.s3, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${m.confidence * 100}%`, height: "100%", background: m.confidence > 0.6 ? X.g : X.y, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 9, color: X.p, fontFamily: mn }}>{m.rvu.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

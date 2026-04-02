import { X, ft, mn } from '../../theme.js';

export default function EditBlock({ type, data, idx, active, onToggle, onAccept, onReject, isA, isR }) {
  if (isR) return null;
  const isEdit = type === "edit";
  return (
    <div style={{ margin: "8px 0", borderRadius: 10, border: `1.5px solid ${isA ? X.gBr : active ? X.b2 : X.b1}`, background: X.s1, overflow: "hidden", transition: "border-color .15s" }}>
      {/* Header */}
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: isA ? X.gD : X.s2, cursor: "pointer", borderBottom: active ? `1px solid ${X.b1}` : "none" }}>
        <div style={{ width: 22, height: 22, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, fontFamily: mn, flexShrink: 0, background: isEdit ? X.acD : X.pD, color: isEdit ? X.ac : X.p }}>
          {isEdit ? "\u0394" : "+"}
        </div>
        <div style={{ flex: 1, fontSize: 12, color: isA ? X.g : X.t2, fontWeight: isA ? 600 : 400 }}>{isA ? "\u2713 Accepted" : data.reason}</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {data.codes_supported?.map(co => <span key={co} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: X.acD, color: X.ac, fontFamily: mn, fontWeight: 600 }}>{co}</span>)}
          {data.edit_type && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: X.oD, color: X.o, fontWeight: 700, textTransform: "uppercase" }}>{data.edit_type}</span>}
        </div>
        <span style={{ fontSize: 11, color: X.t4, transform: active ? "rotate(180deg)" : "none", transition: "transform .15s", marginLeft: 4 }}>{"\u25be"}</span>
      </div>

      {/* Diff body */}
      <div style={{ padding: "12px 16px" }}>
        {isEdit && (<>
          {/* REMOVED */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 8, borderRadius: 7, background: isA ? "transparent" : X.rB, border: isA ? "none" : `1px solid ${X.rBr}40`, overflow: "hidden", opacity: isA ? .35 : 1 }}>
            <div style={{ width: 36, minHeight: "100%", background: isA ? "transparent" : X.rBr + "30", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRight: isA ? "none" : `1px solid ${X.rBr}30` }}>
              <span style={{ fontWeight: 900, color: X.r, fontSize: 16 }}>{"\u2212"}</span>
            </div>
            <div style={{ padding: "8px 12px", fontFamily: mn, fontSize: 13, lineHeight: 1.8, color: X.r, textDecoration: "line-through", textDecorationThickness: "2px", textDecorationColor: "rgba(248,113,113,0.5)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{data.find}</div>
          </div>
          {/* ADDED */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 0, borderRadius: 7, background: X.gB, border: `1px solid ${X.gBr}40`, overflow: "hidden" }}>
            <div style={{ width: 36, minHeight: "100%", background: X.gBr + "30", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRight: `1px solid ${X.gBr}30` }}>
              <span style={{ fontWeight: 900, color: X.g, fontSize: 16 }}>+</span>
            </div>
            <div style={{ padding: "8px 12px", fontFamily: mn, fontSize: 13, lineHeight: 1.8, color: X.g, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{data.replace}</div>
          </div>
        </>)}
        {!isEdit && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 0, borderRadius: 7, background: X.pB + "20", border: `1px solid ${X.p}25`, overflow: "hidden" }}>
            <div style={{ width: 36, minHeight: "100%", background: X.pB + "30", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRight: `1px solid ${X.p}20` }}>
              <span style={{ fontWeight: 900, color: X.p, fontSize: 16 }}>+</span>
            </div>
            <div style={{ padding: "8px 12px", fontFamily: mn, fontSize: 13, lineHeight: 1.8, color: X.p, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{data.new_text}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      {active && !isA && !isR && (
        <div style={{ padding: "0 16px 12px", display: "flex", gap: 8 }}>
          <button onClick={e => { e.stopPropagation(); onAccept(); }} style={{ padding: "6px 20px", borderRadius: 6, border: "none", background: X.g, color: X.bg, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: ft }}>Accept</button>
          <button onClick={e => { e.stopPropagation(); onReject(); }} style={{ padding: "6px 20px", borderRadius: 6, border: `1px solid ${X.b2}`, background: "transparent", color: X.t3, fontSize: 12, cursor: "pointer", fontFamily: ft }}>Reject</button>
        </div>
      )}
    </div>
  );
}

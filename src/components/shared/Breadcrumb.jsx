import { X, ft } from '../../theme.js';

export default function Breadcrumb({ trail }) {
  if (!trail || trail.length <= 1) return null;

  return (
    <div style={{ padding: "4px 16px", background: X.s1, borderBottom: `1px solid ${X.b1}`, display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: ft }}>
      {trail.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {i > 0 && <span style={{ color: X.t4 }}>/</span>}
          {i < trail.length - 1 ? (
            <button onClick={item.onClick} style={{ background: "none", border: "none", color: X.ac, cursor: "pointer", fontFamily: ft, fontSize: 11, padding: 0, fontWeight: 500 }}>
              {item.label}
            </button>
          ) : (
            <span style={{ color: X.t2, fontWeight: 600 }}>{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

import { X, ft } from '../theme.js';

const USERS = [
  { id: "ludwig", name: "Ludwig", role: "surgeon" },
  { id: "jauregui", name: "Jauregui", role: "surgeon" },
  { id: "koh", name: "Koh", role: "surgeon" },
  { id: "padovano", name: "Padovano", role: "surgeon" },
  { id: "sapan", name: "Sapan", role: "developer" },
  { id: "hershil", name: "Hershil", role: "developer" },
];

export { USERS };

export default function LoginScreen({ onLogin }) {
  return (
    <div style={{ fontFamily: ft, background: X.bg, color: X.t1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 420, width: "100%", padding: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg,${X.ac},${X.p})`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 26, color: X.bg, marginBottom: 12 }}>S</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: X.t1 }}>SpineCPT Pro</div>
          <div style={{ fontSize: 12, color: X.t3, marginTop: 4 }}>Spine surgery operative note optimization</div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: X.t2, marginBottom: 12 }}>Sign in as:</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {USERS.map(u => (
            <button key={u.id} onClick={() => onLogin(u)} style={{
              padding: "14px 18px", borderRadius: 10, border: `1px solid ${X.b1}`, background: X.s1,
              color: X.t1, fontSize: 14, fontWeight: 600, fontFamily: ft, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12, transition: "all .15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = X.ac; e.currentTarget.style.background = X.s2; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = X.b1; e.currentTarget.style.background = X.s1; }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: u.role === "developer" ? `linear-gradient(135deg,${X.p},${X.ac})` : `linear-gradient(135deg,${X.ac},${X.g})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 16, color: X.bg, flexShrink: 0,
              }}>{u.name[0]}</div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div>{u.name}</div>
                <div style={{ fontSize: 10, color: X.t4, fontWeight: 400, marginTop: 1 }}>
                  {u.role === "developer" ? "Developer" : "Surgeon"}
                </div>
              </div>
              {u.role === "developer" && (
                <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: X.pD, color: X.p, fontWeight: 700 }}>DEV</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { X } from '../../theme.js';

export default function NCCIPanel({ warnings }) {
  if (!warnings || warnings.length === 0) return null;
  return (
    <div style={{ marginTop: 8 }}>
      {warnings.map((w, i) => (
        <div key={i} style={{ padding: 6, borderRadius: 4, background: X.yB, fontSize: 11, color: X.y, marginBottom: 3 }}>
          {"\u26a0"} {typeof w === 'string' ? w : w.description}
        </div>
      ))}
    </div>
  );
}

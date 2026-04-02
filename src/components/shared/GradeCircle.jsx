import { X } from '../../theme.js';

export default function GradeCircle({ grade, size = 32 }) {
  const col = grade === "A" ? X.g : grade === "B" ? X.ac : grade === "C" ? X.y : X.r;
  const bg = grade === "A" ? X.gD : grade === "B" ? X.acD : grade === "C" ? X.yD : X.rD;
  return (
    <div style={{
      width: size, height: size, borderRadius: 6,
      background: bg, display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: size * 0.5, color: col, flexShrink: 0,
    }}>{grade}</div>
  );
}

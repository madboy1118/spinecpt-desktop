import { X, mn } from '../../theme.js';

export default function CodePill({ code, qty, status, isNew, rvu }) {
  const statusBg = status === "supported" ? X.gD : status === "partial" ? X.yD : isNew ? X.gD : X.s3;
  const statusCol = status === "supported" ? X.g : status === "partial" ? X.y : isNew ? X.g : X.t3;

  return (
    <span style={{
      fontSize: 9, padding: "2px 5px", borderRadius: 3,
      background: statusBg, color: statusCol, fontFamily: mn,
    }} title={code}>
      {code}{qty > 1 ? ` \u00d7${qty}` : ""}{isNew ? " \u2605" : ""}
      {rvu !== undefined && (
        <span style={{ color: isNew ? X.g + "99" : X.t4, marginLeft: 3 }}>{rvu.toFixed(1)}</span>
      )}
    </span>
  );
}

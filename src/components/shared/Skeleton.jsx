import { X } from '../../theme.js';

export default function Skeleton({ width = "100%", height = 16, lines = 1, circle = false, style = {} }) {
  if (circle) {
    return <div className="skeleton" style={{ width: height, height, borderRadius: "50%", background: X.s2, ...style }} />;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton" style={{
          width: i === lines - 1 && lines > 1 ? "60%" : width,
          height, borderRadius: 4, background: X.s2,
        }} />
      ))}
    </div>
  );
}

export function AnalysisSkeleton() {
  return (
    <div style={{ padding: 4 }}>
      {/* Grade + stats row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Skeleton width={80} height={40} />
        <Skeleton width={80} height={40} />
        <Skeleton width={120} height={40} />
      </div>
      {/* Save prompt */}
      <Skeleton width="100%" height={48} style={{ marginBottom: 12 }} />
      {/* Sub-tabs */}
      <Skeleton width={300} height={32} style={{ marginBottom: 12 }} />
      {/* Edit blocks */}
      <Skeleton width="100%" height={60} style={{ marginBottom: 6 }} />
      <Skeleton width="100%" height={60} style={{ marginBottom: 6 }} />
      <Skeleton width="100%" height={60} style={{ marginBottom: 6 }} />
      <Skeleton width="100%" height={45} />
    </div>
  );
}

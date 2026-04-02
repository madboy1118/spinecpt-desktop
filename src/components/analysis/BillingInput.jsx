import { useState } from 'react';
import { X, ft, mn } from '../../theme.js';
import { computeBillingAccuracy } from '../../modules/billing.js';

export default function BillingInput({ predictedCodes, onResult }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  const handleCompare = () => {
    const billed = input.split(/[,\s\n]+/).map(s => s.trim()).filter(Boolean);
    if (billed.length === 0) return;
    const accuracy = computeBillingAccuracy(predictedCodes, billed);
    setResult(accuracy);
    onResult?.(accuracy);
  };

  return (
    <div style={{ padding: 14, borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}`, marginTop: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: X.t2, marginBottom: 6 }}>Billing Accuracy Check</div>
      <div style={{ fontSize: 10, color: X.t3, marginBottom: 8 }}>Paste the actual billed CPT codes to compare against predictions</div>
      <textarea
        value={input} onChange={e => setInput(e.target.value)}
        placeholder="Paste billed codes (comma or space separated)..."
        style={{ width: "100%", minHeight: 60, padding: 10, borderRadius: 6, background: X.s3, border: `1px solid ${X.b1}`, color: X.t1, fontSize: 12, fontFamily: mn, resize: "vertical", outline: "none", boxSizing: "border-box" }}
      />
      <button onClick={handleCompare} disabled={!input.trim()} style={{
        marginTop: 8, padding: "6px 18px", borderRadius: 6, border: "none", cursor: input.trim() ? "pointer" : "default",
        background: input.trim() ? X.ac : X.s3, color: input.trim() ? X.bg : X.t4, fontWeight: 700, fontSize: 12, fontFamily: ft,
      }}>Compare</button>

      {result && (
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ padding: 10, borderRadius: 6, background: X.s3 }}>
            <div style={{ fontSize: 9, color: X.t4, textTransform: "uppercase" }}>Precision</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: result.precision >= 80 ? X.g : result.precision >= 60 ? X.y : X.r }}>{result.precision}%</div>
          </div>
          <div style={{ padding: 10, borderRadius: 6, background: X.s3 }}>
            <div style={{ fontSize: 9, color: X.t4, textTransform: "uppercase" }}>Recall</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: result.recall >= 80 ? X.g : result.recall >= 60 ? X.y : X.r }}>{result.recall}%</div>
          </div>
          {result.falsePositives.length > 0 && (
            <div style={{ gridColumn: "1/-1", fontSize: 10, color: X.y }}>Over-predicted: {result.falsePositives.join(", ")}</div>
          )}
          {result.falseNegatives.length > 0 && (
            <div style={{ gridColumn: "1/-1", fontSize: 10, color: X.r }}>Missed: {result.falseNegatives.join(", ")}</div>
          )}
        </div>
      )}
    </div>
  );
}

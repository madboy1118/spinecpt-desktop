import { useState } from 'react';
import { X, ft, mn } from '../theme.js';
import CPT from '../data/cptLibrary.js';

export default function LibraryTab() {
  const [libSearch, setLibSearch] = useState("");
  const [xCat, setXCat] = useState(null);

  const fLib = Object.entries(CPT).reduce((acc, [cat, codes]) => {
    if (!libSearch.trim()) { acc[cat] = codes; return acc; }
    const q = libSearch.toLowerCase();
    const f = codes.filter(co => co.c.includes(q) || co.d.toLowerCase().includes(q) || co.k.some(k => k.includes(q)));
    if (f.length) acc[cat] = f;
    return acc;
  }, {});

  return (<div>
    <input value={libSearch} onChange={e => setLibSearch(e.target.value)} placeholder="Search codes, keywords, procedures..."
      style={{ width: "100%", padding: "10px 14px", borderRadius: 7, background: X.s2, border: `1px solid ${X.b1}`, color: X.t1, fontSize: 13, fontFamily: ft, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
    <div style={{ fontSize: 10, color: X.t3, marginBottom: 8 }}>{Object.values(fLib).flat().length} codes {"\u00b7"} {Object.keys(fLib).length} categories</div>
    {Object.entries(fLib).map(([cat, codes]) => (
      <div key={cat} style={{ marginBottom: 4 }}>
        <div onClick={() => setXCat(xCat === cat ? null : cat)} style={{ padding: "8px 12px", borderRadius: 5, cursor: "pointer", background: X.s2, border: `1px solid ${X.b1}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: 12 }}>{cat}</span>
          <span style={{ fontSize: 10, color: X.t3 }}>{codes.length} {"\u25be"}</span>
        </div>
        {xCat === cat && codes.map(co => (
          <div key={co.c} style={{ padding: "6px 12px", marginTop: 2, borderRadius: 4, background: X.s1, border: `1px solid ${X.b1}`, display: "grid", gridTemplateColumns: "68px 1fr 50px", gap: 8 }}>
            <code style={{ fontFamily: mn, fontWeight: 700, fontSize: 11, color: X.ac }}>{co.c}{co.a && <span style={{ display: "block", fontSize: 8, color: X.p }}>ADD-ON</span>}</code>
            <div><div style={{ fontSize: 11, color: X.t1, lineHeight: 1.4 }}>{co.d}</div><div style={{ fontSize: 10, color: X.t3, marginTop: 2 }}><span style={{ color: X.p, fontWeight: 600 }}>Req:</span> {co.r}</div></div>
            <div style={{ fontSize: 10, color: X.p, fontWeight: 600, textAlign: "right", fontFamily: mn }}>{co.v > 0 ? co.v : "\u2014"}</div>
          </div>
        ))}
      </div>
    ))}
  </div>);
}

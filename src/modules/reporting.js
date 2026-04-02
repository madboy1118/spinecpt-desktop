// Aggregate reporting functions — compute stats across all cases and surgeons

const GRADE_VAL = { A: 4, B: 3, C: 2, D: 1, F: 0 };
const VAL_GRADE = (n) => n >= 3.5 ? "A" : n >= 2.5 ? "B" : n >= 1.5 ? "C" : n >= 0.5 ? "D" : "F";

export function computeReportingStats(allCases, billingLog) {
  if (!allCases || allCases.length === 0) {
    return { totalNotes: 0, avgGrade: "?", gradeDistribution: {}, totalOrigRVU: 0, totalEnhRVU: 0, rvuDelta: 0, bySurgeon: {}, byWeek: {}, topGaps: [] };
  }

  const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  let totalGradeVal = 0;
  let totalOrigRVU = 0;
  let totalEnhRVU = 0;
  const bySurgeon = {};
  const byWeek = {};
  const gapCounts = {};

  allCases.forEach(tc => {
    // Grade
    if (gradeDistribution[tc.grade] !== undefined) gradeDistribution[tc.grade]++;
    totalGradeVal += GRADE_VAL[tc.grade] ?? 2;

    // RVU
    const origRVU = tc.analysisSnapshot?.original_rvu?.total || tc.codes.filter(c => c.status === "supported").reduce((s, c) => s + (c.rvu * (c.qty || 1)), 0);
    const enhRVU = tc.analysisSnapshot?.enhanced_rvu?.total || tc.codes.reduce((s, c) => s + (c.rvu * (c.qty || 1)), 0);
    totalOrigRVU += origRVU;
    totalEnhRVU += enhRVU;

    // Per surgeon
    const sid = tc.surgeonId || "unknown";
    if (!bySurgeon[sid]) bySurgeon[sid] = { name: tc.surgeonName || sid, notes: 0, gradeSum: 0, origRVU: 0, enhRVU: 0, codes: 0, gaps: [] };
    const bs = bySurgeon[sid];
    bs.notes++;
    bs.gradeSum += GRADE_VAL[tc.grade] ?? 2;
    bs.origRVU += origRVU;
    bs.enhRVU += enhRVU;
    bs.codes += tc.codes.length;

    // Per week
    const wk = weekKey(tc.date);
    if (!byWeek[wk]) byWeek[wk] = { notes: 0, gradeSum: 0, origRVU: 0, enhRVU: 0 };
    byWeek[wk].notes++;
    byWeek[wk].gradeSum += GRADE_VAL[tc.grade] ?? 2;
    byWeek[wk].origRVU += origRVU;
    byWeek[wk].enhRVU += enhRVU;

    // Gaps (from codes with status "gap" or "partial")
    tc.codes.filter(c => c.status === "gap" || c.status === "partial").forEach(c => {
      gapCounts[c.code] = (gapCounts[c.code] || { count: 0, desc: c.desc || "" });
      gapCounts[c.code].count++;
    });
  });

  // Finalize surgeon avgs
  Object.values(bySurgeon).forEach(bs => {
    bs.avgGrade = VAL_GRADE(bs.gradeSum / bs.notes);
    bs.avgOrigRVU = (bs.origRVU / bs.notes).toFixed(1);
    bs.avgEnhRVU = (bs.enhRVU / bs.notes).toFixed(1);
  });

  // Finalize week avgs
  Object.values(byWeek).forEach(bw => {
    bw.avgGrade = VAL_GRADE(bw.gradeSum / bw.notes);
  });

  const topGaps = Object.entries(gapCounts).sort((a, b) => b[1].count - a[1].count).slice(0, 15).map(([code, d]) => ({ code, count: d.count, desc: d.desc }));

  return {
    totalNotes: allCases.length,
    avgGrade: VAL_GRADE(totalGradeVal / allCases.length),
    gradeDistribution,
    totalOrigRVU,
    totalEnhRVU,
    rvuDelta: totalEnhRVU - totalOrigRVU,
    bySurgeon,
    byWeek,
    topGaps,
  };
}

function weekKey(dateStr) {
  if (!dateStr) return "unknown";
  const d = new Date(dateStr);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function statsToCSV(stats) {
  const lines = [];
  lines.push("metric,value");
  lines.push(`total_notes,${stats.totalNotes}`);
  lines.push(`avg_grade,${stats.avgGrade}`);
  lines.push(`total_original_rvu,${stats.totalOrigRVU.toFixed(2)}`);
  lines.push(`total_enhanced_rvu,${stats.totalEnhRVU.toFixed(2)}`);
  lines.push(`rvu_delta,${stats.rvuDelta.toFixed(2)}`);
  Object.entries(stats.gradeDistribution).forEach(([g, c]) => lines.push(`grade_${g},${c}`));
  lines.push("");
  lines.push("surgeon,notes,avg_grade,avg_orig_rvu,avg_enh_rvu");
  Object.entries(stats.bySurgeon).forEach(([, bs]) => {
    lines.push(`${bs.name},${bs.notes},${bs.avgGrade},${bs.avgOrigRVU},${bs.avgEnhRVU}`);
  });
  lines.push("");
  lines.push("week,notes,avg_grade,orig_rvu,enh_rvu");
  Object.entries(stats.byWeek).sort((a, b) => a[0].localeCompare(b[0])).forEach(([wk, bw]) => {
    lines.push(`${wk},${bw.notes},${bw.avgGrade},${bw.origRVU.toFixed(1)},${bw.enhRVU.toFixed(1)}`);
  });
  lines.push("");
  lines.push("gap_code,count,description");
  stats.topGaps.forEach(g => lines.push(`${g.code},${g.count},"${g.desc}"`));
  return lines.join("\n");
}

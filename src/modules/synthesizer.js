// Profile Synthesis Engine — distills all data into a tight, high-signal profile

export function synthesizeProfile(training, savedCases, styleMem, editHist, billingCorrections) {
  const syn = {
    totalCases: (training?.trainingCases || 0) + (savedCases?.length || 0),
    styleRules: [],
    termRules: [...(training?.terminology || [])],
    codeFrequency: {},
    codeGaps: {},
    procedureMix: {},
    grades: { A: 0, B: 0, C: 0, D: 0, F: 0 },
    recurringWeaknesses: [...(training?.weaknesses || [])],
    strengths: [...(training?.strengths || [])],
    implants: new Set(training?.implantSystems || []),
  };

  // Merge + deduplicate style observations (pre-trained + learned)
  const allStyleRaw = [...(training?.stylePatterns || []), ...(styleMem || [])];
  const styleMap = new Map();
  allStyleRaw.forEach(s => {
    const norm = s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
    const key = norm.split(/\s+/).slice(0, 6).join(" ");
    if (!styleMap.has(key)) styleMap.set(key, { text: s, count: 1 });
    else styleMap.get(key).count++;
  });
  syn.styleRules = [...styleMap.values()]
    .sort((a, b) => b.count - a.count)
    .map(s => s.count > 1 ? `${s.text} [seen ${s.count}\u00d7]` : s.text);

  // Process saved cases for CPT frequency, procedure mix, terminology, implants
  (savedCases || []).forEach(tc => {
    if (syn.grades[tc.grade] !== undefined) syn.grades[tc.grade]++;
    (tc.codes || []).forEach(cd => {
      const code = cd.code;
      if (!syn.codeFrequency[code]) syn.codeFrequency[code] = { times: 0, totalQty: 0, supported: 0, partial: 0, gap: 0, desc: cd.desc || "" };
      const cf = syn.codeFrequency[code];
      cf.times++;
      cf.totalQty += (cd.qty || 1);
      if (cd.status === "supported") cf.supported++;
      else if (cd.status === "partial") cf.partial++;
      else if (cd.status === "gap") cf.gap++;
    });

    const procs = (tc.procedures || tc.summary || "").toLowerCase();
    ["laminectomy", "fusion", "instrumentation", "decompression", "TLIF", "PLIF", "ACDF", "corpectomy",
      "pelvic fixation", "S2AI", "osteotomy", "kyphoplasty", "vertebroplasty", "fracture", "disc replacement",
      "foraminotomy", "facetectomy", "interbody", "posterolateral"].forEach(proc => {
        if (procs.includes(proc.toLowerCase())) syn.procedureMix[proc] = (syn.procedureMix[proc] || 0) + 1;
      });

    const noteText = (tc.fullNote || tc.noteExcerpt || "").toLowerCase();
    ["nuvasive", "reline", "depuy", "viper", "expedium", "medtronic", "solera", "atec", "invictus", "alphatec", "stryker", "globus", "si bone", "bedrock"]
      .forEach(sys => {
        if (noteText.includes(sys)) syn.implants.add(sys.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" "));
      });

    (tc.terminology || []).forEach(t => {
      const norm = t.toLowerCase();
      if (!syn.termRules.some(r => r.toLowerCase().includes(norm.slice(0, 20)))) syn.termRules.push(t);
    });
  });

  // Identify commonly missed codes (gap rate > 40% across 2+ cases)
  Object.entries(syn.codeFrequency).forEach(([code, cf]) => {
    if (cf.times >= 2 && (cf.partial + cf.gap) / cf.times > 0.4)
      syn.codeGaps[code] = { rate: Math.round((cf.partial + cf.gap) / cf.times * 100), times: cf.times, desc: cf.desc };
  });

  // Identify recurring weaknesses from edit acceptance patterns
  const editTypes = {};
  (editHist || []).forEach(h => {
    if (!editTypes[h.et]) editTypes[h.et] = { a: 0, r: 0 };
    h.ok ? editTypes[h.et].a++ : editTypes[h.et].r++;
  });
  Object.entries(editTypes).forEach(([type, { a, r }]) => {
    const total = a + r;
    if (total >= 3 && a / total > 0.7) {
      if (!syn.recurringWeaknesses.some(w => w.toLowerCase().includes(type)))
        syn.recurringWeaknesses.push(`Surgeon consistently needs "${type}" improvements (accepted ${Math.round(a / total * 100)}% of ${total})`);
    }
  });

  syn.implants = [...syn.implants];

  // Aggregate billing corrections
  syn.billingMissed = {};
  syn.billingOverPredicted = {};
  (billingCorrections || []).forEach(bc => {
    (bc.missedCodes || []).forEach(c => { syn.billingMissed[c] = (syn.billingMissed[c] || 0) + 1; });
    (bc.overPredicted || []).forEach(c => { syn.billingOverPredicted[c] = (syn.billingOverPredicted[c] || 0) + 1; });
  });

  return syn;
}

export function buildPrompt(prof, styleMem, editPrefs, training, savedCases, editHist, billingCorrections) {
  const syn = synthesizeProfile(training, savedCases, styleMem, editHist, billingCorrections);

  const topCodes = Object.entries(syn.codeFrequency)
    .sort((a, b) => b[1].times - a[1].times).slice(0, 15)
    .map(([code, cf]) => `${code} (${cf.times}\u00d7 \u2014 ${cf.supported} supported, ${cf.partial} partial, ${cf.gap} gap) ${cf.desc}`)
    .join("\n");

  const gapCodes = Object.entries(syn.codeGaps)
    .map(([code, g]) => `${code}: missed ${g.rate}% of ${g.times} cases \u2014 ${g.desc}`)
    .join("\n");

  const procMix = Object.entries(syn.procedureMix).sort((a, b) => b[1] - a[1])
    .map(([proc, count]) => `${proc} (${count}\u00d7)`).join(", ");

  const gradeStr = Object.entries(syn.grades).filter(([, v]) => v > 0).map(([g, v]) => `${v}\u00d7${g}`).join(", ");

  return `You are an expert spine surgery CPT coding assistant with a DEEP PROFILE of this specific surgeon built from ${syn.totalCases} real operative notes.

SURGEON: ${prof.name || "Unknown"}
SUBSPECIALTY: ${prof.focus || "Ortho spine"}
IMPLANT SYSTEMS: ${syn.implants.length > 0 ? syn.implants.join(", ") : "Not yet identified"}

\u2550\u2550\u2550 SURGEON PROFILE (synthesized from ${syn.totalCases} cases) \u2550\u2550\u2550

DOCUMENTATION GRADES: ${gradeStr || "No data yet"}
TYPICAL PROCEDURES: ${procMix || "Not enough data"}

${topCodes ? `MOST FREQUENT CPT CODES (what this surgeon typically bills):
${topCodes}` : "No coding history yet."}

${gapCodes ? `COMMONLY MISSED/UNDERDOCUMENTED CODES (focus here):
${gapCodes}
These codes are the highest-value targets \u2014 the surgeon performs these procedures but the documentation frequently falls short. PRIORITIZE edits that would capture these codes.` : ""}

\u2550\u2550\u2550 WRITING STYLE (${syn.styleRules.length} patterns) \u2550\u2550\u2550
${syn.styleRules.slice(0, 25).map(s => `\u2022 ${s}`).join("\n") || "No style data yet \u2014 observe and report patterns."}

\u2550\u2550\u2550 TERMINOLOGY (use these EXACT terms) \u2550\u2550\u2550
${syn.termRules.slice(0, 25).map(s => `\u2022 ${s}`).join("\n") || "No terminology data yet \u2014 observe and report patterns."}

\u2550\u2550\u2550 DOCUMENTATION WEAKNESSES (${syn.recurringWeaknesses.length} known) \u2550\u2550\u2550
${syn.recurringWeaknesses.map(s => `\u2022 ${s}`).join("\n") || "No weaknesses identified yet."}

\u2550\u2550\u2550 EDIT PREFERENCES \u2550\u2550\u2550
${editPrefs.length > 0 ? editPrefs.map(p => `\u2022 ${p}`).join("\n") : "No edit history yet."}

${(() => {
  const missed = Object.entries(syn.billingMissed || {}).sort((a,b) => b[1]-a[1]);
  const overPred = Object.entries(syn.billingOverPredicted || {}).sort((a,b) => b[1]-a[1]);
  if (missed.length === 0 && overPred.length === 0) return "";
  const lines = ["\u2550\u2550\u2550 BILLING CORRECTIONS (from actual billing data) \u2550\u2550\u2550"];
  missed.forEach(([c, n]) => lines.push(`\u2022 ${c}: MISSED ${n} time(s) \u2014 PRIORITIZE detecting this code`));
  overPred.forEach(([c, n]) => lines.push(`\u2022 ${c}: OVER-PREDICTED ${n} time(s) \u2014 AVOID suggesting unless clearly documented`));
  return lines.join("\n");
})()}

CPT MODIFIER RULES:
- Modifier 59 (Distinct Procedural Service): Use when two procedures are performed at the same session but are truly separate (e.g., decompression at a different level than fusion)
- Modifier 51 (Multiple Procedures): Applied automatically by payers to additional procedures; generally do not append manually
- Modifier 62 (Two Surgeons): When two surgeons perform distinct parts of a procedure
- Modifier 22 (Increased Procedural Services): When work substantially exceeds the typical — document WHY (e.g., severe adhesions, revision, morbid obesity)
- Modifier 50 (Bilateral Procedure): When the same procedure is performed bilaterally
- Only suggest modifiers when documentation clearly supports them. Include in "modifiers" array for each code.

ICD-10 LINKAGE RULES:
- Each CPT code MUST have at least one linked ICD-10 diagnosis code in "linked_icd10" array
- The diagnosis must medically justify the procedure (e.g., M48.06 stenosis justifies 63047 decompression)
- Payers reject claims when diagnosis does not support the procedure — this is critical
- Use the most specific ICD-10 code available (laterality, level, encounter type)

RULES:
1. NEVER suggest billing for unperformed procedures
2. PRESERVE this surgeon's EXACT voice \u2014 use THEIR terms, match THEIR style
3. FOCUS edits on COMMONLY MISSED CODES listed above \u2014 these are the highest-value fixes
4. Flag upcoding risks. Identify MISSED codes (undercoding).
5. Note NCCI bundling issues.
6. Match this surgeon's transition phrases, paragraph structure, and closing format.
7. If this surgeon has a history of billing a specific code (see frequency list), ensure it's captured when the procedure is performed again.

CRITICAL \u2014 RVU CALCULATION:
"original_rvu" = Codes the note ALREADY supports AS WRITTEN. This should almost NEVER be zero.
"enhanced_rvu" = ALL codes billable AFTER edits. Mark new codes "new":true.

IMPORTANT \u2014 ADD-ON CODE QUANTITIES: When an add-on code applies at MULTIPLE levels, include it MULTIPLE TIMES in the codes array \u2014 once per level.

Return ONLY valid JSON (NO markdown fences, NO preamble):
{
"summary":"Brief case summary",
"style_observations":["Only NEW patterns not already in the profile above \u2014 if you see something new about how this surgeon writes, report it"],
"terminology_observations":["Only NEW terms not already documented above"],
"original_rvu":{"codes":[{"code":"63047","rvu":17.46,"description":"..."}],"total":0.0},
"enhanced_rvu":{"codes":[{"code":"63047","rvu":17.46,"description":"...","new":false},{"code":"22848","rvu":7.88,"description":"...","new":true}],"total":0.0},
"identified_codes":[{"code":"XXXXX","description":"...","status":"supported|partial|gap","confidence":0.0,"suggested_improvement":"...","is_addon":false,"rvu":0.0,"qty":1,"modifiers":["59"],"linked_icd10":["M48.06"]}],
"bundling_warnings":["..."],
"missing_elements":["..."],
"overall_documentation_grade":"A|B|C|D|F",
"text_edits":[{"find":"EXACT text from note","replace":"improved text in surgeon's OWN voice","reason":"reference specific weakness or missed code being addressed","codes_supported":["XXXXX"],"edit_type":"specificity|laterality|keyword|completeness|necessity|terminology"}],
"missing_paragraphs":[{"insert_after":"EXACT text","new_text":"paragraph in this surgeon's voice","reason":"why \u2014 reference gap code if applicable","codes_supported":["XXXXX"]}],
"icd10_codes":[{"code":"M48.06","description":"Spinal stenosis, lumbar region"}],
"checklist":[{"item":"...","present":true,"note":"..."}]
}`;
}

// 15 Documentation Compliance Rules
// Each rule has: id, name, description, weight (laterality=2x, consent=1x), keywords to check

const COMPLIANCE_RULES = [
  {
    id: "laterality",
    name: "Laterality",
    description: "Bilateral vs. unilateral documented for ALL decompression and instrumentation",
    weight: 2,
    keywords: ["bilateral", "unilateral", "right", "left", "both sides", "right-sided", "left-sided"],
    icon: "\u2194",
  },
  {
    id: "levels",
    name: "Level Specificity",
    description: "Every spinal level explicitly named (e.g., 'L4-L5'). Never 'the affected level.'",
    weight: 2,
    keywords: ["L1", "L2", "L3", "L4", "L5", "S1", "S2", "C3", "C4", "C5", "C6", "C7", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
    icon: "L",
  },
  {
    id: "implant-detail",
    name: "Implant Detail",
    description: "Specific implant names, sizes, manufacturers documented",
    weight: 2,
    keywords: ["screw", "rod", "plate", "cage", "mm", "diameter", "length"],
    icon: "#",
  },
  {
    id: "medical-necessity",
    name: "Medical Necessity",
    description: "Each procedure linked to specific pathology (stenosis, instability, HNP)",
    weight: 2,
    keywords: ["stenosis", "instability", "herniation", "fracture", "spondylolisthesis", "myelopathy", "radiculopathy", "compression", "deformity"],
    icon: "Dx",
  },
  {
    id: "consent",
    name: "Consent Documentation",
    description: "Informed consent documented with risks discussed",
    weight: 1,
    keywords: ["consent", "risks", "benefits", "alternatives", "informed"],
    icon: "\u2713",
  },
  {
    id: "antibiotics",
    name: "Antibiotic Prophylaxis",
    description: "Pre-operative antibiotics documented",
    weight: 1,
    keywords: ["ancef", "cefazolin", "antibiotic", "vancomycin", "prophylaxis"],
    icon: "Rx",
  },
  {
    id: "positioning",
    name: "Patient Positioning",
    description: "Operative position documented (prone, supine, lateral)",
    weight: 1,
    keywords: ["prone", "supine", "lateral", "positioned", "positioning", "prepped and draped"],
    icon: "\u2b6f",
  },
  {
    id: "timeout",
    name: "Timeout / Safety Check",
    description: "Surgical timeout performed",
    weight: 1,
    keywords: ["timeout", "time out", "time-out", "safety check", "verification"],
    icon: "\u23f8",
  },
  {
    id: "separate-procedures",
    name: "Separate Procedures",
    description: "Each component (decompression, fusion, instrumentation, graft) in distinct sections",
    weight: 1.5,
    keywords: ["decompression", "fusion", "instrumentation", "graft", "bone graft"],
    icon: "\u00a7",
  },
  {
    id: "graft-sourcing",
    name: "Graft Sourcing",
    description: "Auto vs. allo, morselized vs. structural, harvest site, separate incision",
    weight: 1.5,
    keywords: ["autograft", "allograft", "morselized", "structural", "iliac crest", "local bone", "DBM", "BMP", "separate incision"],
    icon: "\u2295",
  },
  {
    id: "add-on-language",
    name: "Add-on Code Language",
    description: "'Each additional' or 'at each subsequent level' supports add-on billing",
    weight: 1,
    keywords: ["each additional", "additional level", "each subsequent", "additional segment", "add-on", "additional interspace"],
    icon: "+",
  },
  {
    id: "intraop-findings",
    name: "Intraoperative Findings",
    description: "Pathology found described (thickened ligamentum, osteophyte, HNP)",
    weight: 1,
    keywords: ["ligamentum flavum", "osteophyte", "herniation", "stenosis", "compression", "hypertrophy", "adhesion", "fibrosis", "hematoma"],
    icon: "\u2299",
  },
  {
    id: "ebl",
    name: "Estimated Blood Loss",
    description: "EBL documented",
    weight: 1,
    keywords: ["blood loss", "EBL", "mL", "cc", "estimated blood"],
    icon: "\u2764",
  },
  {
    id: "neuromonitoring",
    name: "Neuromonitoring",
    description: "IONM modalities and interpretation documented if used",
    weight: 1,
    keywords: ["IONM", "neuromonitoring", "SSEP", "MEP", "EMG", "triggered EMG", "monitoring"],
    icon: "\u26a1",
  },
  {
    id: "closure",
    name: "Closure Details",
    description: "Layered closure technique, drain, dressing documented",
    weight: 1,
    keywords: ["closure", "closed", "suture", "staple", "drain", "Vicryl", "dressing", "dermabond", "steri-strip"],
    icon: "\u2702",
  },
];

// Score a note against compliance rules
export function scoreCompliance(noteText) {
  const lower = noteText.toLowerCase();
  let totalWeight = 0;
  let earnedWeight = 0;
  const results = [];

  COMPLIANCE_RULES.forEach(rule => {
    totalWeight += rule.weight;
    const present = rule.keywords.some(kw => lower.includes(kw.toLowerCase()));
    if (present) earnedWeight += rule.weight;
    results.push({ ...rule, present });
  });

  return {
    score: totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0,
    results,
    earned: earnedWeight,
    total: totalWeight,
  };
}

export default COMPLIANCE_RULES;

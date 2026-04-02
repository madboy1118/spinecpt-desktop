// Live CPT keyword scanner — scans note text against CPT library

import CPT from '../data/cptLibrary.js';

// Detect CPT codes from note text based on keyword matching
export function detectCodes(noteText) {
  const lower = noteText.toLowerCase();
  const matches = [];

  Object.entries(CPT).forEach(([category, codes]) => {
    codes.forEach(co => {
      const hitKeywords = co.k.filter(kw => lower.includes(kw.toLowerCase()));
      if (hitKeywords.length > 0) {
        const confidence = Math.min(hitKeywords.length / co.k.length, 1.0);
        matches.push({
          code: co.c,
          description: co.d,
          rvu: co.v,
          category,
          isAddon: !!co.a,
          confidence,
          hitKeywords,
          requirements: co.r,
        });
      }
    });
  });

  // Sort by confidence descending
  matches.sort((a, b) => b.confidence - a.confidence);
  return matches;
}

// Pre-filter CPT codes relevant to the note to keep prompt small
export function filterRelevantCodes(noteText) {
  const lower = noteText.toLowerCase();
  const relevant = {};

  Object.entries(CPT).forEach(([cat, codes]) => {
    const hits = codes.filter(co => co.k.some(kw => lower.includes(kw.toLowerCase())));
    if (hits.length > 0 || cat.toLowerCase().split(/\s+/).some(w => lower.includes(w))) {
      relevant[cat] = codes; // send full category so add-ons are included
    }
  });

  // Always include bone graft, instrumentation, and neuromonitoring (commonly missed)
  ["Bone Graft", "Instrumentation", "Neuromonitoring / Misc"].forEach(cat => {
    if (CPT[cat]) relevant[cat] = CPT[cat];
  });

  return relevant;
}

// Compute total wRVU from detected codes
export function computeDetectedRVU(matches) {
  return matches.reduce((sum, m) => sum + m.rvu, 0);
}

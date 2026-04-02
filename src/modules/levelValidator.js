// Multi-level procedure validation — ensures add-on code quantities match documented levels

// Add-on codes and their primary codes + expected quantity formula
const ADD_ON_RULES = {
  // Decompression add-ons
  "63048": { primaries: ["63045", "63046", "63047"], formula: "levels - 1", label: "laminectomy add-on" },
  "63035": { primaries: ["63030"], formula: "levels - 1", label: "discectomy add-on" },
  "63044": { primaries: ["63040", "63042", "63043"], formula: "levels - 1", label: "re-exploration add-on" },
  // Fusion add-ons
  "22614": { primaries: ["22612", "22600", "22610"], formula: "levels - 1", label: "posterior fusion add-on" },
  "22632": { primaries: ["22630", "22633"], formula: "interspaces - 1", label: "PLIF add-on" },
  "22634": { primaries: ["22633"], formula: "interspaces - 1", label: "TLIF add-on" },
  "22552": { primaries: ["22551"], formula: "levels - 1", label: "anterior cervical fusion add-on" },
  "22585": { primaries: ["22558"], formula: "levels - 1", label: "anterior lumbar fusion add-on" },
  // Instrumentation add-ons
  "22842": { primaries: ["22840"], formula: "segments", label: "posterior segmental instrumentation" },
  "22845": { primaries: ["22846"], formula: "segments", label: "anterior instrumentation" },
  // Cervical add-ons
  "63076": { primaries: ["63075"], formula: "levels - 1", label: "cervical discectomy add-on" },
  // Kyphoplasty add-ons
  "22515": { primaries: ["22513", "22514"], formula: "levels - 1", label: "kyphoplasty add-on" },
};

// Count documented spinal levels in the note
export function countDocumentedLevels(noteText) {
  const upper = noteText.toUpperCase();
  const result = { levels: new Set(), interspaces: new Set(), segments: 0 };

  // Individual vertebral levels: C3-C7, T1-T12, L1-L5, S1-S2
  const levelPattern = /\b([CTLS][1-9][0-2]?)\b/g;
  let match;
  while ((match = levelPattern.exec(upper)) !== null) {
    const lvl = match[1];
    // Filter out non-spine matches (e.g., "S1" in a word)
    if (/^[CTLS]\d{1,2}$/.test(lvl)) {
      const num = parseInt(lvl.slice(1));
      if ((lvl[0] === "C" && num <= 7) || (lvl[0] === "T" && num <= 12) ||
          (lvl[0] === "L" && num <= 5) || (lvl[0] === "S" && num <= 2)) {
        result.levels.add(lvl);
      }
    }
  }

  // Interspaces: "L4-L5", "L4-5", "C5-C6", "C5-6", "L4-L5"
  const interspacePattern = /\b([CTLS]\d{1,2})\s*[-\/]\s*([CTLS]?\d{1,2})\b/g;
  while ((match = interspacePattern.exec(upper)) !== null) {
    const lvl1 = match[1];
    let lvl2 = match[2];
    // If second level is missing the letter prefix, inherit from first
    if (/^\d{1,2}$/.test(lvl2)) lvl2 = lvl1[0] + lvl2;
    result.interspaces.add(`${lvl1}-${lvl2}`);
    result.levels.add(lvl1);
    result.levels.add(lvl2);
  }

  // Range patterns: "L3 through L5", "L3 to S1", "T10-L2"
  const rangePattern = /\b([CTLS]\d{1,2})\s*(?:through|to|thru|-)\s*([CTLS]\d{1,2})\b/gi;
  while ((match = rangePattern.exec(noteText)) !== null) {
    result.levels.add(match[1].toUpperCase());
    result.levels.add(match[2].toUpperCase());
  }

  // Estimate segments from levels (number of levels = segments for instrumentation)
  result.segments = Math.max(result.levels.size, result.interspaces.size + 1);

  return {
    levelCount: result.levels.size,
    interspaceCount: result.interspaces.size || Math.max(0, result.levels.size - 1),
    segments: result.segments,
    levels: [...result.levels].sort(),
    interspaces: [...result.interspaces],
  };
}

// Validate that add-on code quantities match documented level counts
export function validateAddonQuantities(identifiedCodes, documentedLevels) {
  const warnings = [];
  if (!identifiedCodes || !documentedLevels) return warnings;

  const codeMap = {};
  identifiedCodes.forEach(c => { codeMap[c.code] = c; });

  for (const [addonCode, rule] of Object.entries(ADD_ON_RULES)) {
    const addon = codeMap[addonCode];
    if (!addon) continue;

    // Check if any primary code is present
    const hasPrimary = rule.primaries.some(p => codeMap[p]);
    if (!hasPrimary) {
      warnings.push({
        code: addonCode,
        type: "missing_primary",
        message: `Add-on ${addonCode} (${rule.label}) requires a primary code (${rule.primaries.join("/")}), but none found.`,
        severity: "error",
      });
      continue;
    }

    // Compute expected quantity
    let expected;
    if (rule.formula === "levels - 1") {
      expected = Math.max(1, documentedLevels.levelCount - 1);
    } else if (rule.formula === "interspaces - 1") {
      expected = Math.max(1, documentedLevels.interspaceCount - 1);
    } else if (rule.formula === "segments") {
      expected = documentedLevels.segments;
    } else {
      continue;
    }

    const actual = addon.qty || 1;

    if (actual !== expected && documentedLevels.levelCount >= 2) {
      warnings.push({
        code: addonCode,
        type: "quantity_mismatch",
        message: `${addonCode} (${rule.label}): qty=${actual} but ${documentedLevels.levelCount} levels documented (${documentedLevels.levels.join(", ")}). Expected qty=${expected}.`,
        severity: "warning",
        expected,
        actual,
      });
    }
  }

  return warnings;
}

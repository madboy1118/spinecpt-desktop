// NCCI Bundling Edit Pairs — spine-specific
// Each pair: [code1, code2, severity, description]
// severity: "error" = cannot unbundle, "warning" = modifier may apply

const NCCI_PAIRS = [
  // Decompression + Fusion same level
  ["63047", "22612", "warning", "Laminectomy bundled with posterolateral fusion at same level — modifier may apply"],
  ["63047", "22630", "warning", "Laminectomy bundled with interbody fusion at same level"],
  ["63047", "22633", "warning", "Laminectomy bundled with combined fusion at same level"],
  ["63005", "22612", "warning", "Laminectomy w/o facetectomy bundled with PLF"],
  ["63005", "22630", "warning", "Laminectomy w/o facetectomy bundled with interbody fusion"],

  // Fusion overlap
  ["22612", "22630", "error", "Cannot bill posterolateral and interbody fusion separately at same level — use 22633"],
  ["22612", "22633", "error", "Cannot bill posterolateral fusion with combined code at same level"],
  ["22630", "22633", "error", "Cannot bill interbody fusion with combined code at same level"],

  // Instrumentation overlap
  ["22842", "22843", "error", "Cannot bill 3-6 segment and 7-12 segment instrumentation simultaneously"],
  ["22842", "22844", "error", "Cannot bill 3-6 segment and 13+ segment instrumentation simultaneously"],
  ["22843", "22844", "error", "Cannot bill 7-12 segment and 13+ segment instrumentation simultaneously"],

  // Anterior cervical
  ["63075", "22551", "warning", "Anterior cervical discectomy may be bundled with ACDF fusion"],
  ["22551", "22845", "warning", "ACDF fusion and anterior instrumentation — check separate documentation"],

  // Add-on code without primary
  ["63048", "63047", "warning", "Add-on 63048 requires primary 63045-63047"],
  ["22614", "22612", "warning", "Add-on 22614 requires primary 22612"],
  ["22632", "22630", "warning", "Add-on 22632 requires primary 22630"],
  ["22634", "22633", "warning", "Add-on 22634 requires primary 22633"],
  ["22552", "22551", "warning", "Add-on 22552 requires primary 22551"],

  // Graft combinations
  ["20936", "20937", "warning", "Structural and morselized autograft from separate incision — verify both documented"],
  ["20930", "20931", "warning", "Morselized and structural allograft — verify both types used"],

  // Corpectomy + decompression
  ["63081", "63075", "error", "Corpectomy includes discectomy at same level"],
  ["63085", "63047", "warning", "Thoracic corpectomy may include laminectomy component"],

  // Kyphoplasty
  ["22513", "22514", "error", "Cannot bill thoracic and lumbar kyphoplasty primary codes together — use add-on 22515"],
  ["22510", "22511", "error", "Cannot bill cervicothoracic and lumbosacral vertebroplasty primary codes together"],

  // Disc replacement
  ["22856", "63075", "warning", "Cervical disc replacement may include discectomy"],
  ["22856", "22551", "error", "Cannot bill disc replacement and fusion at same level"],

  // Fracture + fusion
  ["22318", "22612", "warning", "Open fracture treatment with fusion — verify distinct procedures documented"],
  ["22325", "22554", "warning", "Anterior fracture treatment with anterior fusion — verify separate indications"],

  // SI joint
  ["27279", "27280", "error", "Cannot bill percutaneous and open SI fusion simultaneously"],

  // Wound
  ["22010", "22015", "error", "Cannot bill cervical/thoracic and lumbar I&D together unless distinct wounds"],
];

// Validate identified codes against NCCI table
export function validateNCCI(codes) {
  const codeSet = new Set(codes.map(c => typeof c === 'string' ? c : c.code));
  const warnings = [];

  NCCI_PAIRS.forEach(([c1, c2, severity, desc]) => {
    if (codeSet.has(c1) && codeSet.has(c2)) {
      warnings.push({ code1: c1, code2: c2, severity, description: desc });
    }
  });

  return warnings;
}

export default NCCI_PAIRS;

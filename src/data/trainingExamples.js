// Curated training examples with annotated operative notes

const TRAINING_EXAMPLES = [
  {
    id: "lumbar-decompression-gaps",
    title: "Lumbar Decompression — Missing Documentation",
    procedureType: "Posterior Lumbar Decompression",
    difficulty: "beginner",
    description: "A common lumbar laminectomy note that misses key documentation elements needed for 63047 billing.",

    originalNote: `PREOPERATIVE DIAGNOSIS: Lumbar stenosis L4-5
POSTOPERATIVE DIAGNOSIS: Same
PROCEDURE: L4-5 laminectomy

DESCRIPTION OF PROCEDURE:
The patient was positioned prone. A midline incision was made over L4-5. Dissection was carried down to the lamina. A laminectomy was performed at L4-5. The nerve roots were decompressed. The wound was irrigated and closed in layers. The patient was taken to recovery in stable condition.`,

    annotations: [
      { text: "A midline incision was made over L4-5", type: "missing", message: "No fluoroscopic confirmation of level. How was L4-5 identified? Without this, the level billed could be questioned." },
      { text: "Dissection was carried down to the lamina", type: "weak", message: "Acceptable but vague. Better: 'Subperiosteal dissection exposed the L4 and L5 laminae bilaterally.'" },
      { text: "A laminectomy was performed at L4-5", type: "missing", message: "CRITICAL: 63047 requires documentation of facetectomy AND foraminotomy as SEPARATE steps. Without these, the code is downgraded to 63005 (laminotomy only) — a loss of ~10 RVU." },
      { text: "The nerve roots were decompressed", type: "missing", message: "Which nerve roots? L5? Bilateral? What pathology was compressing them? What tools were used (Kerrison, rongeur)? This is where the CPT requirements are unmet." },
      { text: "closed in layers", type: "weak", message: "No mention of EBL, drain, antibiotic irrigation, suture types, or dressing. These details support surgical complexity." },
    ],

    targetCPT: [
      { code: "63047", status: "gap", description: "Laminectomy+facetectomy+foraminotomy, lumbar", rvu: 17.46, reason: "Facetectomy and foraminotomy not documented as separate steps" },
      { code: "95940", status: "gap", description: "Intraoperative neuromonitoring", rvu: 0, reason: "IONM not mentioned at all" },
    ],

    pitfalls: [
      "Failing to document facetectomy and foraminotomy as distinct steps — #1 reason 63047 is downgraded to 63005",
      "Not specifying laterality of decompression (bilateral vs unilateral)",
      "Missing IONM documentation leaves 95940 on the table",
      "No intraoperative findings (stenosis severity, ligamentum flavum hypertrophy, disc pathology)",
      "No mention of positioning details, timeout, or antibiotics",
    ],

    enhancedNote: `PREOPERATIVE DIAGNOSIS: Lumbar spinal stenosis, L4-5 (M48.06)
POSTOPERATIVE DIAGNOSIS: Same, confirmed severe bilateral central and foraminal stenosis
PROCEDURE: L4-5 laminectomy with bilateral facetectomy and foraminotomy (63047)

DESCRIPTION OF PROCEDURE:
The patient was placed prone on the Jackson table. Prepped and draped in the usual sterile fashion. Ancef 2g IV was administered prior to incision. Sequential compression devices were applied for DVT prophylaxis. A timeout procedure was performed confirming correct patient, procedure, and level.

A midline incision was made and carried down through the subcutaneous tissue to the lumbodorsal fascia. The L4-5 level was confirmed with lateral fluoroscopy. Subperiosteal dissection was performed bilaterally to expose the L4 and L5 laminae.

DECOMPRESSION:
The L4-5 laminectomy was performed. The L4 inferior lamina and L5 superior lamina were thinned with a high-speed cutting burr, then removed with Leksell rongeurs. The ligamentum flavum was found to be markedly hypertrophied and was excised bilaterally using a combination of curettes and 3mm Kerrison rongeurs.

A bilateral medial facetectomy was then performed at L4-5 to decompress the lateral recesses. The medial one-third of each inferior articular process of L4 was removed using the Kerrison rongeur.

Bilateral L4-5 foraminotomies were completed using 3mm and 4mm Kerrison rongeurs, undercutting the remaining superior articular process of L5 bilaterally. Free passage of the L5 nerve roots was confirmed on each side.

INTRAOPERATIVE FINDINGS:
Severe central canal stenosis secondary to ligamentum flavum hypertrophy and facet overgrowth. The thecal sac was significantly compressed. Bilateral L5 nerve roots were tethered in the lateral recesses by hypertrophied facets. After decompression, the thecal sac expanded and both L5 nerve roots were freely mobile with gentle retraction.

NEUROMONITORING:
IONM with SSEPs and MEPs was utilized throughout the procedure. Baseline signals obtained. No significant changes from baseline. Triggered EMG performed bilaterally with acceptable thresholds.

CLOSURE:
The wound was copiously irrigated with antibiotic-laden saline. Hemostasis obtained with bipolar electrocautery. A subfascial Hemovac drain was placed. The lumbodorsal fascia was closed with interrupted #1 Vicryl Plus sutures. Subcutaneous closure with 2-0 Vicryl Plus. Skin closed with staples. Sterile dressing applied.

EBL: 75 mL. The patient was transferred to recovery in stable condition.`,

    enhancedCPT: [
      { code: "63047", status: "supported", description: "Laminectomy+facetectomy+foraminotomy, lumbar", rvu: 17.46 },
      { code: "95940", status: "supported", description: "Intraoperative neuromonitoring", rvu: 0 },
    ],
  },

  {
    id: "acdf-missing-device",
    title: "ACDF — Missing Interbody Device Code",
    procedureType: "ACDF",
    difficulty: "intermediate",
    description: "An ACDF note that documents the procedure well but misses the interbody device code 22853 due to vague cage documentation.",

    originalNote: `PREOPERATIVE DIAGNOSIS: C5-6 disc herniation with radiculopathy
POSTOPERATIVE DIAGNOSIS: Same
PROCEDURE: C5-6 anterior cervical discectomy and fusion

The patient was placed supine with the neck in slight extension. A transverse skin incision was made on the right side at the C5-6 level. The platysma was divided. The anterior spine was exposed via a Smith-Robinson approach. Fluoroscopy confirmed C5-6.

The C5-6 disc was removed with pituitary rongeurs and curettes. The posterior osteophytes were removed with a burr and Kerrison rongeurs. The neural elements were decompressed.

A graft was placed in the disc space. An anterior cervical plate was applied with screws at C5 and C6.

The wound was closed in layers. The patient tolerated the procedure well.`,

    annotations: [
      { text: "A graft was placed in the disc space", type: "missing", message: "CRITICAL: What type of graft? PEEK cage? Allograft spacer? What size? What was it filled with (autograft, allograft, DBM, BMP)? Without specifying an interbody biomechanical device, you lose code 22853 (6.86 RVU)." },
      { text: "An anterior cervical plate was applied with screws at C5 and C6", type: "weak", message: "Better: specify plate manufacturer, length, screw sizes, and locking mechanism. This supports the instrumentation code." },
      { text: "The neural elements were decompressed", type: "missing", message: "Which neural elements? The C6 nerve root? The spinal cord? Describe what was compressing them." },
    ],

    targetCPT: [
      { code: "22551", status: "supported", description: "Anterior cervical fusion, C5-6", rvu: 24.83, reason: "Fusion is documented" },
      { code: "63075", status: "supported", description: "Anterior cervical discectomy", rvu: 17.74, reason: "Discectomy documented" },
      { code: "22853", status: "gap", description: "Insertion of interbody biomechanical device", rvu: 6.86, reason: "Graft described too vaguely — no device specifics" },
      { code: "22845", status: "partial", description: "Anterior instrumentation (plate)", rvu: 7.06, reason: "Plate documented but minimal detail" },
    ],

    pitfalls: [
      "Using 'graft' without specifying it's a biomechanical interbody device (PEEK cage, etc.) — loses 22853",
      "Not documenting plate manufacturer, size, and screw specifics",
      "Missing endplate preparation details (critical for fusion billing)",
      "No mention of trial sizing before final implant",
    ],

    enhancedNote: `PREOPERATIVE DIAGNOSIS: C5-6 disc herniation with right C6 radiculopathy (M50.121)
POSTOPERATIVE DIAGNOSIS: Same, confirmed right paracentral disc herniation with C6 root compression
PROCEDURE: C5-6 anterior cervical discectomy and fusion (22551), cervical discectomy (63075), interbody cage placement (22853), anterior plate instrumentation (22845)

The patient was placed supine with the neck in slight extension on a gel donut headrest. Prepped and draped in the usual fashion. Timeout confirmed. Ancef administered.

APPROACH:
A transverse skin incision was made on the right side at the C5-6 level. The platysma was divided in line with its fibers. The anterior cervical spine was exposed via a standard Smith-Robinson approach, retracting the carotid sheath laterally and the esophagus/trachea medially. Self-retaining retractors were placed. Caspar distraction pins were placed in C5 and C6 vertebral bodies. Fluoroscopy confirmed the C5-6 level.

DISCECTOMY:
A complete C5-6 discectomy was performed using a #15 blade annulotomy followed by removal of disc material with pituitary rongeurs and curettes. The posterior osteophytes were removed with a 3mm cutting burr. The posterior longitudinal ligament was excised. Bilateral uncovertebral joints were identified and decompressed with a 2mm Kerrison rongeur. The right C6 nerve root was directly visualized and confirmed decompressed. The spinal cord was free of compression.

ENDPLATE PREPARATION:
The C5 inferior and C6 superior endplates were prepared using the medial burr to remove cartilaginous endplate down to bleeding subchondral bone, preserving the bony endplates to resist subsidence.

INTERBODY DEVICE:
Trial sizing was performed. A 7mm PEEK interbody cage (Stryker Tritanium C, 14mm AP x 7mm height) packed with 0.5cc local autograft bone mixed with DBM putty was inserted under fluoroscopic guidance. Excellent fit confirmed with no graft extrusion.

INSTRUMENTATION:
A Stryker Reflex anterior cervical plate (24mm length) was applied spanning C5 to C6. Fixed-angle screws (14mm x 4.0mm) were placed in C5 and C6, two screws per level. Locking mechanism engaged. Final fluoroscopy confirmed excellent hardware position, alignment, and graft seating.

IONM: SSEPs and MEPs stable throughout.

CLOSURE:
Hemostasis obtained. No drain placed. The platysma was repaired with 3-0 Vicryl. Subcuticular 4-0 Monocryl. Steri-strips and sterile dressing applied.

EBL: 25 mL. Patient to recovery in stable condition.`,

    enhancedCPT: [
      { code: "22551", status: "supported", description: "Anterior cervical fusion", rvu: 24.83 },
      { code: "63075", status: "supported", description: "Anterior cervical discectomy", rvu: 17.74 },
      { code: "22853", status: "supported", description: "Interbody biomechanical device", rvu: 6.86 },
      { code: "22845", status: "supported", description: "Anterior instrumentation", rvu: 7.06 },
    ],
  },

  {
    id: "tlif-combined-steps",
    title: "TLIF — Combined Steps Lose Codes",
    procedureType: "PLF / PLIF / TLIF",
    difficulty: "advanced",
    description: "A TLIF note where running steps together in narrative form causes loss of separate fusion and instrumentation codes.",

    originalNote: `PREOPERATIVE DIAGNOSIS: L4-5 spondylolisthesis with stenosis
POSTOPERATIVE DIAGNOSIS: Same
PROCEDURE: L4-5 TLIF

The patient was positioned prone. Midline incision, exposure of L4-5. Laminectomy performed L4-5. Pedicle screws placed at L4 and L5 bilaterally. The disc space was entered from the left side, discectomy performed, and a cage was placed with bone graft. Rods were placed and compressed. Posterolateral fusion was performed with bone graft. Wound closed.`,

    annotations: [
      { text: "Laminectomy performed L4-5", type: "missing", message: "No laterality, no facetectomy/foraminotomy documented. Loses 63047." },
      { text: "Pedicle screws placed at L4 and L5 bilaterally", type: "missing", message: "No screw sizes, no technique (freehand/navigated/fluoroscopic), no manufacturer. Loses detail needed for 22842." },
      { text: "a cage was placed with bone graft", type: "missing", message: "What cage? Size? Type? What bone graft — autograft, allograft, DBM? Separate incision for harvest? This single sentence tries to cover 3 separate billable procedures." },
      { text: "Posterolateral fusion was performed with bone graft", type: "missing", message: "Which transverse processes were decorticated? What graft type? This loses the separate PLF code (22612) due to insufficient documentation." },
    ],

    targetCPT: [
      { code: "22633", status: "gap", description: "TLIF including discectomy (combined code)", rvu: 30.73, reason: "Steps combined in narrative, insufficient detail for combined code" },
      { code: "63047", status: "gap", description: "Laminectomy+facetectomy+foraminotomy", rvu: 17.46, reason: "Facetectomy/foraminotomy not documented" },
      { code: "22842", status: "partial", description: "Posterior segmental instrumentation", rvu: 12.82, reason: "Screws placed but no detail" },
      { code: "22612", status: "gap", description: "Posterolateral fusion", rvu: 22.39, reason: "Vague — no decortication or graft bed prep" },
      { code: "20930", status: "gap", description: "Allograft for spine surgery", rvu: 0, reason: "Graft type not specified" },
    ],

    pitfalls: [
      "Running all steps into a single narrative paragraph — each billable component needs its own documentation block",
      "Using combined TLIF code (22633) requires EXPLICIT documentation of discectomy, interbody device, AND fusion — all as distinct steps",
      "Missing screw sizes and technique loses instrumentation detail",
      "Saying 'bone graft' without specifying auto vs allo, morselized vs structural, and harvest technique",
      "No separate section for posterolateral fusion — decortication of transverse processes must be described",
    ],

    enhancedNote: `PREOPERATIVE DIAGNOSIS: L4-5 grade 1 spondylolisthesis with bilateral L5 radiculopathy and central stenosis (M43.16)
POSTOPERATIVE DIAGNOSIS: Same
PROCEDURE: L4-5 TLIF with posterior segmental instrumentation, posterolateral fusion, and interbody cage placement

POSITIONING & PREP:
The patient was placed prone on the Jackson table. Prepped, draped, timeout performed. Ancef 2g IV. IONM with SSEPs, MEPs, and free-run EMG initiated with stable baseline.

EXPOSURE:
Midline incision from L3 to S1 spinous processes. Lumbodorsal fascia incised. Subperiosteal dissection bilaterally exposed the L4 and L5 laminae, facets, and transverse processes. L4-5 confirmed with fluoroscopy.

DECOMPRESSION (63047):
Laminectomy was performed at L4-5 using high-speed burr and Leksell rongeurs. The hypertrophied ligamentum flavum was excised bilaterally with Kerrison rongeurs. Bilateral medial facetectomies were performed. Bilateral foraminotomies at L4-5 confirmed free L5 nerve roots.

INSTRUMENTATION (22842):
Pedicle screws placed bilaterally at L4 and L5 using the freehand technique with triggered EMG confirmation (all thresholds >8mA):
- L4 left: 6.5 x 45mm
- L4 right: 6.5 x 45mm
- L5 left: 7.0 x 45mm
- L5 right: 7.0 x 45mm
All NuVasive Reline screws. 5.5mm titanium rods contoured and placed bilaterally. Set screws applied finger-tight.

INTERBODY FUSION — TLIF (22633):
The left L4-5 facet joint was completely removed to create the TLIF corridor. The L4-5 disc space was entered. Complete discectomy was performed with pituitary rongeurs and endplate shavers. The contralateral annulus was released. Sequential trials performed. A 10mm x 26mm PEEK interbody cage (NuVasive Modulus TLIF) packed with local autograft mixed with 5cc DBM putty was inserted obliquely and confirmed in excellent position on fluoroscopy.

POSTEROLATERAL FUSION (22612):
The L4 and L5 transverse processes were decorticated bilaterally with a high-speed burr. A fusion bed was prepared. Morselized local autograft supplemented with 10cc corticocancellous allograft chips was laid in the posterolateral gutters bilaterally from L4 to L5.

BONE GRAFT (20930):
Structural allograft bone was used for the interbody space. Local autograft from the laminectomy and morselized allograft was used for posterolateral fusion. No separate iliac crest harvest required.

COMPRESSION & FINAL:
Final compression applied across the pedicle screws bilaterally to restore lordosis. Set screws locked. Final fluoroscopy confirmed excellent hardware position, cage placement, and restoration of disc height and lordosis.

IONM: All signals stable throughout. No alerts.

CLOSURE:
Copious irrigation with antibiotic saline. Subfascial drain placed. Fascia closed with #1 Vicryl Plus. Subcutaneous 2-0 Vicryl. Skin staples. Sterile dressing.

EBL: 250 mL. Patient to PACU in stable condition.`,

    enhancedCPT: [
      { code: "22633", status: "supported", description: "TLIF including discectomy", rvu: 30.73 },
      { code: "63047", status: "supported", description: "Laminectomy+facetectomy+foraminotomy", rvu: 17.46 },
      { code: "22842", status: "supported", description: "Posterior segmental instrumentation", rvu: 12.82 },
      { code: "22612", status: "supported", description: "Posterolateral fusion", rvu: 22.39 },
      { code: "20930", status: "supported", description: "Allograft for spine surgery", rvu: 0 },
    ],
  },

  {
    id: "sacral-fracture-missing-s2ai",
    title: "Sacral Fracture — Missing S2AI Code",
    procedureType: "Sacral Fracture Fixation",
    difficulty: "intermediate",
    description: "A trauma case where S2AI screw documentation is insufficient to capture the pelvic fixation add-on code 22848.",

    originalNote: `PREOPERATIVE DIAGNOSIS: S1 sacral fracture with spinopelvic dissociation
POSTOPERATIVE DIAGNOSIS: Same
PROCEDURE: L4-S1 posterior instrumentation and fusion, S2AI screws

The patient was placed prone. Posterior midline incision from L3 to the sacrum. L4, L5, S1 pedicle screws placed bilaterally. S2AI screws placed bilaterally. Rods placed. Fracture was reduced. Posterolateral fusion with allograft from L4 to S1. Wound closed.`,

    annotations: [
      { text: "S2AI screws placed bilaterally", type: "missing", message: "CRITICAL: S2AI screws require documentation of the specific technique — starting point on the sacrum, trajectory (toward the ilium), screw length and diameter, fluoroscopic confirmation in the ilium. Without this, 22848 (pelvic fixation add-on, 7.88 RVU) is lost." },
      { text: "Fracture was reduced", type: "missing", message: "How? Manual reduction? Distraction? Compression? What was the pre/post alignment? This is critical for fracture treatment codes." },
      { text: "L4, L5, S1 pedicle screws placed bilaterally", type: "weak", message: "No sizes, no technique, no EMG thresholds. Loses detail needed for accurate instrumentation coding." },
    ],

    targetCPT: [
      { code: "22842", status: "partial", description: "Posterior segmental instrumentation, 3+ levels", rvu: 12.82, reason: "Screws documented but no detail" },
      { code: "22848", status: "gap", description: "Pelvic fixation (S2AI/iliac)", rvu: 7.88, reason: "S2AI technique not documented" },
      { code: "22612", status: "partial", description: "Posterior fusion L4-S1", rvu: 22.39, reason: "Minimal fusion detail" },
      { code: "22614", status: "gap", description: "Each additional fusion level", rvu: 5.29, reason: "Multi-level fusion not documented per level" },
    ],

    pitfalls: [
      "Mentioning 'S2AI screws' without describing the technique — the code requires iliac fixation documentation",
      "Not documenting fracture reduction technique or alignment assessment",
      "Missing per-level documentation for multi-level fusion add-on codes",
      "No IONM documentation for a trauma case involving the sacrum and nerve roots",
    ],

    enhancedNote: `PREOPERATIVE DIAGNOSIS: Unstable S1 sacral fracture with spinopelvic dissociation (S32.10xA)
POSTOPERATIVE DIAGNOSIS: Same
PROCEDURE: L4-S1 posterior spinal fusion (22612 + 22614x2), posterior segmental instrumentation L4-S1 (22842), bilateral S2-alar-iliac (S2AI) pelvic fixation (22848), open treatment sacral fracture (27218)

POSITIONING & PREP:
The patient was placed prone on the Jackson table. Prepped and draped in the usual fashion. Timeout performed. Ancef 2g IV. IONM initiated with baseline SSEPs, MEPs, and EMG.

EXPOSURE:
Midline posterior incision from L3 to the sacrum. Subperiosteal dissection exposed the posterior elements of L4, L5, and S1 bilaterally, including the sacral ala and S1/S2 junction.

INSTRUMENTATION (22842):
Pedicle screws placed bilaterally using freehand technique with triggered EMG:
- L4: 6.5 x 45mm bilateral (all thresholds >10mA)
- L5: 7.0 x 50mm bilateral (all thresholds >8mA)
- S1: 7.5 x 35mm bilateral (bicortical purchase confirmed on fluoroscopy)
All DePuy Expedium screws.

S2AI PELVIC FIXATION (22848):
The S2AI starting point was identified at the junction of the S1-S2 lateral sacral crest and the inferior S1 articular process bilaterally. A high-speed burr was used to create the starting hole. A gearshift probe was directed laterally and inferiorly toward the ilium, between the inner and outer tables of the ilium. Trajectory was confirmed with fluoroscopic guidance in both AP and lateral views, with the screw tip terminating above the sciatic notch.
- Right S2AI: 8.5 x 80mm
- Left S2AI: 8.5 x 80mm
Excellent purchase in both ilia confirmed. Triggered EMG thresholds >20mA bilaterally.

5.5mm cobalt-chrome rods were contoured and placed bilaterally from L4 to ilium. Set screws applied.

FRACTURE REDUCTION:
The S1 sacral fracture was reduced using sequential compression across the L5-S1 and S1-iliac constructs. AP and lateral fluoroscopy confirmed restoration of sacral alignment with reduction of the kyphotic deformity at the fracture site. Pelvic inlet and outlet views confirmed acceptable reduction.

POSTEROLATERAL FUSION (22612 + 22614x2):
The L4, L5, and S1 transverse processes and sacral ala were decorticated with a high-speed burr. At each level (L4-5, L5-S1, and across the sacral fracture), morselized corticocancellous allograft mixed with local autograft was placed in the posterolateral gutters bilaterally.

BONE GRAFT (20930): 30cc corticocancellous allograft chips supplemented by local autograft from the decompression. No separate iliac crest harvest.

IONM: SSEPs, MEPs, and EMG stable throughout. No alerts. All triggered EMG thresholds >8mA.

CLOSURE:
Copious irrigation. Subfascial drain. #1 Vicryl Plus fascia, 2-0 Vicryl subcutaneous, skin staples. Sterile dressing.

EBL: 400 mL. Patient transferred to ICU in stable condition.`,

    enhancedCPT: [
      { code: "22842", status: "supported", description: "Posterior segmental instrumentation", rvu: 12.82 },
      { code: "22848", status: "supported", description: "Pelvic fixation (S2AI)", rvu: 7.88 },
      { code: "22612", status: "supported", description: "Posterior fusion L4-S1", rvu: 22.39 },
      { code: "22614", status: "supported", description: "Add'l fusion level x2", rvu: 5.29 },
      { code: "20930", status: "supported", description: "Allograft", rvu: 0 },
    ],
  },
];

export default TRAINING_EXAMPLES;

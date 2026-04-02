import { useState, useEffect, useRef, useCallback } from "react";

/*
 ═══════════════════════════════════════════════════════════════
  COMPLETE ORTHO-SPINE CPT LIBRARY
 ═══════════════════════════════════════════════════════════════
*/
const CPT = {
"Posterior Decompression":[
{c:"63001",d:"Laminectomy w/o facetectomy, cervical, 1 seg",v:18.55,k:["laminectomy","cervical","decompression"],r:"Segment level, bone removal extent, neural elements, laterality"},
{c:"63003",d:"Laminectomy w/o facetectomy, thoracic, 1 seg",v:17.12,k:["laminectomy","thoracic"],r:"Thoracic level, lamina removal"},
{c:"63005",d:"Laminectomy w/o facetectomy, lumbar, 1 seg",v:15.6,k:["laminectomy","lumbar","decompression"],r:"Segment, bilateral/unilateral, neural decompression"},
{c:"63011",d:"Laminectomy w/ decompression, sacral",v:16.8,k:["laminectomy","sacral"],r:"Sacral level decompression"},
{c:"63012",d:"Laminectomy w/ removal abnormal facets, lumbar",v:19.5,k:["laminectomy","facetectomy","lumbar"],r:"Facet removal, resection degree"},
{c:"63015",d:"Laminectomy w/ facetectomy, cervical, 1 seg",v:22.1,k:["laminectomy","facetectomy","cervical"],r:"Facet removal, foraminotomy extent"},
{c:"63016",d:"Laminectomy w/ facetectomy, thoracic, 1 seg",v:21.3,k:["laminectomy","facetectomy","thoracic"],r:"Thoracic facetectomy"},
{c:"63017",d:"Laminectomy w/ facetectomy, lumbar, 1 seg",v:18.9,k:["laminectomy","facetectomy","lumbar"],r:"Facet resection extent, segment, laterality"},
{c:"63020",d:"Laminotomy, cervical, 1 interspace",v:16.2,k:["laminotomy","cervical","hemilaminotomy"],r:"Interspace, side, bone removal extent"},
{c:"63030",d:"Laminotomy (microdiscectomy), lumbar, 1 interspace",v:13.18,k:["laminotomy","lumbar","microdiscectomy","discectomy","disc herniation"],r:"Interspace, discectomy details, nerve root"},
{c:"63035",d:"Laminotomy, each add'l interspace ⊕",v:4.47,k:["additional","laminotomy"],r:"Primary code + specify add'l level",a:1},
{c:"63040",d:"Laminotomy reexploration, cervical",v:17.5,k:["revision","reexploration","cervical"],r:"Prior surgery, scar, indication"},
{c:"63042",d:"Laminotomy reexploration, lumbar",v:15.42,k:["revision","reexploration","lumbar","redo","recurrent"],r:"Prior surgery date, recurrence, fibrosis"},
{c:"63044",d:"Each add'l reexploration level ⊕",v:4.9,k:["additional","revision"],r:"Additional revision level",a:1},
{c:"63045",d:"Laminectomy+facetectomy+foraminotomy, cervical, 1 seg",v:20.5,k:["laminectomy","facetectomy","foraminotomy","cervical"],r:"All 3 components separately documented"},
{c:"63046",d:"Laminectomy+facetectomy+foraminotomy, thoracic, 1 seg",v:20.1,k:["laminectomy","facetectomy","foraminotomy","thoracic"],r:"Thoracic level, extent"},
{c:"63047",d:"Laminectomy+facetectomy+foraminotomy, lumbar, 1 seg",v:17.46,k:["laminectomy","facetectomy","foraminotomy","lumbar","stenosis"],r:"CRITICAL: facetectomy + foraminotomy + lamina removal as SEPARATE steps"},
{c:"63048",d:"Each add'l segment ⊕ (to 63045-63047)",v:4.6,k:["additional","segment","decompression"],r:"Each add'l segment individually",a:1},
{c:"63056",d:"Transpedicular decompression, thoracic",v:25.0,k:["transpedicular","thoracic"],r:"Transpedicular approach, segment"},
],
"Posterior / Posterolateral Fusion":[
{c:"22600",d:"Arthrodesis, posterior/posterolateral, cervical",v:22.87,k:["fusion","posterolateral","cervical","arthrodesis"],r:"Fusion bed prep, graft material, segments"},
{c:"22610",d:"Arthrodesis, posterior/posterolateral, thoracic",v:21.5,k:["fusion","posterolateral","thoracic"],r:"Thoracic fusion technique, graft"},
{c:"22612",d:"Arthrodesis, posterolateral, lumbar, single",v:24.56,k:["fusion","posterolateral","lumbar","PLF"],r:"TP decortication, graft bed, graft type"},
{c:"22614",d:"Each add'l vertebral segment ⊕",v:5.77,k:["additional","fusion","posterolateral"],r:"Each add'l fusion level",a:1},
{c:"22630",d:"Posterior interbody fusion (PLIF/TLIF), lumbar, single",v:24.8,k:["PLIF","TLIF","posterior interbody","transforaminal","interbody"],r:"Disc space prep, endplate prep, device, graft"},
{c:"22632",d:"Each add'l interbody interspace ⊕",v:6.1,k:["additional","PLIF","TLIF","interbody"],r:"Additional PLIF/TLIF level",a:1},
{c:"22633",d:"Combined interbody + posterolateral, lumbar, single",v:28.6,k:["combined","360","circumferential","TLIF","posterolateral"],r:"BOTH interbody AND posterolateral as SEPARATE procedures"},
{c:"22634",d:"Each add'l combined level ⊕",v:7.2,k:["additional","combined","360"],r:"Additional combined fusion level",a:1},
],
"Anterior Fusion":[
{c:"22551",d:"Anterior interbody arthrodesis, cervical below C2",v:26.12,k:["ACDF","anterior","cervical","fusion","interbody"],r:"Level, discectomy, endplate prep, graft/cage, plate"},
{c:"22552",d:"Each add'l cervical interspace ⊕",v:6.44,k:["additional","ACDF","cervical"],r:"Each add'l ACDF level",a:1},
{c:"22554",d:"Anterior interbody arthrodesis, lumbar, single",v:28.5,k:["ALIF","anterior","lumbar","interbody"],r:"Approach, disc removal, endplate prep, device"},
{c:"22556",d:"Anterior interbody arthrodesis, thoracic, single",v:27.8,k:["anterior","thoracic","interbody"],r:"Thoracic anterior approach and fusion"},
{c:"22558",d:"Each add'l thoracic/lumbar interspace ⊕",v:6.8,k:["additional","anterior","ALIF"],r:"Additional anterior fusion level",a:1},
],
"Lateral Interbody Fusion":[
{c:"22857",d:"Lateral interbody (LLIF/XLIF/DLIF/OLIF), single",v:28.0,k:["lateral","LLIF","XLIF","DLIF","OLIF","transpsoas"],r:"Lateral approach, psoas, discectomy, cage"},
{c:"22858",d:"Each add'l lateral interbody level ⊕",v:7.5,k:["additional","lateral","LLIF","XLIF"],r:"Additional lateral level",a:1},
{c:"22853",d:"Interbody device, anterior approach ⊕",v:5.44,k:["cage","interbody","device","anterior","PEEK"],r:"Device type, size, fill material",a:1},
{c:"22854",d:"Interbody device, lateral approach ⊕",v:5.8,k:["cage","interbody","device","lateral"],r:"Lateral interbody device details",a:1},
{c:"22859",d:"Interbody device w/ discectomy, lateral ⊕",v:6.5,k:["cage","lateral","discectomy"],r:"Lateral discectomy and device",a:1},
],
"Instrumentation":[
{c:"22840",d:"Posterior non-segmental instrumentation (Harrington)",v:13.37,k:["non-segmental","rod","hook","Harrington"],r:"Non-segmental construct type"},
{c:"22841",d:"Internal fixation by wiring of spinous processes",v:10.5,k:["wiring","spinous process"],r:"Wiring technique"},
{c:"22842",d:"Posterior segmental instrumentation, 3–6 segments",v:18.58,k:["pedicle screw","segmental","instrumentation","screws","rods"],r:"EACH screw (level+side), rods, set screws, cross-link"},
{c:"22843",d:"Posterior segmental instrumentation, 7–12 segments",v:22.5,k:["pedicle screw","long construct","7-12"],r:"All screw positions, rod contouring"},
{c:"22844",d:"Posterior segmental instrumentation, 13+ segments",v:26.0,k:["pedicle screw","13+","scoliosis"],r:"All levels of instrumentation"},
{c:"22845",d:"Anterior instrumentation, 2–3 segments",v:16.12,k:["anterior","plate","cervical plate"],r:"Plate type, screws, segments spanned"},
{c:"22846",d:"Anterior instrumentation, 4–7 segments",v:19.5,k:["anterior","instrumentation","long plate"],r:"Long construct details"},
{c:"22847",d:"Anterior instrumentation, 8+ segments",v:22.0,k:["anterior","instrumentation","8+"],r:"Extensive anterior instrumentation"},
{c:"22848",d:"Pelvic fixation (S2AI / iliac screws) ⊕",v:7.88,k:["pelvic","S2AI","iliac","sacropelvic"],r:"Screw type, trajectory, bilateral/unilateral",a:1},
{c:"22849",d:"Reinsertion of spinal fixation device ⊕",v:8.0,k:["reinsertion","revision","fixation"],r:"Prior hardware, reason",a:1},
{c:"22850",d:"Removal posterior nonsegmental instrumentation",v:11.2,k:["removal","hardware","nonsegmental"],r:"Hardware removed"},
{c:"22852",d:"Removal posterior segmental instrumentation",v:14.5,k:["removal","hardware","segmental"],r:"All hardware removed by level"},
{c:"22855",d:"Removal anterior instrumentation",v:13.0,k:["removal","anterior","hardware","plate"],r:"Anterior hardware removed"},
],
"Bone Graft":[
{c:"20930",d:"Allograft, morselized ⊕",v:0,k:["allograft","morselized","DBM"],r:"Allograft type (DBM, cancellous, etc.)",a:1},
{c:"20931",d:"Allograft, structural ⊕",v:0,k:["allograft","structural","femoral ring"],r:"Structural allograft type, placement",a:1},
{c:"20936",d:"Autograft, structural, separate incision ⊕",v:5.57,k:["autograft","structural","iliac crest","ICBG","separate incision"],r:"Harvest site, separate incision, structural nature",a:1},
{c:"20937",d:"Autograft, morselized, separate incision ⊕",v:4.42,k:["autograft","morselized","separate incision","ICBG"],r:"Harvest site, separate incision",a:1},
{c:"20938",d:"Autograft, structural, same incision ⊕",v:3.52,k:["autograft","structural","local","same incision"],r:"Local bone harvest, structural use",a:1},
{c:"20939",d:"Bone marrow aspiration for graft ⊕",v:2.8,k:["bone marrow","aspirate","BMA"],r:"Aspiration site and technique",a:1},
],
"Osteotomy":[
{c:"22206",d:"3-column osteotomy (PSO), thoracic",v:38.0,k:["osteotomy","3-column","PSO","pedicle subtraction","thoracic"],r:"3-column type, level, correction degree"},
{c:"22207",d:"3-column osteotomy (PSO), lumbar",v:40.0,k:["osteotomy","3-column","PSO","pedicle subtraction","lumbar"],r:"PSO level, correction, blood loss"},
{c:"22210",d:"Posterior osteotomy, cervical, single",v:28.0,k:["osteotomy","posterior","cervical","SPO"],r:"SPO details"},
{c:"22212",d:"Posterior osteotomy (Ponte/SPO), thoracic",v:26.0,k:["osteotomy","Ponte","SPO","thoracic"],r:"Ponte/SPO details"},
{c:"22214",d:"Posterior osteotomy (Ponte/SPO), lumbar",v:27.5,k:["osteotomy","posterior","lumbar","SPO","Ponte"],r:"Osteotomy type, level, correction"},
{c:"22216",d:"Each add'l osteotomy segment ⊕",v:6.0,k:["additional","osteotomy"],r:"Each add'l osteotomy level",a:1},
{c:"22220",d:"Anterior osteotomy, cervical",v:30.0,k:["osteotomy","anterior","cervical"],r:"Anterior osteotomy details"},
{c:"22222",d:"Anterior osteotomy, thoracic",v:32.0,k:["osteotomy","anterior","thoracic"],r:"Thoracic anterior osteotomy"},
{c:"22224",d:"Anterior osteotomy, lumbar",v:31.0,k:["osteotomy","anterior","lumbar"],r:"Lumbar anterior osteotomy"},
{c:"22226",d:"Each add'l anterior osteotomy ⊕",v:5.0,k:["additional","osteotomy","anterior"],r:"Additional anterior osteotomy level",a:1},
],
"Corpectomy":[
{c:"63081",d:"Corpectomy, anterior, cervical, single",v:30.5,k:["corpectomy","anterior","cervical","vertebrectomy"],r:"Body removal extent, decompression, reconstruction"},
{c:"63082",d:"Each add'l cervical corpectomy ⊕",v:7.5,k:["additional","corpectomy","cervical"],r:"Additional corpectomy level",a:1},
{c:"63085",d:"Corpectomy, anterolateral, thoracic",v:35.0,k:["corpectomy","thoracic","anterolateral"],r:"Thoracic approach and extent"},
{c:"63086",d:"Each add'l thoracic corpectomy ⊕",v:7.0,k:["additional","corpectomy","thoracic"],r:"Additional thoracic level",a:1},
{c:"63087",d:"Corpectomy, anterolateral, lumbar",v:33.0,k:["corpectomy","lumbar","anterolateral"],r:"Lumbar corpectomy details"},
{c:"63088",d:"Each add'l lumbar corpectomy ⊕",v:7.0,k:["additional","corpectomy","lumbar"],r:"Additional lumbar level",a:1},
{c:"63090",d:"Corpectomy, posterolateral, thoracic",v:36.0,k:["corpectomy","posterolateral","thoracic","costotransversectomy"],r:"Posterolateral approach, rib resection"},
{c:"63091",d:"Corpectomy, posterolateral, lumbar",v:34.0,k:["corpectomy","posterolateral","lumbar"],r:"Posterolateral approach"},
{c:"63101",d:"Corpectomy, lateral extracavitary, thoracic",v:38.0,k:["corpectomy","lateral extracavitary","thoracic"],r:"Lateral extracavitary approach"},
{c:"63102",d:"Corpectomy, lateral extracavitary, lumbar",v:36.0,k:["corpectomy","lateral extracavitary","lumbar"],r:"Lateral extracavitary approach"},
],
"Anterior Cervical":[
{c:"63075",d:"Discectomy, anterior, cervical, single interspace",v:18.5,k:["discectomy","anterior","cervical","ACDF"],r:"Interspace, disc removal, decompression"},
{c:"63076",d:"Each add'l cervical discectomy ⊕",v:5.0,k:["additional","discectomy","cervical"],r:"Additional discectomy level",a:1},
],
"Kyphoplasty / Vertebroplasty":[
{c:"22510",d:"Vertebroplasty, cervicothoracic",v:10.2,k:["vertebroplasty","cement","cervicothoracic"],r:"Level, fluoroscopy, cement volume"},
{c:"22511",d:"Vertebroplasty, lumbosacral",v:9.8,k:["vertebroplasty","lumbar","sacral","cement"],r:"Level, approach, cement volume"},
{c:"22512",d:"Each add'l vertebroplasty level ⊕",v:4.5,k:["additional","vertebroplasty"],r:"Additional level",a:1},
{c:"22513",d:"Kyphoplasty, thoracic, single",v:12.5,k:["kyphoplasty","balloon","thoracic"],r:"Balloon inflation, cavity, cement fill"},
{c:"22514",d:"Kyphoplasty, lumbar, single",v:12.0,k:["kyphoplasty","balloon","lumbar"],r:"Balloon kyphoplasty technique"},
{c:"22515",d:"Each add'l kyphoplasty level ⊕",v:5.0,k:["additional","kyphoplasty"],r:"Additional kyphoplasty level",a:1},
],
"Disc Replacement":[
{c:"22856",d:"Total disc arthroplasty, cervical, single",v:28.0,k:["disc replacement","arthroplasty","cervical","ADR","TDR"],r:"Disc removal, endplate prep, device, motion check"},
{c:"0095T",d:"Each add'l cervical disc arthroplasty ⊕",v:7.0,k:["additional","disc replacement","cervical"],r:"Additional cervical ADR level",a:1},
{c:"22857a",d:"Total disc arthroplasty, lumbar, single",v:30.0,k:["disc replacement","arthroplasty","lumbar","ADR","TDR"],r:"Lumbar disc replacement details"},
{c:"0163T",d:"Each add'l lumbar disc arthroplasty ⊕",v:8.0,k:["additional","disc replacement","lumbar"],r:"Additional lumbar ADR level",a:1},
{c:"22861",d:"Revision disc arthroplasty, cervical",v:32.0,k:["revision","disc replacement","cervical"],r:"Revision indication, device exchange"},
{c:"22862",d:"Removal disc arthroplasty, cervical",v:28.0,k:["removal","disc replacement","cervical"],r:"Removal indication, conversion"},
{c:"22864",d:"Removal disc arthroplasty, lumbar",v:34.0,k:["removal","disc replacement","lumbar"],r:"Removal indication"},
{c:"22865",d:"Removal+reinsertion disc arthroplasty, lumbar",v:38.0,k:["removal","reinsertion","disc replacement","lumbar"],r:"Removal + new device"},
],
"Fracture / Dislocation":[
{c:"22310",d:"Closed treatment vertebral fracture, no manipulation",v:3.5,k:["fracture","closed treatment","compression"],r:"Fracture level, type, plan"},
{c:"22315",d:"Closed treatment vertebral fracture, w/ manipulation",v:8.0,k:["fracture","closed","manipulation","reduction"],r:"Level, manipulation, reduction"},
{c:"22318",d:"Open treatment, posterior, single",v:22.0,k:["fracture","open treatment","posterior","ORIF"],r:"Fracture level, reduction, fixation"},
{c:"22319",d:"Each add'l open fracture segment ⊕",v:5.5,k:["additional","fracture","open treatment"],r:"Additional fracture level",a:1},
{c:"22325",d:"Open treatment, anterior, single",v:28.0,k:["fracture","open treatment","anterior"],r:"Anterior approach, reduction, reconstruction"},
{c:"22326",d:"Each add'l anterior fracture segment ⊕",v:6.0,k:["additional","fracture","anterior"],r:"Additional anterior fracture level",a:1},
{c:"22327",d:"Open treatment, posterolateral, single",v:26.0,k:["fracture","posterolateral"],r:"Posterolateral fracture treatment"},
{c:"22328",d:"Each add'l posterolateral fracture ⊕",v:5.0,k:["additional","fracture","posterolateral"],r:"Additional level",a:1},
],
"Spinal Tumor":[
{c:"63265",d:"Excision intraspinal lesion, extradural, cervical",v:25.0,k:["tumor","excision","extradural","cervical"],r:"Tumor type, location, margins"},
{c:"63266",d:"Excision intraspinal lesion, extradural, thoracic",v:24.0,k:["tumor","excision","extradural","thoracic"],r:"Tumor resection details"},
{c:"63267",d:"Excision intraspinal lesion, extradural, lumbar",v:22.0,k:["tumor","excision","extradural","lumbar"],r:"Tumor resection details"},
{c:"63270",d:"Excision intraspinal lesion, intradural, cervical",v:30.0,k:["tumor","intradural","cervical"],r:"Dural opening, tumor type, neural management"},
{c:"63271",d:"Excision intraspinal lesion, intradural, thoracic",v:28.0,k:["tumor","intradural","thoracic"],r:"Intradural tumor details"},
{c:"63272",d:"Excision intraspinal lesion, intradural, lumbar",v:26.0,k:["tumor","intradural","lumbar"],r:"Intradural tumor details"},
{c:"63290",d:"Vertebral column resection (VCR)",v:50.0,k:["VCR","vertebral column resection","en bloc"],r:"VCR approach, reconstruction, margins"},
],
"Deformity":[
{c:"22800",d:"Posterior fusion for deformity, ≤6 segments",v:28.0,k:["deformity","scoliosis","kyphosis","fusion"],r:"Deformity type, correction, levels, graft"},
{c:"22802",d:"Posterior fusion for deformity, 7–12 segments",v:35.0,k:["deformity","scoliosis","7-12"],r:"All levels documented"},
{c:"22804",d:"Posterior fusion for deformity, 13+ segments",v:42.0,k:["deformity","scoliosis","13+"],r:"Comprehensive deformity correction"},
{c:"22808",d:"Anterior fusion for deformity, 2–3 segments",v:30.0,k:["deformity","anterior","2-3"],r:"Anterior deformity approach"},
{c:"22810",d:"Anterior fusion for deformity, 4–7 segments",v:36.0,k:["deformity","anterior","4-7"],r:"Anterior deformity fusion"},
{c:"22812",d:"Anterior fusion for deformity, 8+ segments",v:40.0,k:["deformity","anterior","8+"],r:"Extensive anterior deformity fusion"},
],
"SI Joint / Pelvis":[
{c:"27279",d:"SI joint fusion, percutaneous / MIS",v:12.5,k:["SI joint","sacroiliac","percutaneous"],r:"SI approach, device, imaging"},
{c:"27280",d:"SI joint fusion, open",v:18.0,k:["SI joint","sacroiliac","open"],r:"Open SI approach, graft, fixation"},
],
"Wound / Revision":[
{c:"22010",d:"I&D deep abscess, cervical/thoracic",v:15.0,k:["drainage","abscess","infection","washout"],r:"Abscess location, culture, irrigation"},
{c:"22015",d:"I&D deep abscess, lumbar",v:14.5,k:["drainage","abscess","infection","lumbar"],r:"Abscess details, washout"},
{c:"22830",d:"Exploration of spinal fusion",v:10.5,k:["exploration","pseudarthrosis","nonunion"],r:"Fusion mass assessment, pseudarthrosis"},
],
"Neuromonitoring / Misc":[
{c:"95940",d:"IONM by physician, each 15 min ⊕",v:3.0,k:["neuromonitoring","IONM","SSEP","MEP","EMG"],r:"Monitoring modalities, interpretation",a:1},
{c:"20660",d:"Application of cranial tongs / halo",v:4.5,k:["halo","tongs","traction"],r:"Device type, weight"},
{c:"20661",d:"Application of halo vest",v:6.0,k:["halo","vest"],r:"Halo application technique"},
{c:"62380",d:"Endoscopic decompression / laminotomy",v:14.0,k:["endoscopic","decompression"],r:"Endoscopic technique"},
],
};

const totalCodeCount = Object.values(CPT).flat().length;

// ═══════════════════════════════════════════════════════════════
// PRE-LOADED SURGEON TRAINING PROFILES (from case series analysis)
// ═══════════════════════════════════════════════════════════════
const SURGEON_PROFILES = {
  ludwig: {
    name: "Dr. Ludwig",
    focus: "Orthopaedic spine / Trauma spine — sacral fractures, lumbopelvic fixation, decompression",
    trainingCases: 12,
    stylePatterns: [
      "Dictates in flowing narrative paragraphs — NO section headers within procedure description",
      "Uses 'Following this,' as primary transition between operative steps",
      "Uses 'It was of note that' to describe intraoperative findings",
      "Passive voice throughout: 'was performed', 'was placed', 'were obtained'",
      "Standard closing: 'Please note, final needle and sponge counts were deemed to be correct. I was present for the entirety of the case.'",
      "Positioning: 'The patient was flipped prone, prepped and draped in the usual sterile fashion for posterior approach to the [region] spine.'",
      "Antibiotics: 'Ancef was provided prior to surgical incision'",
      "DVT: 'Sequential TED compression boots placed for DVT prophylaxis'",
      "Timeout: 'A timeout procedure was performed'",
      "Risk consent uses 'including, but not excluding' (NOT 'but not limited to')",
      "Closes wounds: '#1 Vicryl Plus suture, followed by 2-0 Vicryl Plus suture, followed by wound was stapled shut'",
      "For MIS: documents 'Screw extensions were removed' after rod placement",
      "Fluoroscopy: 'Fluoroscopy revealed colinear placement of pedicle screws with pedicles' (spells 'colinear' not 'collinear')",
      "Pelvic screw views: 'inlet, outlet, and teardrop view'",
      "Bone removal: 'thinned with a rongeur followed by high-speed cutting and diamond bur'",
      "Epidural entry: 'Entrance into the epidural canal was performed with angled curette'",
      "Decompression: 'central portion decompression was performed with 3 and 4 mm Kerrison rongeurs'",
      "Irrigation: 'wound was copiously irrigated out, soaked in Betadine solution'",
      "Reduction: 'Through a cantilever reduction maneuver'",
      "EMG: 'Triggered EMGs revealed excellent potentials'",
    ],
    terminology: [
      "Says 'rongeur' NOT 'pituitary forceps'",
      "Says 'high-speed cutting and diamond bur' NOT 'high-speed drill'",
      "Says 'angled curette' for epidural entry",
      "Says '3 and 4 mm Kerrison rongeurs' NOT 'Kerrison punches'",
      "Says 'Bovie electrocautery' NOT 'monopolar cautery'",
      "Says 'innies / innie caps' for MIS set screws",
      "Says 'Jamshidi needles' NOT 'trocar needles'",
      "Says 'K-wires' NOT 'guide wires'",
      "Says 'sacral ala' NOT 'sacral wings'",
      "Says 'pedicle vertebral body junction' for screw entry",
      "Says 'Cobb cup curettes' for fusion bed prep",
      "Says 'gearshift / gear shifter' NOT 'pedicle finder'",
      "Says 'teardrop view/window' for pelvic screw views",
      "Spells 'colinear' (not collinear/coaxial)",
      "Says 'Vicryl Plus suture' (always includes 'Plus')",
      "Says 'Betadine solution' NOT 'povidone-iodine'",
      "Says 'Hemovac drain (1/8-inch)' NOT 'Jackson-Pratt'",
      "Names cages by brand: 'Modulus TLIF'",
      "Abbreviates fracture as 'fx' occasionally in narrative",
      "Says 'S2AI pelvic screw' for sacropelvic fixation",
      "Says 'wedding band connector' NOT 'domino connector'",
      "Uses 'mL' for blood loss (not 'cc')",
    ],
    strengths: [
      "Consistently documents screw sizes (diameter x length) at each level",
      "Documents laterality (bilateral/right/left) for screws",
      "Names specific implant systems (NuVasive Reline L, DePuy Viper, Expedium)",
      "Documents fluoroscopic views used for confirmation",
      "Documents triggered EMG results",
      "Documents findings in detail (fracture patterns, nerve root status, hematoma)",
    ],
    weaknesses: [
      "Does NOT separate instrumentation/decompression/fusion into distinct paragraphs — runs them together in continuous narrative, making it harder for coders to identify distinct billable components",
      "IONM documentation inconsistent — sometimes only mentions triggered EMGs without confirming SSEPs/MEPs were monitored throughout",
      "Does not always document number of segments for instrumentation code selection (3-6 vs 7-12)",
      "Bone graft sourcing language could be more explicit about whether autograft was from laminectomy or separate incision",
      "Posterolateral fusion sometimes lacks explicit 'decortication of transverse processes' language",
      "Foraminotomy extent (bilateral vs unilateral, wide vs partial) inconsistently documented",
      "Does not document operative time",
    ],
    implantSystems: ["NuVasive Reline L (open)", "NuVasive Reline L MIS", "DePuy Viper", "DePuy Expedium", "SI Bone Bedrock (pelvic)"],
  },
  cavanaugh: {
    name: "Dr. Cavanaugh",
    focus: "Orthopaedic spine — complex fracture fixation, percutaneous instrumentation, deformity reduction",
    trainingCases: 1,
    stylePatterns: [
      "Uses STRUCTURED FORMATTING with explicit section headers: 'Operative Findings:', 'Implants:', 'Procedure:'",
      "Lists CPT codes directly in the procedure header (e.g., 'Open treatment of displaced sacral fracture (CPT 22325)')",
      "Lists implants with specific sizes in a structured table-like format within the note",
      "Active voice with 'I then...' as primary transition: 'I then used a gearshift...', 'I then inserted a K wire...'",
      "More detailed screw technique: Jamshidi needle → K-wire → fascial blade cutter → cannulated tap → screw sequence explicitly described",
      "Documents screw stimulation thresholds quantitatively: 'no screw stim less than 10 mA'",
      "Includes Post-operative Plan at end: 'Patient may weight-bear per the orthopedic trauma service'",
      "Includes VTE guidance: 'VTE prophylaxis: Recommend continued use of SCDs. Okay for chemoprophylaxis from a spine standpoint.'",
      "Uses 'good purchase' or 'excellent purchase' for fixation quality",
      "Rod placement: 'selected rods, appropriate alignment placed using screw cradles from cranial to caudal'",
      "Describes reduction in detail: 'I additionally performed compression on the left side to correct the coronal plane deformity'",
      "Closure: '#1 Vicryl. Subcutaneous tissue with 2-0 Vicryl and skin with staples and 2-0 nylon'",
    ],
    terminology: [
      "Says 'gearshift' for pedicle start point instrument",
      "Says 'start point (on the S2 promontory)' NOT 'entry point'",
      "Says 'fascial blade cutter' for MIS fascial incision",
      "Says 'cannulated tap' NOT 'pedicle tap'",
      "Says 'reduction towers' for fracture reduction instruments",
      "Says 'screw cradles' for rod introduction",
      "Says 'S2 alar screw' (equivalent to S2AI)",
      "Uses 'cc' for blood loss (NOT 'mL')",
      "Says 'gel positioning chest pads' for prone positioning",
      "Says 'OSI flat top table' NOT 'Jackson table'",
      "Says 'firm endpoint' for K-wire depth confirmation",
      "Uses 'Atec Invictus' implant system",
      "Uses 'vancomycin and tobramycin into the wound cavity' (tobramycin not typical for Ludwig)",
      "Documents two-physician consent when patient unable to consent",
    ],
    strengths: [
      "EXPLICITLY LISTS CPT CODES in operative header — extremely helpful for coders",
      "Lists ALL implants with sizes in structured format",
      "Documents triggered EMG thresholds numerically (>10mA, >15mA) — stronger than qualitative 'excellent potentials'",
      "Active voice ('I then...') makes it clear the surgeon performed each step",
      "Documents why screws were skipped (e.g., R S1 comminution)",
      "Includes post-op weight-bearing and VTE guidance in op note",
    ],
    weaknesses: [
      "Limited training data (1 case) — profile will improve with more notes",
      "IONM documentation could specify duration for 95940 billing",
      "Does not document operative time",
    ],
    implantSystems: ["Atec Invictus", "Alphatec"],
  },
};

// ═══ COLORS ═══
const X={bg:"#060911",s1:"#0b1120",s2:"#111a2f",s3:"#18243d",b1:"#1c2d50",b2:"#263d6a",
ac:"#38bdf8",acD:"#0c4a6e",g:"#4ade80",gD:"#052e16",gB:"#0d3320",gBr:"#166534",
y:"#fbbf24",yD:"#451a03",yB:"#422006",r:"#f87171",rD:"#450a0a",rB:"#3f1111",rBr:"#991b1b",
p:"#a78bfa",pD:"#3b0764",pB:"#2e1065",o:"#fb923c",oD:"#7c2d12",
t1:"#f1f5f9",t2:"#94a3b8",t3:"#64748b",t4:"#475569"};
const ft="'Outfit',system-ui,sans-serif";
const mn="'JetBrains Mono','SF Mono',monospace";

// ═══ Storage ═══
async function ld(k,fb){try{const r=await window.storage.get(k);return r?JSON.parse(r.value):fb}catch{return fb}}
async function sv(k,v){try{await window.storage.set(k,JSON.stringify(v))}catch(e){console.error(e)}}

// ═══ Build system prompt ═══

// Profile Synthesis Engine — distills all data into a tight, high-signal profile
function synthesizeProfile(training,savedCases,styleMem,editHist){
  const syn={
    totalCases:(training?.trainingCases||0)+(savedCases?.length||0),
    styleRules:[], termRules:[...(training?.terminology||[])],
    codeFrequency:{}, codeGaps:{},
    procedureMix:{},
    grades:{A:0,B:0,C:0,D:0,F:0},
    recurringWeaknesses:[...(training?.weaknesses||[])],
    strengths:[...(training?.strengths||[])],
    implants:new Set(training?.implantSystems||[]),
  };

  // Merge + deduplicate style observations (pre-trained + learned)
  const allStyleRaw=[...(training?.stylePatterns||[]),...(styleMem||[])];
  const styleMap=new Map();
  allStyleRaw.forEach(s=>{
    const norm=s.toLowerCase().replace(/[^a-z0-9\s]/g,"").trim();
    const key=norm.split(/\s+/).slice(0,6).join(" ");
    if(!styleMap.has(key))styleMap.set(key,{text:s,count:1});
    else styleMap.get(key).count++;
  });
  syn.styleRules=[...styleMap.values()].sort((a,b)=>b.count-a.count).map(s=>
    s.count>1?`${s.text} [seen ${s.count}×]`:s.text
  );

  // Process saved cases for CPT frequency, procedure mix, terminology, implants
  (savedCases||[]).forEach(tc=>{
    if(syn.grades[tc.grade]!==undefined)syn.grades[tc.grade]++;
    (tc.codes||[]).forEach(cd=>{
      const code=cd.code;
      if(!syn.codeFrequency[code])syn.codeFrequency[code]={times:0,totalQty:0,supported:0,partial:0,gap:0,desc:cd.desc||""};
      const cf=syn.codeFrequency[code];
      cf.times++;cf.totalQty+=(cd.qty||1);
      if(cd.status==="supported")cf.supported++;
      else if(cd.status==="partial")cf.partial++;
      else if(cd.status==="gap")cf.gap++;
    });
    const procs=(tc.procedures||tc.summary||"").toLowerCase();
    ["laminectomy","fusion","instrumentation","decompression","TLIF","PLIF","ACDF","corpectomy",
     "pelvic fixation","S2AI","osteotomy","kyphoplasty","vertebroplasty","fracture","disc replacement",
     "foraminotomy","facetectomy","interbody","posterolateral"].forEach(proc=>{
      if(procs.includes(proc.toLowerCase()))syn.procedureMix[proc]=(syn.procedureMix[proc]||0)+1;
    });
    const noteText=(tc.fullNote||tc.noteExcerpt||"").toLowerCase();
    ["nuvasive","reline","depuy","viper","expedium","medtronic","solera","atec","invictus","alphatec","stryker","globus","si bone","bedrock"]
      .forEach(sys=>{if(noteText.includes(sys))syn.implants.add(sys.split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "))});
    (tc.terminology||[]).forEach(t=>{
      const norm=t.toLowerCase();
      if(!syn.termRules.some(r=>r.toLowerCase().includes(norm.slice(0,20))))syn.termRules.push(t);
    });
  });

  // Identify commonly missed codes (gap rate > 40% across 2+ cases)
  Object.entries(syn.codeFrequency).forEach(([code,cf])=>{
    if(cf.times>=2&&(cf.partial+cf.gap)/cf.times>0.4)
      syn.codeGaps[code]={rate:Math.round((cf.partial+cf.gap)/cf.times*100),times:cf.times,desc:cf.desc};
  });

  // Identify recurring weaknesses from edit acceptance patterns
  const editTypes={};
  (editHist||[]).forEach(h=>{if(!editTypes[h.et])editTypes[h.et]={a:0,r:0};h.ok?editTypes[h.et].a++:editTypes[h.et].r++});
  Object.entries(editTypes).forEach(([type,{a,r}])=>{
    const total=a+r;
    if(total>=3&&a/total>0.7){
      if(!syn.recurringWeaknesses.some(w=>w.toLowerCase().includes(type)))
        syn.recurringWeaknesses.push(`Surgeon consistently needs "${type}" improvements (accepted ${Math.round(a/total*100)}% of ${total})`);
    }
  });

  syn.implants=[...syn.implants];
  return syn;
}

function buildPrompt(prof,styleMem,editPrefs,training,savedCases,editHist){
  // ─── SYNTHESIZE the full profile from all data sources ───
  const syn=synthesizeProfile(training,savedCases,styleMem,editHist);

  // Build top CPT codes summary (most frequently billed)
  const topCodes=Object.entries(syn.codeFrequency)
    .sort((a,b)=>b[1].times-a[1].times).slice(0,15)
    .map(([code,cf])=>`${code} (${cf.times}× — ${cf.supported} supported, ${cf.partial} partial, ${cf.gap} gap) ${cf.desc}`)
    .join("\n");

  // Build gap codes (commonly missed)
  const gapCodes=Object.entries(syn.codeGaps)
    .map(([code,g])=>`${code}: missed ${g.rate}% of ${g.times} cases — ${g.desc}`)
    .join("\n");

  // Build procedure mix
  const procMix=Object.entries(syn.procedureMix).sort((a,b)=>b[1]-a[1])
    .map(([proc,count])=>`${proc} (${count}×)`).join(", ");

  // Grade summary
  const gradeStr=Object.entries(syn.grades).filter(([,v])=>v>0).map(([g,v])=>`${v}×${g}`).join(", ");

return `You are an expert spine surgery CPT coding assistant with a DEEP PROFILE of this specific surgeon built from ${syn.totalCases} real operative notes.

SURGEON: ${prof.name||"Unknown"}
SUBSPECIALTY: ${prof.focus||"Ortho spine"}
IMPLANT SYSTEMS: ${syn.implants.length>0?syn.implants.join(", "):"Not yet identified"}

═══ SURGEON PROFILE (synthesized from ${syn.totalCases} cases) ═══

DOCUMENTATION GRADES: ${gradeStr||"No data yet"}
TYPICAL PROCEDURES: ${procMix||"Not enough data"}

${topCodes?`MOST FREQUENT CPT CODES (what this surgeon typically bills):
${topCodes}`:"No coding history yet."}

${gapCodes?`COMMONLY MISSED/UNDERDOCUMENTED CODES (focus here):
${gapCodes}
These codes are the highest-value targets — the surgeon performs these procedures but the documentation frequently falls short. PRIORITIZE edits that would capture these codes.`:""}

═══ WRITING STYLE (${syn.styleRules.length} patterns) ═══
${syn.styleRules.slice(0,25).map(s=>`• ${s}`).join("\n")||"No style data yet — observe and report patterns."}

═══ TERMINOLOGY (use these EXACT terms) ═══
${syn.termRules.slice(0,25).map(s=>`• ${s}`).join("\n")||"No terminology data yet — observe and report patterns."}

═══ DOCUMENTATION WEAKNESSES (${syn.recurringWeaknesses.length} known) ═══
${syn.recurringWeaknesses.map(s=>`• ${s}`).join("\n")||"No weaknesses identified yet."}

═══ EDIT PREFERENCES ═══
${editPrefs.length>0?editPrefs.map(p=>`• ${p}`).join("\n"):"No edit history yet."}

RULES:
1. NEVER suggest billing for unperformed procedures
2. PRESERVE this surgeon's EXACT voice — use THEIR terms, match THEIR style
3. FOCUS edits on COMMONLY MISSED CODES listed above — these are the highest-value fixes
4. Flag upcoding risks. Identify MISSED codes (undercoding).
5. Note NCCI bundling issues.
6. Match this surgeon's transition phrases, paragraph structure, and closing format.
7. If this surgeon has a history of billing a specific code (see frequency list), ensure it's captured when the procedure is performed again.

CRITICAL — RVU CALCULATION:
"original_rvu" = Codes the note ALREADY supports AS WRITTEN. This should almost NEVER be zero.
"enhanced_rvu" = ALL codes billable AFTER edits. Mark new codes "new":true.

IMPORTANT — ADD-ON CODE QUANTITIES: When an add-on code applies at MULTIPLE levels, include it MULTIPLE TIMES in the codes array — once per level.

Return ONLY valid JSON (NO markdown fences, NO preamble):
{
"summary":"Brief case summary",
"style_observations":["Only NEW patterns not already in the profile above — if you see something new about how this surgeon writes, report it"],
"terminology_observations":["Only NEW terms not already documented above"],
"original_rvu":{"codes":[{"code":"63047","rvu":17.46,"description":"..."}],"total":0.0},
"enhanced_rvu":{"codes":[{"code":"63047","rvu":17.46,"description":"...","new":false},{"code":"22848","rvu":7.88,"description":"...","new":true}],"total":0.0},
"identified_codes":[{"code":"XXXXX","description":"...","status":"supported|partial|gap","confidence":0.0,"suggested_improvement":"...","is_addon":false,"rvu":0.0,"qty":1}],
"bundling_warnings":["..."],
"missing_elements":["..."],
"overall_documentation_grade":"A|B|C|D|F",
"text_edits":[{"find":"EXACT text from note","replace":"improved text in surgeon's OWN voice","reason":"reference specific weakness or missed code being addressed","codes_supported":["XXXXX"],"edit_type":"specificity|laterality|keyword|completeness|necessity|terminology"}],
"missing_paragraphs":[{"insert_after":"EXACT text","new_text":"paragraph in this surgeon's voice","reason":"why — reference gap code if applicable","codes_supported":["XXXXX"]}],
"checklist":[{"item":"...","present":true,"note":"..."}]
}`;}

// ═══ EDIT BLOCK — the clear diff component ═══
function EditBlock({type,data,idx,active,onToggle,onAccept,onReject,isA,isR}){
  if(isR)return null;
  const isEdit=type==="edit";
  return (
    <div style={{margin:"8px 0",borderRadius:10,border:`1.5px solid ${isA?X.gBr:active?X.b2:X.b1}`,background:X.s1,overflow:"hidden",transition:"border-color .15s"}}>
      {/* Header */}
      <div onClick={onToggle} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",background:isA?X.gD:X.s2,cursor:"pointer",borderBottom:active?`1px solid ${X.b1}`:"none"}}>
        <div style={{width:22,height:22,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,fontFamily:mn,flexShrink:0,background:isEdit?X.acD:X.pD,color:isEdit?X.ac:X.p}}>
          {isEdit?"Δ":"+"}
        </div>
        <div style={{flex:1,fontSize:12,color:isA?X.g:X.t2,fontWeight:isA?600:400}}>{isA?"✓ Accepted":data.reason}</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {data.codes_supported?.map(co=><span key={co} style={{fontSize:9,padding:"2px 6px",borderRadius:4,background:X.acD,color:X.ac,fontFamily:mn,fontWeight:600}}>{co}</span>)}
          {data.edit_type&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:4,background:X.oD,color:X.o,fontWeight:700,textTransform:"uppercase"}}>{data.edit_type}</span>}
        </div>
        <span style={{fontSize:11,color:X.t4,transform:active?"rotate(180deg)":"none",transition:"transform .15s",marginLeft:4}}>▾</span>
      </div>

      {/* Diff body */}
      <div style={{padding:"12px 16px"}}>
        {isEdit&&(<>
          {/* REMOVED */}
          <div style={{display:"flex",alignItems:"flex-start",gap:0,marginBottom:8,borderRadius:7,background:isA?"transparent":X.rB,border:isA?"none":`1px solid ${X.rBr}40`,overflow:"hidden",opacity:isA?.35:1}}>
            <div style={{width:36,minHeight:"100%",background:isA?"transparent":X.rBr+"30",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,borderRight:isA?"none":`1px solid ${X.rBr}30`}}>
              <span style={{fontWeight:900,color:X.r,fontSize:16}}>−</span>
            </div>
            <div style={{padding:"8px 12px",fontFamily:mn,fontSize:13,lineHeight:1.8,color:X.r,textDecoration:"line-through",textDecorationThickness:"2px",textDecorationColor:"rgba(248,113,113,0.5)",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{data.find}</div>
          </div>
          {/* ADDED */}
          <div style={{display:"flex",alignItems:"flex-start",gap:0,borderRadius:7,background:X.gB,border:`1px solid ${X.gBr}40`,overflow:"hidden"}}>
            <div style={{width:36,minHeight:"100%",background:X.gBr+"30",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,borderRight:`1px solid ${X.gBr}30`}}>
              <span style={{fontWeight:900,color:X.g,fontSize:16}}>+</span>
            </div>
            <div style={{padding:"8px 12px",fontFamily:mn,fontSize:13,lineHeight:1.8,color:X.g,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{data.replace}</div>
          </div>
        </>)}
        {!isEdit&&(
          <div style={{display:"flex",alignItems:"flex-start",gap:0,borderRadius:7,background:X.pB+"20",border:`1px solid ${X.p}25`,overflow:"hidden"}}>
            <div style={{width:36,minHeight:"100%",background:X.pB+"30",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,borderRight:`1px solid ${X.p}20`}}>
              <span style={{fontWeight:900,color:X.p,fontSize:16}}>+</span>
            </div>
            <div style={{padding:"8px 12px",fontFamily:mn,fontSize:13,lineHeight:1.8,color:X.p,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{data.new_text}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      {active&&!isA&&!isR&&(
        <div style={{padding:"0 16px 12px",display:"flex",gap:8}}>
          <button onClick={e=>{e.stopPropagation();onAccept()}} style={{padding:"6px 20px",borderRadius:6,border:"none",background:X.g,color:X.bg,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ft}}>Accept</button>
          <button onClick={e=>{e.stopPropagation();onReject()}} style={{padding:"6px 20px",borderRadius:6,border:`1px solid ${X.b2}`,background:"transparent",color:X.t3,fontSize:12,cursor:"pointer",fontFamily:ft}}>Reject</button>
        </div>
      )}
    </div>
  );
}

// ═══ MAIN ═══
export default function App(){
  const[tab,setTab]=useState("analyze");
  const[opNote,setOpNote]=useState("");
  const[analysis,setAnalysis]=useState(null);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState(null);
  const[libSearch,setLibSearch]=useState("");
  const[xCat,setXCat]=useState(null);
  const[activeEdit,setActiveEdit]=useState(null);
  const[accepted,setAccepted]=useState(new Set());
  const[rejected,setRejected]=useState(new Set());
  const[rTab,setRTab]=useState("edits");
  const[rate,setRate]=useState(33.89);
  const[confirmStep,setConfirmStep]=useState(false);
  const[surgeon,setSurgeon]=useState("ludwig");
  const[prof,setProf]=useState({name:"",focus:""});
  const[styleMem,setStyleMem]=useState([]);
  const[editHist,setEditHist]=useState([]);
  const[editPrefs,setEditPrefs]=useState([]);
  const[cases,setCases]=useState(0);
  const[savedCases,setSavedCases]=useState([]); // training cases saved by user per surgeon
  const[customProfiles,setCustomProfiles]=useState([]); // [{id:"smith",name:"Dr. Smith"}]
  const[showNewProfile,setShowNewProfile]=useState(false);
  const[newName,setNewName]=useState("");
  const[newFocus,setNewFocus]=useState("");
  const[expandedCase,setExpandedCase]=useState(null); // for cases backlog
  const[caseFilter,setCaseFilter]=useState("all"); // all | A | B | C | D

  // ─── Job Queue ───
  const[jobs,setJobs]=useState([]);
  const[activeJobId,setActiveJobId]=useState(null);
  const jobIdRef=useRef(0);
  const[showQueue,setShowQueue]=useState(false);
  const[tick,setTick]=useState(0); // forces re-render for live timers

  // Live timer — tick every second while any job is running
  useEffect(()=>{
    const hasRunning=jobs.some(j=>j.status==="running");
    if(!hasRunning)return;
    const iv=setInterval(()=>setTick(t=>t+1),1000);
    return()=>clearInterval(iv);
  },[jobs]);

  const fmtTime=(ms)=>{
    if(!ms||ms<0)return"—";
    const s=Math.floor(ms/1000);
    if(s<60)return`${s}s`;
    const m=Math.floor(s/60);
    return`${m}m ${s%60}s`;
  };
  const fmtTimestamp=(ts)=>{
    if(!ts)return"";
    const d=new Date(ts);
    return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"});
  };

  const sk=(key)=>`${surgeon}-${key}`;
  const getTraining=()=>SURGEON_PROFILES[surgeon]||null;

  // All available surgeons: built-in + custom
  const allSurgeons=()=>{
    const list=Object.entries(SURGEON_PROFILES).map(([key,sp])=>({id:key,name:sp.name,builtin:true}));
    customProfiles.forEach(cp=>list.push({id:cp.id,name:cp.name,builtin:false}));
    return list;
  };

  useEffect(()=>{(async()=>{
    const cp=await ld("custom-profiles",[]);setCustomProfiles(cp);
    const s=await ld("active-surgeon","ludwig");setSurgeon(s);
    const training=SURGEON_PROFILES[s];
    const p=await ld(`${s}-prof`,training?{name:training.name,focus:training.focus}:{name:"",focus:""});
    setProf(p);
    setStyleMem(await ld(`${s}-styl`,[]));
    const eh=await ld(`${s}-ehist`,[]);setEditHist(eh);setEditPrefs(derivePrefs(eh));
    setCases(await ld(`${s}-cases`,0));setRate(await ld("rate",33.89));
    setSavedCases(await ld(`${s}-tcases`,[]));
  })()},[]);

  const switchSurgeon=async(s)=>{
    setSurgeon(s);await sv("active-surgeon",s);
    const training=SURGEON_PROFILES[s];
    const p=await ld(`${s}-prof`,training?{name:training.name,focus:training.focus}:{name:"",focus:""});
    setProf(p);
    setStyleMem(await ld(`${s}-styl`,[]));
    const eh=await ld(`${s}-ehist`,[]);setEditHist(eh);setEditPrefs(derivePrefs(eh));
    setCases(await ld(`${s}-cases`,0));
    setSavedCases(await ld(`${s}-tcases`,[]));
    setAnalysis(null);setAccepted(new Set());setRejected(new Set());
  };

  const createProfile=async()=>{
    if(!newName.trim())return;
    const id=newName.trim().toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-");
    // Check for duplicates
    if(SURGEON_PROFILES[id]||customProfiles.some(cp=>cp.id===id)){
      alert("A profile with that name already exists.");return;
    }
    const entry={id,name:newName.trim()};
    const updated=[...customProfiles,entry];
    setCustomProfiles(updated);
    await sv("custom-profiles",updated);
    // Save initial profile data
    await sv(`${id}-prof`,{name:newName.trim(),focus:newFocus.trim()});
    // Switch to it
    setNewName("");setNewFocus("");setShowNewProfile(false);
    await switchSurgeon(id);
    setTab("profile");
  };

  const deleteProfile=async(id)=>{
    if(!confirm(`Delete profile "${customProfiles.find(c=>c.id===id)?.name}"? This removes all learned data.`))return;
    const updated=customProfiles.filter(cp=>cp.id!==id);
    setCustomProfiles(updated);
    await sv("custom-profiles",updated);
    // Clean up stored data
    try{await window.storage.delete(`${id}-prof`)}catch{}
    try{await window.storage.delete(`${id}-styl`)}catch{}
    try{await window.storage.delete(`${id}-ehist`)}catch{}
    try{await window.storage.delete(`${id}-cases`)}catch{}
    try{await window.storage.delete(`${id}-tcases`)}catch{}
    // Switch to ludwig if we deleted the active surgeon
    if(surgeon===id)await switchSurgeon("ludwig");
  };

  function derivePrefs(h){
    if(!h||h.length<3)return[];const p=[];const t={};
    h.forEach(x=>{if(!t[x.et])t[x.et]={a:0,r:0};x.ok?t[x.et].a++:t[x.et].r++});
    Object.entries(t).forEach(([k,{a,r}])=>{const pct=a/(a+r);
      if(pct<.25)p.push(`Surgeon REJECTS most "${k}" edits — avoid.`);
      else if(pct>.8)p.push(`Surgeon ACCEPTS most "${k}" edits — prioritize.`);
      else p.push(`Surgeon accepts ~${Math.round(pct*100)}% of "${k}" edits.`);
    });return p;
  }

  const logEdit=async(et,ok)=>{const u=[...editHist,{et,ok,ts:Date.now()}].slice(-300);setEditHist(u);setEditPrefs(derivePrefs(u));await sv(sk("ehist"),u)};

  // Smart style saving — deduplicate by similarity before storing
  const saveStyle=async obs=>{
    if(!obs||obs.length===0)return;
    const existing=[...styleMem];
    const newObs=[];
    obs.forEach(o=>{
      const norm=o.toLowerCase().replace(/[^a-z0-9\s]/g,"").trim();
      if(norm.length<10)return; // skip garbage
      // Check if we already have something similar (>60% word overlap)
      const normWords=new Set(norm.split(/\s+/));
      const isDupe=existing.some(e=>{
        const eNorm=e.toLowerCase().replace(/[^a-z0-9\s]/g,"").trim();
        const eWords=new Set(eNorm.split(/\s+/));
        const overlap=[...normWords].filter(w=>eWords.has(w)).length;
        return overlap/Math.max(normWords.size,eWords.size)>0.6;
      });
      if(!isDupe){newObs.push(o);existing.push(o)}
    });
    if(newObs.length>0){
      const u=[...styleMem,...newObs].slice(-60);
      setStyleMem(u);await sv(sk("styl"),u);
    }
  };

  // Pre-filter CPT codes relevant to the note to keep prompt small
  const filterRelevantCodes=(note)=>{
    const lower=note.toLowerCase();
    const relevant={};
    // Always include these broad categories if any keyword hits
    Object.entries(CPT).forEach(([cat,codes])=>{
      const hits=codes.filter(co=>co.k.some(kw=>lower.includes(kw.toLowerCase())));
      // Also include the full category if >30% of codes match (the surgery touches this area)
      if(hits.length>0||cat.toLowerCase().split(/\s+/).some(w=>lower.includes(w))){
        relevant[cat]=codes; // send full category so add-ons are included
      }
    });
    // Always include bone graft, instrumentation, and neuromonitoring (commonly missed)
    ["Bone Graft","Instrumentation","Neuromonitoring / Misc"].forEach(cat=>{if(CPT[cat])relevant[cat]=CPT[cat]});
    return relevant;
  };

  // Strip HPI/hospital course — only send the procedure note
  const extractProcedureNote=(note)=>{
    // Try to find the procedure description section
    const markers=["DESCRIPTION OF PROCEDURE","PROCEDURE IN DETAIL","OPERATIVE NOTE","PROCEDURE:","TECHNIQUE:"];
    const endMarkers=["HPI:","HOSPITAL COURSE:","Hospital Course:","HISTORY OF PRESENT","REASONS FOR ADMISSION","Reasons for Admission"];
    let text=note;
    // Find start of procedure
    for(const m of markers){
      const idx=note.toUpperCase().indexOf(m.toUpperCase());
      if(idx!==-1){text=note.slice(idx);break}
    }
    // Trim off HPI/hospital course if appended
    for(const m of endMarkers){
      const idx=text.indexOf(m);
      if(idx>100){text=text.slice(0,idx).trim();break}  // >100 to not clip if marker is near the top
    }
    return text;
  };

  // ─── Job Queue System ───
  const updateJob=(id,updates)=>setJobs(prev=>prev.map(j=>j.id===id?{...j,...updates}:j));

  const loadJob=(id)=>{
    const job=jobs.find(j=>j.id===id);
    if(!job)return;
    setActiveJobId(id);
    setOpNote(job.opNote);
    if(job.status==="done"){
      setAnalysis(job.analysis);setAccepted(new Set(job.accepted||[]));setRejected(new Set(job.rejected||[]));
      setError(null);setLoading(false);setRTab("edits");setActiveEdit(null);
    }else if(job.status==="error"){
      setAnalysis(null);setError(job.error);setLoading(false);
    }else if(job.status==="running"){
      setAnalysis(null);setError(null);setLoading(true);
    }
    setTab("analyze");setConfirmStep(false);
  };

  const removeJob=(id)=>{
    setJobs(prev=>prev.filter(j=>j.id!==id));
    if(activeJobId===id){setActiveJobId(null);setAnalysis(null);setLoading(false);setError(null)}
  };

  // Step 1: User clicks "Analyze" → show confirmation
  const requestAnalysis=()=>{
    if(!opNote.trim())return;
    setError(null);
    setConfirmStep(true);
  };

  // Step 2: User confirms → create job, fire API in background, let user queue more
  const analyze=async()=>{
    const id=++jobIdRef.current;
    const noteText=opNote;
    const noteDx=noteText.slice(0,80).replace(/\n/g," ").trim();
    const surgeonId=surgeon;
    const surgeonName=prof.name||"Unknown";
    const profSnap={...prof};
    const styleSnap=[...styleMem];
    const prefsSnap=[...editPrefs];
    const trainingSnap=getTraining();
    const casesSnap=[...savedCases];
    const editHistSnap=[...editHist];

    // Create job entry
    const newJob={id,opNote:noteText,noteSnippet:noteDx,surgeonId,surgeonName,status:"running",analysis:null,error:null,startTime:Date.now(),endTime:null,accepted:[],rejected:[]};
    setJobs(prev=>[newJob,...prev]);
    setActiveJobId(id);

    // Reset UI for this job
    setConfirmStep(false);setLoading(true);setError(null);setAnalysis(null);
    setAccepted(new Set());setRejected(new Set());setActiveEdit(null);setRTab("edits");

    try{
      const relevantCPT=filterRelevantCodes(noteText);
      const ctx=Object.entries(relevantCPT).map(([cat,codes])=>`## ${cat}\n${codes.map(co=>`${co.c}: ${co.d} (${co.v} RVU)${co.a?" [ADD-ON]":""} | ${co.r}`).join("\n")}`).join("\n\n");

      const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:8192,
          system:buildPrompt(profSnap,styleSnap,prefsSnap,trainingSnap,casesSnap,editHistSnap)+"\n\nRELEVANT CPT CODES:\n"+ctx,
          messages:[{role:"user",content:`Analyze this spine operative note. Focus on the DESCRIPTION OF PROCEDURE section for coding. The full note header (diagnoses, procedures listed, findings) provides context. Return ONLY valid JSON — no markdown fences, no preamble text.\n\n---\n${noteText}\n---`}]})});

      if(!res.ok){
        const errorText=await res.text().catch(()=>"Unknown error");
        const errMsg=`API returned HTTP ${res.status}. ${res.status===429?"Rate limited — wait and retry.":res.status===401?"Authentication error.":"Check console."}`;
        updateJob(id,{status:"error",error:errMsg,endTime:Date.now()});
        setJobs(prev=>{const j=prev.find(x=>x.id===id);if(activeJobId===id){setError(errMsg);setLoading(false)}return prev});
        return;
      }

      const contentType=res.headers.get("content-type")||"";
      if(!contentType.includes("json")){
        await res.text().catch(()=>"");
        const errMsg=`Server returned ${contentType||"unknown"} instead of JSON — try again.`;
        updateJob(id,{status:"error",error:errMsg,endTime:Date.now()});
        if(activeJobId===id){setError(errMsg);setLoading(false)}
        return;
      }

      const data=await res.json();
      if(data.error){
        const errMsg=`API error: ${data.error.message||JSON.stringify(data.error)}`;
        updateJob(id,{status:"error",error:errMsg,endTime:Date.now()});
        if(activeJobId===id){setError(errMsg);setLoading(false)}
        return;
      }
      if(!data.content||data.content.length===0){
        const errMsg="Empty response — try shorter note.";
        updateJob(id,{status:"error",error:errMsg,endTime:Date.now()});
        if(activeJobId===id){setError(errMsg);setLoading(false)}
        return;
      }

      const txt=data.content.map(i=>i.text||"").join("")||"";
      let cleanTxt=txt.replace(/```json|```/g,"").trim();
      if(data.stop_reason==="max_tokens"||(data.stop_reason==="end_turn"&&!cleanTxt.endsWith("}"))){
        let opens=0,closeBrackets=0;
        for(const ch of cleanTxt){if(ch==="{")opens++;if(ch==="}")opens--;if(ch==="[")closeBrackets++;if(ch==="]")closeBrackets--}
        cleanTxt=cleanTxt.replace(/,\s*$/,"");
        while(closeBrackets>0){cleanTxt+="]";closeBrackets--}
        while(opens>0){cleanTxt+="}";opens--}
      }

      let parsed;
      try{parsed=JSON.parse(cleanTxt)}catch(parseErr){
        const errMsg="Response wasn't valid JSON — try shorter note.";
        updateJob(id,{status:"error",error:errMsg,endTime:Date.now()});
        if(activeJobId===id){setError(errMsg);setLoading(false)}
        return;
      }

      // Job complete!
      updateJob(id,{status:"done",analysis:parsed,endTime:Date.now()});

      // If this is still the active job, show results
      setJobs(prev=>{
        if(activeJobId===id){setAnalysis(parsed);setLoading(false);setError(null)}
        return prev;
      });

      // Save style learnings (always, regardless of active job)
      const obs=[...(parsed.style_observations||[]),...(parsed.terminology_observations||[])];
      if(obs.length>0)saveStyle(obs);
      const n=cases+1;setCases(n);await sv(sk("cases"),n);
    }catch(e){
      const errMsg=e.message?.includes("Failed to fetch")?"Network error — check connection.":`Failed: ${e.message}`;
      updateJob(id,{status:"error",error:errMsg,endTime:Date.now()});
      if(activeJobId===id){setError(errMsg);setLoading(false)}
    }
  };

  // Start a new note while jobs are running
  const newNote=()=>{
    setActiveJobId(null);setAnalysis(null);setLoading(false);setError(null);
    setAccepted(new Set());setRejected(new Set());setOpNote("");setConfirmStep(false);
  };

  // ─── Training Case Management ───
  const saveToTraining=async()=>{
    if(!analysis||!opNote.trim())return;
    const codes=analysis.identified_codes||[];
    const tc={
      id:Date.now(),
      date:new Date().toISOString().split("T")[0],
      surgeonId:surgeon,
      surgeonName:prof.name||"Unknown",
      dx:(()=>{
        const m=opNote.match(/(?:PREOPERATIVE DIAGNOS[IE]S?|DIAGNOSIS|POSTOPERATIVE DIAGNOS[IE]S?):\s*\n?(.*?)(?:\n\n|\n[A-Z])/is);
        return m?m[1].trim().slice(0,150):(analysis.summary||"").slice(0,150);
      })(),
      summary:analysis.summary||"",
      procedures:(()=>{
        const m=opNote.match(/(?:PROCEDURE[S]? PERFORMED|OPERATIVE PROCEDURE|PROCEDURE):\s*\n?(.*?)(?:\n\n|\n[A-Z])/is);
        return m?m[1].trim().slice(0,300):"";
      })(),
      codes:codes.map(c=>({code:c.code,status:c.status,qty:c.qty||1,rvu:c.rvu||0,desc:c.description?.slice(0,80)||""})),
      grade:analysis.overall_documentation_grade||"?",
      style:analysis.style_observations||[],
      terminology:analysis.terminology_observations||[],
      noteExcerpt:(()=>{
        const markers=["DESCRIPTION OF PROCEDURE","PROCEDURE IN DETAIL","PROCEDURE:"];
        for(const m of markers){const idx=opNote.toUpperCase().indexOf(m);if(idx!==-1)return opNote.slice(idx,idx+600)}
        return opNote.slice(0,600);
      })(),
      fullNote:opNote, // store full note for backlog review
      analysisSnapshot:{ // store key analysis fields for backlog
        identified_codes:analysis.identified_codes||[],
        bundling_warnings:analysis.bundling_warnings||[],
        missing_elements:analysis.missing_elements||[],
        text_edits:(analysis.text_edits||[]).length,
        missing_paragraphs:(analysis.missing_paragraphs||[]).length,
        original_rvu:analysis.original_rvu||{codes:[],total:0},
        enhanced_rvu:analysis.enhanced_rvu||{codes:[],total:0},
      },
      editsAccepted:accepted.size,
      editsRejected:rejected.size,
      totalEdits:(analysis.text_edits?.length||0)+(analysis.missing_paragraphs?.length||0),
    };
    const updated=[...savedCases,tc].slice(-50); // keep last 50 training cases per surgeon
    setSavedCases(updated);
    await sv(sk("tcases"),updated);
    if(activeJobId)setSavedJobIds(prev=>{const n=new Set(prev);n.add(activeJobId);return n});
  };

  const removeTrainingCase=async(id)=>{
    const updated=savedCases.filter(c=>c.id!==id);
    setSavedCases(updated);
    await sv(sk("tcases"),updated);
  };

  const[savedJobIds,setSavedJobIds]=useState(new Set());
  const isCaseSaved=()=>activeJobId&&savedJobIds.has(activeJobId);

  // Sync accept/reject to active job
  const syncJobEdits=(acc,rej)=>{
    if(activeJobId)updateJob(activeJobId,{accepted:[...acc],rejected:[...rej]});
  };

  const doAccept=idx=>{const a=new Set(accepted);a.add(idx);setAccepted(a);const r=new Set(rejected);r.delete(idx);setRejected(r);setActiveEdit(null);
    const ed=analysis?.text_edits||[];const item=idx<ed.length?ed[idx]:(analysis?.missing_paragraphs||[])[idx-ed.length];logEdit(item?.edit_type||"addition",true);syncJobEdits(a,r)};
  const doReject=idx=>{const r=new Set(rejected);r.add(idx);setRejected(r);const a=new Set(accepted);a.delete(idx);setAccepted(a);setActiveEdit(null);
    const ed=analysis?.text_edits||[];const item=idx<ed.length?ed[idx]:(analysis?.missing_paragraphs||[])[idx-ed.length];logEdit(item?.edit_type||"addition",false);syncJobEdits(a,r)};
  const doAcceptAll=()=>{const all=new Set();const ed=analysis?.text_edits||[];const ins=analysis?.missing_paragraphs||[];
    ed.forEach((_,i)=>all.add(i));ins.forEach((_,i)=>all.add(i+ed.length));setAccepted(all);setRejected(new Set());setActiveEdit(null);
    ed.forEach(e=>logEdit(e.edit_type||"edit",true));ins.forEach(()=>logEdit("addition",true));syncJobEdits(all,new Set())};

  const getFinal=()=>{let t=opNote;(analysis?.text_edits||[]).forEach((e,i)=>{if(accepted.has(i))t=t.replace(e.find,e.replace)});
    (analysis?.missing_paragraphs||[]).map((ins,i)=>({...ins,idx:i+(analysis?.text_edits?.length||0)}))
      .filter(ins=>accepted.has(ins.idx)).sort((a,b)=>t.indexOf(b.insert_after)-t.indexOf(a.insert_after))
      .forEach(ins=>{const p=t.indexOf(ins.insert_after);if(p!==-1){const end=p+ins.insert_after.length;t=t.slice(0,end)+"\n\n"+ins.new_text+t.slice(end)}});return t};

  const copy=s=>{try{navigator.clipboard?.writeText(s)}catch{}};
  // Client-side RVU computation with fallback
  // If the API returned 0 for original_rvu, compute from identified_codes
  const computeRVU=(analysis)=>{
    if(!analysis)return{oRVU:0,eRVU:0,oCodes:[],eCodes:[]};

    const rvuLookup={};
    Object.values(CPT).flat().forEach(co=>{rvuLookup[co.c]=co.v});

    let apiOrigTotal=analysis.original_rvu?.total||0;
    let apiEnhTotal=analysis.enhanced_rvu?.total||0;
    let oCodes=analysis.original_rvu?.codes||[];
    let eCodes=analysis.enhanced_rvu?.codes||[];

    // FALLBACK: if API returned 0 or empty, compute from identified_codes
    if(apiOrigTotal===0 && analysis.identified_codes?.length>0){
      const supported=analysis.identified_codes.filter(c=>c.status==="supported");
      oCodes=[];
      supported.forEach(c=>{
        const qty=c.qty||1;const rvu=rvuLookup[c.code]||c.rvu||0;
        for(let i=0;i<qty;i++)oCodes.push({code:c.code,rvu,description:c.description+(qty>1?` (#${i+1})`:"")});
      });
      apiOrigTotal=oCodes.reduce((sum,c)=>sum+c.rvu,0);
    }
    if(apiEnhTotal===0 && analysis.identified_codes?.length>0){
      const billable=analysis.identified_codes.filter(c=>c.status==="supported"||c.status==="partial"||(c.status==="gap"&&c.suggested_improvement));
      eCodes=[];
      billable.forEach(c=>{
        const qty=c.qty||1;const rvu=rvuLookup[c.code]||c.rvu||0;
        for(let i=0;i<qty;i++)eCodes.push({code:c.code,rvu,description:c.description+(qty>1?` (#${i+1})`:""),new:c.status!=="supported"});
      });
      apiEnhTotal=eCodes.reduce((sum,c)=>sum+c.rvu,0);
    }

    // Cross-check RVU amounts against our library
    const fixRVU=(codes)=>codes.map(c=>({...c,rvu:rvuLookup[c.code]!==undefined?rvuLookup[c.code]:(c.rvu||0)}));
    oCodes=fixRVU(oCodes);
    eCodes=fixRVU(eCodes);

    // Aggregate duplicate codes: group by code, sum qty, multiply RVU
    const aggregate=(codes)=>{
      const map={};
      codes.forEach(c=>{
        if(map[c.code]){
          map[c.code].qty+=1;
          map[c.code].totalRvu+=c.rvu;
          // If any instance is new, mark aggregated as new
          if(c.new)map[c.code].new=true;
        }else{
          map[c.code]={code:c.code,description:c.description,rvu:c.rvu,qty:1,totalRvu:c.rvu,new:!!c.new};
        }
      });
      return Object.values(map);
    };

    oCodes=aggregate(oCodes);
    eCodes=aggregate(eCodes);
    const oTotal=oCodes.reduce((s,c)=>s+c.totalRvu,0);
    const eTotal=eCodes.reduce((s,c)=>s+c.totalRvu,0);

    return{oRVU:oTotal,eRVU:Math.max(eTotal,oTotal),oCodes,eCodes};
  };

  const{oRVU,eRVU,oCodes,eCodes}=computeRVU(analysis);
  const delta=eRVU-oRVU;
  const nEdits=(analysis?.text_edits?.length||0)+(analysis?.missing_paragraphs?.length||0);

  const fLib=Object.entries(CPT).reduce((acc,[cat,codes])=>{if(!libSearch.trim()){acc[cat]=codes;return acc}
    const q=libSearch.toLowerCase();const f=codes.filter(co=>co.c.includes(q)||co.d.toLowerCase().includes(q)||co.k.some(k=>k.includes(q)));
    if(f.length)acc[cat]=f;return acc},{});

  return(
    <div style={{fontFamily:ft,background:X.bg,color:X.t1,minHeight:"100vh"}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <div style={{borderBottom:`1px solid ${X.b1}`,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",background:X.s1,position:"sticky",top:0,zIndex:50,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:6,background:`linear-gradient(135deg,${X.ac},${X.p})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:X.bg}}>S</div>
          <div>
            <div style={{fontWeight:700,fontSize:14}}>SpineCPT Pro</div>
            <div style={{fontSize:10,color:X.t4}}>
              {totalCodeCount} codes · {getTraining()?.trainingCases||0} training cases
              {cases>0&&` · ${cases} new`}
              {styleMem.length>0&&` · +${styleMem.length} learned`}
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {/* Surgeon Selector */}
          <div style={{display:"flex",gap:2,background:X.bg,borderRadius:6,padding:2,flexWrap:"wrap"}}>
            {allSurgeons().map(s=>(
              <button key={s.id} onClick={()=>switchSurgeon(s.id)} style={{
                padding:"5px 10px",borderRadius:4,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:ft,
                background:surgeon===s.id?`linear-gradient(135deg,${X.acD},${X.pD})`:X.s2,
                color:surgeon===s.id?X.ac:X.t3,transition:"all .15s",
              }}>{s.name.replace("Dr. ","")}{!s.builtin&&" *"}</button>
            ))}
            <button onClick={()=>setShowNewProfile(true)} style={{
              padding:"5px 10px",borderRadius:4,border:`1px dashed ${X.b2}`,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:ft,
              background:"transparent",color:X.t3,
            }}>+</button>
          </div>
          {/* Tab nav */}
          <div style={{display:"flex",gap:2,background:X.bg,borderRadius:6,padding:2}}>
            {["analyze","cases","library","profile","rules"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"5px 12px",borderRadius:4,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:ft,background:tab===t?X.s3:"transparent",color:tab===t?X.ac:X.t3,textTransform:"capitalize"}}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"16px 14px"}}>

        {/* ─── NEW PROFILE MODAL ─── */}
        {showNewProfile&&(
          <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
            onClick={()=>setShowNewProfile(false)}>
            <div onClick={e=>e.stopPropagation()} style={{background:X.s1,border:`1px solid ${X.b2}`,borderRadius:12,padding:24,maxWidth:440,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
              <div style={{fontSize:16,fontWeight:700,color:X.t1,marginBottom:4}}>Add New Surgeon</div>
              <div style={{fontSize:12,color:X.t3,marginBottom:16}}>Create a profile that learns from their op notes over time.</div>

              <label style={{fontSize:11,fontWeight:600,color:X.t2,display:"block",marginBottom:4}}>Surgeon Name *</label>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Dr. Lastname"
                autoFocus
                style={{width:"100%",padding:"10px 12px",borderRadius:6,background:X.s2,border:`1px solid ${X.b1}`,color:X.t1,fontSize:14,fontFamily:ft,outline:"none",boxSizing:"border-box",marginBottom:12}}
                onFocus={e=>e.target.style.borderColor=X.ac} onBlur={e=>e.target.style.borderColor=X.b1}
                onKeyDown={e=>{if(e.key==="Enter"&&newName.trim())createProfile()}}/>

              <label style={{fontSize:11,fontWeight:600,color:X.t2,display:"block",marginBottom:4}}>Subspecialty / Focus</label>
              <input value={newFocus} onChange={e=>setNewFocus(e.target.value)} placeholder="e.g., Degenerative lumbar, MIS, adult deformity, trauma..."
                style={{width:"100%",padding:"10px 12px",borderRadius:6,background:X.s2,border:`1px solid ${X.b1}`,color:X.t1,fontSize:13,fontFamily:ft,outline:"none",boxSizing:"border-box",marginBottom:16}}
                onFocus={e=>e.target.style.borderColor=X.ac} onBlur={e=>e.target.style.borderColor=X.b1}
                onKeyDown={e=>{if(e.key==="Enter"&&newName.trim())createProfile()}}/>

              <div style={{padding:12,borderRadius:7,background:X.s2,border:`1px solid ${X.b1}`,marginBottom:16}}>
                <div style={{fontSize:11,color:X.t3,lineHeight:1.5}}>
                  The system starts blank and auto-learns this surgeon's style, terminology, and documentation patterns from each op note analyzed. After 3–5 notes, suggestions will be personalized.
                </div>
              </div>

              <div style={{display:"flex",gap:8}}>
                <button onClick={createProfile} disabled={!newName.trim()} style={{
                  padding:"10px 24px",borderRadius:7,border:"none",cursor:newName.trim()?"pointer":"default",fontFamily:ft,
                  background:newName.trim()?`linear-gradient(135deg,${X.ac},${X.p})`:X.s3,
                  color:newName.trim()?X.bg:X.t4,fontWeight:700,fontSize:13,flex:1,
                }}>Create Profile</button>
                <button onClick={()=>{setShowNewProfile(false);setNewName("");setNewFocus("")}} style={{
                  padding:"10px 16px",borderRadius:7,border:`1px solid ${X.b2}`,background:"transparent",
                  color:X.t3,fontSize:12,cursor:"pointer",fontFamily:ft,
                }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ANALYZE */}
        {tab==="analyze"&&(<>
          {!analysis&&!loading&&!confirmStep&&(<div>
            <textarea value={opNote} onChange={e=>setOpNote(e.target.value)} placeholder="Paste operative note here..."
              style={{width:"100%",minHeight:300,padding:16,borderRadius:10,background:X.s2,border:`1px solid ${X.b1}`,color:X.t1,fontSize:13,fontFamily:mn,lineHeight:1.8,resize:"vertical",outline:"none",boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor=X.ac} onBlur={e=>e.target.style.borderColor=X.b1}/>
            <div style={{display:"flex",gap:10,marginTop:12,alignItems:"center",flexWrap:"wrap"}}>
              <button onClick={requestAnalysis} disabled={!opNote.trim()} style={{padding:"10px 28px",borderRadius:7,border:"none",cursor:opNote.trim()?"pointer":"default",background:opNote.trim()?`linear-gradient(135deg,${X.ac},${X.p})`:X.s3,color:opNote.trim()?X.bg:X.t4,fontWeight:700,fontSize:13,fontFamily:ft}}>Analyze & Optimize</button>
              {opNote.trim()&&<span style={{fontSize:11,color:X.t3}}>{opNote.split(/\s+/).filter(Boolean).length} words</span>}
              {opNote.trim()&&(opNote.includes("HPI")||opNote.includes("Hospital Course")||opNote.includes("HISTORY OF PRESENT"))&&(
                <span style={{fontSize:11,color:X.o,background:X.oD,padding:"2px 8px",borderRadius:4}}>HPI/Hospital Course detected — will auto-focus on procedure section</span>
              )}
              {!prof.name&&!opNote.trim()&&<span style={{fontSize:11,color:X.y}}>Select a surgeon above or create a new profile</span>}
              {prof.name&&!opNote.trim()&&<span style={{fontSize:11,color:X.t3}}>Analyzing as {prof.name}{getTraining()?` (${getTraining().trainingCases}-case trained)`:""}</span>}
            </div>
            {error&&<div style={{marginTop:12,padding:12,borderRadius:7,background:X.rB,border:`1px solid ${X.rBr}40`,color:X.r,fontSize:12,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{error}</div>}
          </div>)}

          {/* ─── ATTENDING CONFIRMATION STEP ─── */}
          {confirmStep&&!loading&&(<div>
            <div style={{padding:20,borderRadius:12,background:X.s1,border:`1.5px solid ${X.ac}40`,maxWidth:520,margin:"0 auto"}}>
              <div style={{fontSize:13,fontWeight:700,color:X.t1,marginBottom:12}}>Confirm Attending Surgeon</div>

              <div style={{display:"flex",alignItems:"center",gap:12,padding:14,borderRadius:8,background:X.s2,border:`1px solid ${X.b1}`,marginBottom:14}}>
                <div style={{width:40,height:40,borderRadius:8,background:`linear-gradient(135deg,${X.ac},${X.p})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18,color:X.bg,flexShrink:0}}>
                  {(prof.name||"?")[0].toUpperCase()}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:X.ac}}>{prof.name||"No surgeon selected"}</div>
                  <div style={{fontSize:11,color:X.t3}}>{prof.focus||"No subspecialty set"}</div>
                  {getTraining()&&(
                    <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:X.gD,color:X.g,fontWeight:600}}>Trained on {getTraining().trainingCases} cases</span>
                      <span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:X.pD,color:X.p,fontWeight:600}}>{getTraining().stylePatterns.length} style rules</span>
                      <span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:X.oD,color:X.o,fontWeight:600}}>{getTraining().terminology.length} terminology rules</span>
                      {styleMem.length>0&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:X.acD,color:X.ac}}>+{styleMem.length} learned</span>}
                    </div>
                  )}
                  {!getTraining()&&(
                    <div style={{fontSize:10,color:X.y,marginTop:4}}>No pre-trained profile — system will learn from this note</div>
                  )}
                </div>
              </div>

              {/* Quick surgeon switch */}
              <div style={{fontSize:10,color:X.t4,marginBottom:6}}>Wrong surgeon? Switch:</div>
              <div style={{display:"flex",gap:4,marginBottom:14,flexWrap:"wrap"}}>
                {allSurgeons().map(s=>(
                  <button key={s.id} onClick={()=>{switchSurgeon(s.id);}} style={{
                    padding:"5px 12px",borderRadius:5,border:surgeon===s.id?`1.5px solid ${X.ac}`:`1px solid ${X.b1}`,
                    background:surgeon===s.id?X.acD:X.s2,color:surgeon===s.id?X.ac:X.t3,
                    fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:ft,
                  }}>{s.name}</button>
                ))}
                <button onClick={()=>{setConfirmStep(false);setShowNewProfile(true)}} style={{
                  padding:"5px 12px",borderRadius:5,border:`1px dashed ${X.b2}`,
                  background:"transparent",color:X.t3,
                  fontSize:11,cursor:"pointer",fontFamily:ft,
                }}>+ New</button>
              </div>

              <div style={{display:"flex",gap:8}}>
                <button onClick={analyze} style={{
                  padding:"10px 28px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:ft,
                  background:`linear-gradient(135deg,${X.ac},${X.p})`,color:X.bg,fontWeight:700,fontSize:13,flex:1,
                }}>Confirm & Analyze as {prof.name?.split(" ").pop()||"Surgeon"}</button>
                <button onClick={()=>setConfirmStep(false)} style={{
                  padding:"10px 16px",borderRadius:7,border:`1px solid ${X.b2}`,background:"transparent",
                  color:X.t3,fontSize:12,cursor:"pointer",fontFamily:ft,
                }}>Back</button>
              </div>
            </div>
            <div style={{marginTop:12,padding:10,borderRadius:8,background:X.s2,border:`1px solid ${X.b1}`,maxWidth:520,margin:"12px auto 0"}}>
              <div style={{fontSize:10,color:X.t4,marginBottom:4}}>Op note preview ({opNote.split(/\s+/).filter(Boolean).length} words):</div>
              <div style={{fontSize:11,color:X.t3,maxHeight:80,overflowY:"auto",fontFamily:mn,lineHeight:1.5}}>{opNote.slice(0,400)}...</div>
            </div>
          </div>)}

          {loading&&(<div style={{padding:40,textAlign:"center"}}>
            <div style={{fontSize:15,color:X.ac,fontWeight:600}}>Analyzing for {prof.name||"surgeon"}...</div>
            <div style={{fontSize:12,color:X.t3,marginTop:6,maxWidth:500,margin:"6px auto 0",lineHeight:1.6}}>
              {getTraining()?`Using ${getTraining().trainingCases}-case training profile · ${getTraining().stylePatterns.length} style rules · ${getTraining().terminology.length} terminology rules · `:""}
              Pre-filtering CPT codes · computing RVU projections · generating inline edits{styleMem.length>0?` · +${styleMem.length} learned patterns`:""}
            </div>
            <div style={{marginTop:20,height:3,background:X.b1,borderRadius:2,overflow:"hidden",maxWidth:280,margin:"20px auto 0"}}>
              <div style={{height:"100%",background:`linear-gradient(90deg,${X.ac},${X.p})`,borderRadius:2,animation:"ld 2s ease infinite"}}/>
            </div>
            {/* Live timer */}
            {(()=>{const j=jobs.find(j=>j.id===activeJobId);return j?.startTime?(
              <div style={{fontSize:13,color:X.ac,marginTop:14,fontFamily:mn,fontWeight:600}}>{fmtTime(Date.now()-j.startTime)}</div>
            ):null})()}
            <div style={{marginTop:16}}>
              <button onClick={newNote} style={{padding:"8px 20px",borderRadius:6,border:`1px solid ${X.b2}`,background:X.s2,color:X.t2,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:ft}}>
                Queue Another Note
              </button>
              <div style={{fontSize:10,color:X.t4,marginTop:6}}>This analysis continues in the background</div>
            </div>
          </div>)}

          {analysis&&(<div>
            {/* RVU Comparison */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 50px 1fr",marginBottom:14,background:X.s1,borderRadius:10,border:`1px solid ${X.b1}`,overflow:"hidden"}}>
              <div style={{padding:"14px 16px"}}>
                <div style={{fontSize:10,fontWeight:700,color:X.t3,textTransform:"uppercase",letterSpacing:1}}>Current Note</div>
                <div style={{fontSize:28,fontWeight:800,color:X.t2,marginTop:4}}>{oRVU.toFixed(1)}<span style={{fontSize:11,fontWeight:400}}> wRVU</span></div>
                <div style={{fontSize:13,color:X.t3,fontWeight:600}}>${(oRVU*rate).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                <div style={{marginTop:6,display:"flex",gap:3,flexWrap:"wrap"}}>{oCodes.map((co,i)=><span key={i} style={{fontSize:9,padding:"2px 5px",borderRadius:3,background:X.s3,color:X.t3,fontFamily:mn}} title={co.description}>{co.code}{co.qty>1?` ×${co.qty}`:""}<span style={{color:X.t4,marginLeft:3}}>{co.totalRvu.toFixed(1)}</span></span>)}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",borderLeft:`1px solid ${X.b1}`,borderRight:`1px solid ${X.b1}`}}>
                <span style={{fontSize:22,color:delta>0?X.g:X.t4}}>→</span>
              </div>
              <div style={{padding:"14px 16px"}}>
                <div style={{fontSize:10,fontWeight:700,color:X.g,textTransform:"uppercase",letterSpacing:1}}>Optimized Note</div>
                <div style={{fontSize:28,fontWeight:800,color:X.g,marginTop:4}}>{eRVU.toFixed(1)}<span style={{fontSize:11,fontWeight:400}}> wRVU</span></div>
                <div style={{fontSize:13,color:X.g,fontWeight:600}}>${(eRVU*rate).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                {delta>0&&<div style={{fontSize:12,fontWeight:700,color:X.g,marginTop:2}}>+{delta.toFixed(1)} wRVU · +${(delta*rate).toLocaleString(undefined,{maximumFractionDigits:0})}</div>}
                <div style={{marginTop:6,display:"flex",gap:3,flexWrap:"wrap"}}>{eCodes.map((co,i)=><span key={i} style={{fontSize:9,padding:"2px 5px",borderRadius:3,background:co.new?X.gD:X.s3,color:co.new?X.g:X.t3,fontFamily:mn}} title={co.description}>{co.code}{co.qty>1?` ×${co.qty}`:""}{co.new?" ★":""}<span style={{color:co.new?X.g+"99":X.t4,marginLeft:3}}>{co.totalRvu.toFixed(1)}</span></span>)}</div>
              </div>
            </div>

            {/* Stats + rate */}
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{padding:"6px 14px",borderRadius:6,background:X.s2,border:`1px solid ${X.b1}`}}>
                <span style={{fontSize:10,color:X.t4,marginRight:6}}>Grade</span>
                <span style={{fontSize:18,fontWeight:800,color:analysis.overall_documentation_grade==="A"?X.g:analysis.overall_documentation_grade==="B"?X.ac:analysis.overall_documentation_grade==="C"?X.y:X.r}}>{analysis.overall_documentation_grade}</span>
              </div>
              <div style={{padding:"6px 14px",borderRadius:6,background:X.s2,border:`1px solid ${X.b1}`}}>
                <span style={{fontSize:10,color:X.t4,marginRight:6}}>Edits</span>
                <span style={{fontSize:16,fontWeight:700,color:X.p}}>{nEdits}</span>
              </div>
              <div style={{padding:"6px 14px",borderRadius:6,background:X.s2,border:`1px solid ${X.b1}`,display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:10,color:X.t4}}>$/RVU</span>
                <input type="number" value={rate} onChange={e=>{setRate(parseFloat(e.target.value)||0);sv("rate",parseFloat(e.target.value)||0)}}
                  style={{width:55,padding:"2px 6px",borderRadius:4,border:`1px solid ${X.b1}`,background:X.s3,color:X.t1,fontSize:12,fontFamily:mn,outline:"none"}}/>
              </div>
            </div>

            {/* Save to Training banner */}
            {analysis&&!isCaseSaved()&&(
              <div style={{padding:"10px 14px",borderRadius:8,background:`linear-gradient(135deg,${X.gD},${X.acD}40)`,border:`1px solid ${X.g}30`,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:X.g}}>Save this case to training?</div>
                  <div style={{fontSize:10,color:X.t3,marginTop:2}}>Improves future suggestions for {prof.name||"this surgeon"} — {savedCases.length} case{savedCases.length!==1?"s":""} saved so far</div>
                </div>
                <button onClick={async()=>{await saveToTraining()}} style={{
                  padding:"8px 20px",borderRadius:6,border:"none",cursor:"pointer",fontFamily:ft,
                  background:X.g,color:X.bg,fontWeight:700,fontSize:12,flexShrink:0,
                }}>Save to Training</button>
              </div>
            )}
            {analysis&&isCaseSaved()&&(
              <div style={{padding:"8px 14px",borderRadius:8,background:X.gD,border:`1px solid ${X.g}20`,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14,color:X.g}}>✓</span>
                <span style={{fontSize:12,color:X.g,fontWeight:600}}>Saved to training</span>
                <button onClick={()=>setTab("cases")} style={{padding:"3px 10px",borderRadius:4,border:`1px solid ${X.g}40`,background:"transparent",color:X.g,fontSize:10,cursor:"pointer",fontFamily:ft,marginLeft:8}}>View Cases</button>
              </div>
            )}

            {/* Sub-tabs */}
            <div style={{display:"flex",gap:2,marginBottom:12,background:X.s1,borderRadius:6,padding:2,width:"fit-content",flexWrap:"wrap",alignItems:"center"}}>
              {[{id:"edits",l:`Edits (${nEdits})`},{id:"codes",l:"Codes"},{id:"checklist",l:"Checklist"},{id:"final",l:"Final Note"}].map(t=>(
                <button key={t.id} onClick={()=>setRTab(t.id)} style={{padding:"5px 12px",borderRadius:4,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:ft,background:rTab===t.id?X.s3:"transparent",color:rTab===t.id?X.ac:X.t3}}>{t.l}</button>
              ))}
              <button onClick={newNote} style={{padding:"5px 12px",borderRadius:4,border:"none",cursor:"pointer",fontSize:11,fontFamily:ft,background:"transparent",color:X.t4}}>← New Note</button>
              {/* Save to Training */}
              {analysis&&!isCaseSaved()&&(
                <button onClick={async()=>{await saveToTraining();}} style={{padding:"5px 12px",borderRadius:4,border:`1px solid ${X.g}40`,background:X.gD,color:X.g,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:ft,marginLeft:4}}>
                  Save to Training ({savedCases.length})
                </button>
              )}
              {analysis&&isCaseSaved()&&(
                <span style={{fontSize:10,color:X.g,padding:"5px 8px",fontWeight:600}}>✓ Saved</span>
              )}
              {/* Elapsed time badge */}
              {(()=>{const j=jobs.find(j=>j.id===activeJobId);if(!j)return null;const elapsed=j.endTime?j.endTime-j.startTime:Date.now()-j.startTime;return(
                <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:X.s3,color:X.t3,fontFamily:mn,marginLeft:4}}>
                  {fmtTime(elapsed)}
                </span>
              )})()}
            </div>

            {/* EDITS */}
            {rTab==="edits"&&(<div>
              <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center",flexWrap:"wrap"}}>
                <button onClick={doAcceptAll} style={{padding:"5px 14px",borderRadius:5,border:`1px solid ${X.g}40`,background:X.gD,color:X.g,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:ft}}>Accept All</button>
                <button onClick={()=>{setAccepted(new Set());setRejected(new Set());setActiveEdit(null)}} style={{padding:"5px 14px",borderRadius:5,border:`1px solid ${X.b1}`,background:"transparent",color:X.t3,fontSize:11,cursor:"pointer",fontFamily:ft}}>Reset</button>
                <span style={{fontSize:10,color:X.t4}}>{accepted.size} accepted · {rejected.size} rejected · click to expand</span>
              </div>
              <div style={{maxHeight:"62vh",overflowY:"auto"}}>
                {(analysis.text_edits||[]).map((e,i)=>(
                  <EditBlock key={`e${i}`} type="edit" data={e} idx={i} active={activeEdit===i} onToggle={()=>setActiveEdit(activeEdit===i?null:i)}
                    onAccept={()=>doAccept(i)} onReject={()=>doReject(i)} isA={accepted.has(i)} isR={rejected.has(i)}/>
                ))}
                {(analysis.missing_paragraphs||[]).map((ins,i)=>{const idx=i+(analysis.text_edits?.length||0);return(
                  <EditBlock key={`i${i}`} type="insert" data={ins} idx={idx} active={activeEdit===idx} onToggle={()=>setActiveEdit(activeEdit===idx?null:idx)}
                    onAccept={()=>doAccept(idx)} onReject={()=>doReject(idx)} isA={accepted.has(idx)} isR={rejected.has(idx)}/>
                )})}
                {nEdits===0&&<div style={{padding:20,color:X.t3,fontSize:12,textAlign:"center"}}>No edits — documentation looks solid.</div>}
              </div>
            </div>)}

            {/* CODES */}
            {rTab==="codes"&&(<div style={{maxHeight:"62vh",overflowY:"auto"}}>
              <div style={{fontSize:12,color:X.t2,marginBottom:10}}>{analysis.summary}</div>
              {analysis.identified_codes?.map((co,i)=>(
                <div key={i} style={{padding:10,borderRadius:6,marginBottom:4,background:X.s1,borderLeft:`3px solid ${co.status==="supported"?X.g:co.status==="partial"?X.y:X.r}`,border:`1px solid ${X.b1}`}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <code style={{fontFamily:mn,fontWeight:700,fontSize:13,color:X.ac}}>{co.code}</code>
                      {(co.qty||1)>1&&<span style={{fontSize:9,padding:"2px 5px",borderRadius:3,background:X.acD,color:X.ac,fontWeight:700,fontFamily:mn}}>×{co.qty}</span>}
                      {co.is_addon&&<span style={{fontSize:8,padding:"2px 4px",borderRadius:3,background:X.pD,color:X.p,fontWeight:700}}>ADD-ON</span>}
                      <span style={{fontSize:8,padding:"2px 4px",borderRadius:3,fontWeight:700,background:co.status==="supported"?X.gD:co.status==="partial"?X.yD:X.rD,color:co.status==="supported"?X.g:co.status==="partial"?X.y:X.r,textTransform:"uppercase"}}>{co.status}</span>
                    </div>
                    <span style={{fontSize:10,color:X.p,fontFamily:mn}}>{co.rvu>0?`${((co.qty||1)*co.rvu).toFixed(1)} RVU${(co.qty||1)>1?` (${co.rvu}×${co.qty})`:""}`:"" }</span>
                  </div>
                  <div style={{fontSize:11,color:X.t2,marginTop:2}}>{co.description}</div>
                  {co.suggested_improvement&&<div style={{marginTop:5,padding:6,borderRadius:4,background:X.gD,fontSize:10,color:X.g,lineHeight:1.5}}>{co.suggested_improvement}</div>}
                </div>
              ))}
              {analysis.bundling_warnings?.map((w,i)=><div key={i} style={{padding:6,borderRadius:4,background:X.yB,fontSize:11,color:X.y,marginBottom:3}}>⚠ {w}</div>)}
              {analysis.missing_elements?.map((m,i)=><div key={i} style={{padding:6,borderRadius:4,background:X.rB,fontSize:11,color:X.r,marginBottom:3}}>{m}</div>)}
            </div>)}

            {/* CHECKLIST */}
            {rTab==="checklist"&&(<div style={{maxHeight:"62vh",overflowY:"auto"}}>
              {analysis.checklist?.map((it,i)=>(
                <div key={i} style={{display:"flex",gap:10,padding:"7px 12px",borderRadius:5,background:X.s1,border:`1px solid ${X.b1}`,marginBottom:3}}>
                  <span style={{fontSize:14,color:it.present?X.g:X.r,flexShrink:0}}>{it.present?"✓":"✗"}</span>
                  <div><div style={{fontSize:12,fontWeight:600,color:it.present?X.t1:X.r}}>{it.item}</div>{it.note&&<div style={{fontSize:10,color:X.t3}}>{it.note}</div>}</div>
                </div>
              ))||<div style={{padding:20,color:X.t3,textAlign:"center",fontSize:12}}>No checklist.</div>}
            </div>)}

            {/* FINAL */}
            {rTab==="final"&&(<div>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <button onClick={()=>copy(getFinal())} style={{padding:"5px 14px",borderRadius:5,border:`1px solid ${X.ac}40`,background:X.acD,color:X.ac,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:ft}}>Copy to Clipboard</button>
                <span style={{fontSize:10,color:X.t4,alignSelf:"center"}}>{accepted.size} edits applied</span>
              </div>
              <div style={{padding:16,borderRadius:10,background:X.s1,border:`1px solid ${X.b1}`,maxHeight:"62vh",overflowY:"auto"}}>
                <pre style={{fontFamily:mn,fontSize:13,lineHeight:1.9,color:X.t1,whiteSpace:"pre-wrap",margin:0}}>{getFinal()}</pre>
              </div>
            </div>)}
          </div>)}

          {/* ═══ JOB QUEUE PANEL ═══ */}
          {jobs.length>0&&(
            <div style={{marginTop:16,borderRadius:10,border:`1px solid ${X.b1}`,background:X.s1,overflow:"hidden"}}>
              <div onClick={()=>setShowQueue(!showQueue)} style={{
                padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",
                cursor:"pointer",background:X.s2,borderBottom:showQueue?`1px solid ${X.b1}`:"none",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12,fontWeight:700,color:X.t1}}>Job Queue</span>
                  <span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:X.acD,color:X.ac,fontWeight:700}}>{jobs.length}</span>
                  {jobs.some(j=>j.status==="running")&&(
                    <span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:X.pD,color:X.p,fontWeight:600}}>
                      {jobs.filter(j=>j.status==="running").length} running
                    </span>
                  )}
                  {jobs.filter(j=>j.status==="done").length>0&&(
                    <span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:X.gD,color:X.g,fontWeight:600}}>
                      {jobs.filter(j=>j.status==="done").length} done
                    </span>
                  )}
                  {jobs.filter(j=>j.status==="error").length>0&&(
                    <span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:X.rD,color:X.r,fontWeight:600}}>
                      {jobs.filter(j=>j.status==="error").length} failed
                    </span>
                  )}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <button onClick={e=>{e.stopPropagation();if(confirm("Clear completed jobs?"))setJobs(prev=>prev.filter(j=>j.status==="running"))}} style={{
                    padding:"3px 8px",borderRadius:4,border:`1px solid ${X.b1}`,background:"transparent",
                    color:X.t4,fontSize:10,cursor:"pointer",fontFamily:ft,
                  }}>Clear Done</button>
                  <span style={{fontSize:11,color:X.t4,transform:showQueue?"rotate(180deg)":"none",transition:"transform .15s"}}>▾</span>
                </div>
              </div>

              {showQueue&&(
                <div style={{maxHeight:300,overflowY:"auto"}}>
                  {jobs.map(j=>{
                    const isActive=j.id===activeJobId;
                    const elapsed=j.endTime?j.endTime-j.startTime:(j.status==="running"?Date.now()-j.startTime:0);

                    return(
                      <div key={j.id} onClick={()=>{if(j.status!=="running")loadJob(j.id)}} style={{
                        padding:"10px 14px",borderBottom:`1px solid ${X.b1}`,
                        display:"flex",alignItems:"center",gap:10,
                        background:isActive?X.s3:"transparent",
                        cursor:j.status!=="running"?"pointer":"default",
                      }}
                        onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background=X.s2}}
                        onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent"}}
                      >
                        <div style={{
                          width:10,height:10,borderRadius:"50%",flexShrink:0,
                          background:j.status==="done"?X.g:j.status==="error"?X.r:X.ac,
                          boxShadow:j.status==="running"?`0 0 6px ${X.ac}`:"none",
                        }}/>

                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:12,fontWeight:600,color:X.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                              {j.noteSnippet||"Op Note"}
                            </span>
                            {isActive&&<span style={{fontSize:8,padding:"1px 5px",borderRadius:3,background:X.acD,color:X.ac,fontWeight:700,flexShrink:0}}>VIEWING</span>}
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
                            <span style={{fontSize:10,color:X.t3}}>{j.surgeonName}</span>
                            <span style={{fontSize:10,color:X.t4}}>{fmtTimestamp(j.startTime)}</span>
                            {j.status==="error"&&<span style={{fontSize:10,color:X.r,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>{j.error}</span>}
                          </div>
                        </div>

                        <div style={{textAlign:"right",flexShrink:0,minWidth:50}}>
                          <div style={{
                            fontSize:13,fontWeight:700,fontFamily:mn,
                            color:j.status==="running"?X.ac:j.status==="done"?X.g:X.r,
                          }}>
                            {fmtTime(elapsed)}
                          </div>
                          <div style={{fontSize:9,color:X.t4,textTransform:"uppercase",fontWeight:600}}>{j.status}</div>
                        </div>

                        <button onClick={e=>{e.stopPropagation();removeJob(j.id)}} style={{
                          padding:"2px 6px",borderRadius:4,border:`1px solid ${X.b1}`,background:"transparent",
                          color:X.t4,fontSize:11,cursor:"pointer",fontFamily:ft,flexShrink:0,
                        }} title="Remove">✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>)}

        {/* ═══════ CASES BACKLOG ═══════ */}
        {tab==="cases"&&(<div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:X.t1}}>Case Backlog</div>
              <div style={{fontSize:11,color:X.t3,marginTop:2}}>
                {savedCases.length} saved case{savedCases.length!==1?"s":""} for {prof.name||"this surgeon"}
                {getTraining()&&` + ${getTraining().trainingCases} pre-loaded`}
                {" · "}Each saved case trains the AI on this surgeon's patterns
              </div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              {/* Grade filter */}
              <div style={{display:"flex",gap:2,background:X.bg,borderRadius:5,padding:2}}>
                {["all","A","B","C","D"].map(g=>(
                  <button key={g} onClick={()=>setCaseFilter(g)} style={{
                    padding:"4px 10px",borderRadius:3,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:ft,
                    background:caseFilter===g?X.s3:"transparent",
                    color:caseFilter===g?(g==="A"?X.g:g==="B"?X.ac:g==="C"?X.y:g==="D"?X.r:X.ac):X.t4,
                  }}>{g==="all"?"All":g}</button>
                ))}
              </div>
              {savedCases.length>0&&(
                <button onClick={async()=>{if(confirm(`Clear all ${savedCases.length} saved cases?`)){setSavedCases([]);await sv(sk("tcases"),[])}}} style={{
                  padding:"4px 10px",borderRadius:4,border:`1px solid ${X.rD}`,background:"transparent",color:X.r,fontSize:10,cursor:"pointer",fontFamily:ft,
                }}>Clear All</button>
              )}
            </div>
          </div>

          {savedCases.length===0?(
            <div style={{padding:40,textAlign:"center"}}>
              <div style={{fontSize:40,marginBottom:12}}>📋</div>
              <div style={{fontSize:14,fontWeight:600,color:X.t2,marginBottom:6}}>No saved cases yet</div>
              <div style={{fontSize:12,color:X.t3,maxWidth:400,margin:"0 auto",lineHeight:1.6}}>
                Analyze an op note in the Analyze tab, then click "Save to Training" to add it here. Each case teaches the system this surgeon's documentation patterns, coding habits, and writing style.
              </div>
              <button onClick={()=>setTab("analyze")} style={{marginTop:16,padding:"8px 20px",borderRadius:6,border:"none",background:`linear-gradient(135deg,${X.ac},${X.p})`,color:X.bg,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:ft}}>
                Go to Analyze
              </button>
            </div>
          ):(
            <div>
              {/* Stats summary bar */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(100px, 1fr))",gap:8,marginBottom:14}}>
                {(()=>{
                  const grades={A:0,B:0,C:0,D:0,F:0};
                  let totalRvu=0;
                  savedCases.forEach(c=>{if(grades[c.grade]!==undefined)grades[c.grade]++;totalRvu+=c.codes.reduce((s,cd)=>s+(cd.rvu*(cd.qty||1)),0)});
                  return(<>
                    <div style={{padding:"8px 12px",borderRadius:7,background:X.s2,border:`1px solid ${X.b1}`}}>
                      <div style={{fontSize:9,color:X.t4,fontWeight:700,textTransform:"uppercase"}}>Total Cases</div>
                      <div style={{fontSize:20,fontWeight:800,color:X.ac}}>{savedCases.length}</div>
                    </div>
                    <div style={{padding:"8px 12px",borderRadius:7,background:X.s2,border:`1px solid ${X.b1}`}}>
                      <div style={{fontSize:9,color:X.t4,fontWeight:700,textTransform:"uppercase"}}>Avg Grade</div>
                      <div style={{display:"flex",gap:4,marginTop:4}}>
                        {Object.entries(grades).filter(([,v])=>v>0).map(([g,v])=>(
                          <span key={g} style={{fontSize:11,fontWeight:700,color:g==="A"?X.g:g==="B"?X.ac:g==="C"?X.y:X.r}}>{v}{g}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{padding:"8px 12px",borderRadius:7,background:X.s2,border:`1px solid ${X.b1}`}}>
                      <div style={{fontSize:9,color:X.t4,fontWeight:700,textTransform:"uppercase"}}>Total wRVU</div>
                      <div style={{fontSize:20,fontWeight:800,color:X.g}}>{totalRvu.toFixed(1)}</div>
                    </div>
                    <div style={{padding:"8px 12px",borderRadius:7,background:X.s2,border:`1px solid ${X.b1}`}}>
                      <div style={{fontSize:9,color:X.t4,fontWeight:700,textTransform:"uppercase"}}>Avg wRVU/Case</div>
                      <div style={{fontSize:20,fontWeight:800,color:X.p}}>{savedCases.length>0?(totalRvu/savedCases.length).toFixed(1):"0"}</div>
                    </div>
                  </>);
                })()}
              </div>

              {/* Case cards */}
              <div style={{maxHeight:"65vh",overflowY:"auto"}}>
                {savedCases.filter(c=>caseFilter==="all"||c.grade===caseFilter).sort((a,b)=>b.id-a.id).map(tc=>{
                  const isExpanded=expandedCase===tc.id;
                  const codeRvu=tc.codes.reduce((s,c)=>s+(c.rvu*(c.qty||1)),0);
                  const gradeCol=tc.grade==="A"?X.g:tc.grade==="B"?X.ac:tc.grade==="C"?X.y:X.r;
                  const gradeBg=tc.grade==="A"?X.gD:tc.grade==="B"?X.acD:tc.grade==="C"?X.yD:X.rD;

                  return(
                    <div key={tc.id} style={{marginBottom:6,borderRadius:8,border:`1px solid ${isExpanded?X.b2:X.b1}`,background:X.s1,overflow:"hidden",transition:"border-color .15s"}}>
                      {/* Card header — always visible */}
                      <div onClick={()=>setExpandedCase(isExpanded?null:tc.id)} style={{
                        padding:"10px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",
                        background:isExpanded?X.s2:"transparent",
                      }}
                        onMouseEnter={e=>{if(!isExpanded)e.currentTarget.style.background=X.s2}}
                        onMouseLeave={e=>{if(!isExpanded)e.currentTarget.style.background="transparent"}}
                      >
                        {/* Grade badge */}
                        <div style={{width:32,height:32,borderRadius:6,background:gradeBg,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,color:gradeCol,flexShrink:0}}>{tc.grade}</div>

                        {/* Info */}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:600,color:X.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {tc.dx||tc.summary||"Case"}
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
                            <span style={{fontSize:10,color:X.t4}}>{tc.date}</span>
                            <span style={{fontSize:10,color:X.t3}}>{tc.codes.length} codes</span>
                            <span style={{fontSize:10,color:X.p,fontFamily:mn}}>{codeRvu.toFixed(1)} RVU</span>
                            {tc.editsAccepted>0&&<span style={{fontSize:9,color:X.g}}>✓{tc.editsAccepted} edits</span>}
                          </div>
                        </div>

                        {/* Code pills preview */}
                        <div style={{display:"flex",gap:3,flexWrap:"wrap",maxWidth:200,justifyContent:"flex-end"}}>
                          {tc.codes.slice(0,4).map((cd,j)=>(
                            <span key={j} style={{fontSize:8,padding:"1px 4px",borderRadius:3,
                              background:cd.status==="supported"?X.gD:cd.status==="partial"?X.yD:X.rD,
                              color:cd.status==="supported"?X.g:cd.status==="partial"?X.y:X.r,fontFamily:mn,
                            }}>{cd.code}{cd.qty>1?`×${cd.qty}`:""}</span>
                          ))}
                          {tc.codes.length>4&&<span style={{fontSize:8,color:X.t4}}>+{tc.codes.length-4}</span>}
                        </div>

                        <span style={{fontSize:11,color:X.t4,transform:isExpanded?"rotate(180deg)":"none",transition:"transform .15s",flexShrink:0}}>▾</span>
                      </div>

                      {/* Expanded details */}
                      {isExpanded&&(
                        <div style={{padding:"0 14px 14px",borderTop:`1px solid ${X.b1}`}}>
                          {/* Diagnosis & Procedures */}
                          {tc.dx&&(
                            <div style={{marginTop:10}}>
                              <div style={{fontSize:10,fontWeight:700,color:X.t4,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Diagnosis</div>
                              <div style={{fontSize:12,color:X.t1,lineHeight:1.5}}>{tc.dx}</div>
                            </div>
                          )}
                          {tc.procedures&&(
                            <div style={{marginTop:8}}>
                              <div style={{fontSize:10,fontWeight:700,color:X.t4,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Procedures</div>
                              <div style={{fontSize:12,color:X.t2,lineHeight:1.5}}>{tc.procedures}</div>
                            </div>
                          )}

                          {/* CPT Codes — full list */}
                          <div style={{marginTop:10}}>
                            <div style={{fontSize:10,fontWeight:700,color:X.t4,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>CPT Codes ({tc.codes.length})</div>
                            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))",gap:4}}>
                              {tc.codes.map((cd,j)=>(
                                <div key={j} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",borderRadius:4,background:X.s3}}>
                                  <code style={{fontFamily:mn,fontWeight:700,fontSize:11,color:X.ac}}>{cd.code}</code>
                                  {cd.qty>1&&<span style={{fontSize:9,padding:"1px 4px",borderRadius:3,background:X.acD,color:X.ac,fontWeight:700}}>×{cd.qty}</span>}
                                  <span style={{fontSize:9,padding:"1px 4px",borderRadius:3,fontWeight:600,
                                    background:cd.status==="supported"?X.gD:cd.status==="partial"?X.yD:X.rD,
                                    color:cd.status==="supported"?X.g:cd.status==="partial"?X.y:X.r,textTransform:"uppercase",
                                  }}>{cd.status}</span>
                                  <span style={{fontSize:10,color:X.t3,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cd.desc}</span>
                                  <span style={{fontSize:10,color:X.p,fontFamily:mn,flexShrink:0}}>{(cd.rvu*(cd.qty||1)).toFixed(1)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Analysis snapshot */}
                          {tc.analysisSnapshot&&(
                            <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}>
                              <div style={{padding:"6px 10px",borderRadius:5,background:X.s3,fontSize:10,color:X.t2}}>
                                {tc.analysisSnapshot.text_edits||0} text edits · {tc.analysisSnapshot.missing_paragraphs||0} insertions
                              </div>
                              {tc.analysisSnapshot.bundling_warnings?.length>0&&(
                                <div style={{padding:"6px 10px",borderRadius:5,background:X.yD,fontSize:10,color:X.y}}>
                                  {tc.analysisSnapshot.bundling_warnings.length} bundling warning{tc.analysisSnapshot.bundling_warnings.length>1?"s":""}
                                </div>
                              )}
                              {tc.analysisSnapshot.missing_elements?.length>0&&(
                                <div style={{padding:"6px 10px",borderRadius:5,background:X.rD,fontSize:10,color:X.r}}>
                                  {tc.analysisSnapshot.missing_elements.length} missing element{tc.analysisSnapshot.missing_elements.length>1?"s":""}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Style & terminology learned */}
                          {(tc.style?.length>0||tc.terminology?.length>0)&&(
                            <div style={{marginTop:10}}>
                              <div style={{fontSize:10,fontWeight:700,color:X.t4,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Patterns Learned</div>
                              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                                {(tc.style||[]).map((s,j)=><span key={`s${j}`} style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:X.oD,color:X.o}}>{s.slice(0,60)}</span>)}
                                {(tc.terminology||[]).map((t,j)=><span key={`t${j}`} style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:X.acD,color:X.ac}}>{t.slice(0,60)}</span>)}
                              </div>
                            </div>
                          )}

                          {/* Note excerpt */}
                          {(tc.fullNote||tc.noteExcerpt)&&(
                            <div style={{marginTop:10}}>
                              <div style={{fontSize:10,fontWeight:700,color:X.t4,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>
                                Op Note {tc.fullNote?"(Full)":"(Excerpt)"}
                              </div>
                              <div style={{padding:10,borderRadius:6,background:X.bg,border:`1px solid ${X.b1}`,maxHeight:200,overflowY:"auto"}}>
                                <pre style={{fontFamily:mn,fontSize:11,lineHeight:1.6,color:X.t3,whiteSpace:"pre-wrap",margin:0}}>
                                  {tc.fullNote||tc.noteExcerpt}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div style={{display:"flex",gap:8,marginTop:12}}>
                            <button onClick={()=>{setOpNote(tc.fullNote||tc.noteExcerpt||"");setTab("analyze");setAnalysis(null);setConfirmStep(false)}} style={{
                              padding:"5px 14px",borderRadius:5,border:`1px solid ${X.ac}40`,background:X.acD,color:X.ac,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:ft,
                            }}>Re-Analyze</button>
                            <button onClick={()=>{copy(tc.fullNote||tc.noteExcerpt||"")}} style={{
                              padding:"5px 14px",borderRadius:5,border:`1px solid ${X.b2}`,background:"transparent",color:X.t3,fontSize:11,cursor:"pointer",fontFamily:ft,
                            }}>Copy Note</button>
                            <button onClick={()=>removeTrainingCase(tc.id)} style={{
                              padding:"5px 14px",borderRadius:5,border:`1px solid ${X.rD}`,background:"transparent",color:X.r,fontSize:11,cursor:"pointer",fontFamily:ft,marginLeft:"auto",
                            }}>Remove from Training</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {savedCases.filter(c=>caseFilter==="all"||c.grade===caseFilter).length===0&&caseFilter!=="all"&&(
                  <div style={{padding:20,textAlign:"center",color:X.t3,fontSize:12}}>No cases with grade {caseFilter}</div>
                )}
              </div>
            </div>
          )}
        </div>)}

        {/* LIBRARY */}
        {tab==="library"&&(<div>
          <input value={libSearch} onChange={e=>setLibSearch(e.target.value)} placeholder="Search codes, keywords, procedures..."
            style={{width:"100%",padding:"10px 14px",borderRadius:7,background:X.s2,border:`1px solid ${X.b1}`,color:X.t1,fontSize:13,fontFamily:ft,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
          <div style={{fontSize:10,color:X.t3,marginBottom:8}}>{Object.values(fLib).flat().length} codes · {Object.keys(fLib).length} categories</div>
          {Object.entries(fLib).map(([cat,codes])=>(
            <div key={cat} style={{marginBottom:4}}>
              <div onClick={()=>setXCat(xCat===cat?null:cat)} style={{padding:"8px 12px",borderRadius:5,cursor:"pointer",background:X.s2,border:`1px solid ${X.b1}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:600,fontSize:12}}>{cat}</span>
                <span style={{fontSize:10,color:X.t3}}>{codes.length} ▾</span>
              </div>
              {xCat===cat&&codes.map(co=>(
                <div key={co.c} style={{padding:"6px 12px",marginTop:2,borderRadius:4,background:X.s1,border:`1px solid ${X.b1}`,display:"grid",gridTemplateColumns:"68px 1fr 50px",gap:8}}>
                  <code style={{fontFamily:mn,fontWeight:700,fontSize:11,color:X.ac}}>{co.c}{co.a&&<span style={{display:"block",fontSize:8,color:X.p}}>ADD-ON</span>}</code>
                  <div><div style={{fontSize:11,color:X.t1,lineHeight:1.4}}>{co.d}</div><div style={{fontSize:10,color:X.t3,marginTop:2}}><span style={{color:X.p,fontWeight:600}}>Req:</span> {co.r}</div></div>
                  <div style={{fontSize:10,color:X.p,fontWeight:600,textAlign:"right",fontFamily:mn}}>{co.v>0?co.v:"—"}</div>
                </div>
              ))}
            </div>
          ))}
        </div>)}

        {/* PROFILE */}
        {tab==="profile"&&(<div style={{maxWidth:700}}>
          {/* Surgeon header */}
          <div style={{padding:16,borderRadius:10,background:`linear-gradient(135deg,${X.acD}40,${X.pD}40)`,border:`1px solid ${X.ac}30`,marginBottom:16}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:20,fontWeight:800,color:X.ac}}>{prof.name||"New Surgeon"}</div>
                <div style={{fontSize:12,color:X.t2,marginTop:4}}>{prof.focus||"Set subspecialty below"}</div>
              </div>
              {getTraining()&&<span style={{fontSize:9,padding:"3px 8px",borderRadius:4,background:X.gD,color:X.g,fontWeight:700}}>PRE-TRAINED</span>}
              {!getTraining()&&<span style={{fontSize:9,padding:"3px 8px",borderRadius:4,background:X.pD,color:X.p,fontWeight:700}}>LEARNING</span>}
            </div>
            {getTraining()&&(
              <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:X.gD,color:X.g,fontWeight:600}}>Trained on {getTraining().trainingCases} cases</span>
                <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:X.pD,color:X.p,fontWeight:600}}>{getTraining().stylePatterns.length} style rules</span>
                <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:X.acD,color:X.ac,fontWeight:600}}>{getTraining().terminology.length} terminology rules</span>
                {getTraining().implantSystems&&<span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:X.s3,color:X.t2}}>{getTraining().implantSystems.join(" · ")}</span>}
              </div>
            )}
            {!getTraining()&&(
              <div style={{marginTop:8,fontSize:11,color:X.t3,lineHeight:1.5}}>
                No pre-trained data — the system will learn this surgeon's writing style, terminology, and documentation patterns from each op note you analyze. After 3–5 notes, suggestions become personalized.
                {styleMem.length>0&&<span style={{color:X.g}}> ({styleMem.length} patterns learned so far)</span>}
              </div>
            )}
          </div>

          {/* All saved surgeons */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:X.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>All Surgeons</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {allSurgeons().map(s=>(
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:0,borderRadius:6,overflow:"hidden",border:surgeon===s.id?`1.5px solid ${X.ac}`:`1px solid ${X.b1}`}}>
                  <button onClick={()=>switchSurgeon(s.id)} style={{
                    padding:"7px 14px",border:"none",cursor:"pointer",fontFamily:ft,fontSize:12,fontWeight:surgeon===s.id?700:500,
                    background:surgeon===s.id?X.acD:X.s2,color:surgeon===s.id?X.ac:X.t2,
                  }}>
                    {s.name}
                    {s.builtin&&<span style={{fontSize:8,marginLeft:4,color:X.t4}}>(trained)</span>}
                  </button>
                  {!s.builtin&&(
                    <button onClick={()=>deleteProfile(s.id)} style={{
                      padding:"7px 8px",border:"none",borderLeft:`1px solid ${X.b1}`,cursor:"pointer",
                      background:surgeon===s.id?X.acD:X.s2,color:X.r,fontSize:12,fontFamily:ft,
                    }} title="Delete profile">✕</button>
                  )}
                </div>
              ))}
              <button onClick={()=>setShowNewProfile(true)} style={{
                padding:"7px 14px",borderRadius:6,border:`1px dashed ${X.b2}`,cursor:"pointer",
                background:"transparent",color:X.t3,fontSize:12,fontFamily:ft,
              }}>+ Add Surgeon</button>
            </div>
          </div>

          {/* Editable fields */}
          {[{k:"name",l:"Name",ph:"Dr. Smith"},{k:"focus",l:"Subspecialty",ph:"Degenerative lumbar, adult deformity, MIS, trauma..."}].map(f=>(
            <div key={f.k} style={{marginBottom:12}}>
              <label style={{fontSize:11,fontWeight:600,color:X.t2,display:"block",marginBottom:4}}>{f.l}</label>
              <input value={prof[f.k]} onChange={e=>{const p={...prof,[f.k]:e.target.value};setProf(p);sv(sk("prof"),p)}}
                placeholder={f.ph} style={{width:"100%",padding:"8px 12px",borderRadius:6,background:X.s2,border:`1px solid ${X.b1}`,color:X.t1,fontSize:13,fontFamily:ft,outline:"none",boxSizing:"border-box"}}/>
            </div>
          ))}

          {/* Pre-loaded training data */}
          {getTraining()&&(<>
            <div style={{marginTop:20,padding:14,borderRadius:8,background:X.s2,border:`1px solid ${X.b1}`}}>
              <div style={{fontSize:11,fontWeight:700,color:X.o,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>
                Pre-Trained Writing Style <span style={{color:X.t4,fontWeight:400}}>({getTraining().stylePatterns.length} rules from {getTraining().trainingCases}-case analysis)</span>
              </div>
              <div style={{maxHeight:180,overflowY:"auto"}}>
                {getTraining().stylePatterns.map((s,i)=>(
                  <div key={i} style={{fontSize:11,color:X.t2,padding:"3px 8px",borderRadius:4,background:X.s3,marginBottom:2,lineHeight:1.4}}>
                    <span style={{color:X.o,marginRight:6}}>●</span>{s}
                  </div>
                ))}
              </div>
            </div>

            <div style={{marginTop:10,padding:14,borderRadius:8,background:X.s2,border:`1px solid ${X.b1}`}}>
              <div style={{fontSize:11,fontWeight:700,color:X.ac,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>
                Terminology Rules <span style={{color:X.t4,fontWeight:400}}>({getTraining().terminology.length} rules)</span>
              </div>
              <div style={{maxHeight:160,overflowY:"auto"}}>
                {getTraining().terminology.map((s,i)=>(
                  <div key={i} style={{fontSize:11,color:X.t2,padding:"3px 8px",borderRadius:4,background:X.s3,marginBottom:2,lineHeight:1.4}}>
                    <span style={{color:X.ac,marginRight:6}}>●</span>{s}
                  </div>
                ))}
              </div>
            </div>

            <div style={{marginTop:10,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div style={{padding:14,borderRadius:8,background:X.s2,border:`1px solid ${X.b1}`}}>
                <div style={{fontSize:11,fontWeight:700,color:X.g,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Strengths</div>
                {getTraining().strengths.map((s,i)=>(
                  <div key={i} style={{fontSize:10,color:X.g,padding:"2px 0",lineHeight:1.4,opacity:.85}}>✓ {s}</div>
                ))}
              </div>
              <div style={{padding:14,borderRadius:8,background:X.s2,border:`1px solid ${X.b1}`}}>
                <div style={{fontSize:11,fontWeight:700,color:X.r,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Weaknesses (Edit Targets)</div>
                {getTraining().weaknesses.map((s,i)=>(
                  <div key={i} style={{fontSize:10,color:X.r,padding:"2px 0",lineHeight:1.4,opacity:.85}}>✗ {s}</div>
                ))}
              </div>
            </div>
          </>)}

          {/* Ongoing learning */}
          <div style={{marginTop:16,padding:14,borderRadius:8,background:X.s2,border:`1px solid ${X.b1}`}}>
            <div style={{fontSize:11,fontWeight:700,color:X.p,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>
              Ongoing Learning {styleMem.length>0&&<span style={{color:X.t4,fontWeight:400}}>({styleMem.length} new observations + {editHist.length} edit decisions)</span>}
            </div>
            {styleMem.length===0&&editHist.length===0?
              <div style={{fontSize:11,color:X.t3}}>Run your first analysis — the system adds to the pre-trained profile with each note.</div>
            :(<>
              {styleMem.length>0&&(<div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:X.t4,marginBottom:4}}>New style observations (auto-learned):</div>
                <div style={{maxHeight:120,overflowY:"auto"}}>
                  {styleMem.map((s,i)=>(
                    <div key={i} style={{fontSize:11,color:X.t2,padding:"3px 8px",borderRadius:4,background:X.s3,marginBottom:2}}>
                      <span style={{color:X.g,marginRight:6}}>+</span>{s}
                    </div>
                  ))}
                </div>
              </div>)}
              {editHist.length>0&&(<>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:8}}>
                  <div><div style={{fontSize:9,color:X.t4}}>New Cases</div><div style={{fontSize:18,fontWeight:700,color:X.ac}}>{cases}</div></div>
                  <div><div style={{fontSize:9,color:X.t4}}>Decisions</div><div style={{fontSize:18,fontWeight:700,color:X.p}}>{editHist.length}</div></div>
                  <div><div style={{fontSize:9,color:X.t4}}>Accept Rate</div><div style={{fontSize:18,fontWeight:700,color:X.g}}>{Math.round(editHist.filter(h=>h.ok).length/editHist.length*100)}%</div></div>
                </div>
                {editPrefs.map((p,i)=><div key={i} style={{fontSize:11,color:X.t2,padding:"3px 8px",borderRadius:4,background:X.s3,marginBottom:2}}>{p}</div>)}
                {(()=>{
                  const types={};editHist.forEach(h=>{if(!types[h.et])types[h.et]={a:0,r:0};h.ok?types[h.et].a++:types[h.et].r++});
                  return Object.entries(types).map(([t,{a,r}])=>{const pct=Math.round(a/(a+r)*100);return(
                    <div key={t} style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                      <span style={{fontSize:10,color:X.t2,width:80,textTransform:"capitalize"}}>{t}</span>
                      <div style={{flex:1,height:5,background:X.s3,borderRadius:3,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:pct>60?X.g:pct>30?X.y:X.r,borderRadius:3}}/></div>
                      <span style={{fontSize:10,color:X.t3,width:35,textAlign:"right"}}>{pct}%</span>
                    </div>)});
                })()}
              </>)}
            </>)}
          </div>

          {/* ─── Saved Training Cases ─── */}
          <div style={{marginTop:16,padding:14,borderRadius:8,background:X.s2,border:`1px solid ${X.b1}`}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:X.y,textTransform:"uppercase",letterSpacing:1}}>
                Training Cases <span style={{color:X.t4,fontWeight:400}}>({(getTraining()?.trainingCases||0)+savedCases.length} total — {getTraining()?.trainingCases||0} pre-loaded + {savedCases.length} saved)</span>
              </div>
              {savedCases.length>0&&(
                <button onClick={async()=>{if(confirm(`Clear all ${savedCases.length} saved training cases?`)){setSavedCases([]);await sv(sk("tcases"),[])}}} style={{
                  padding:"2px 8px",borderRadius:4,border:`1px solid ${X.b1}`,background:"transparent",
                  color:X.t4,fontSize:9,cursor:"pointer",fontFamily:ft,
                }}>Clear All</button>
              )}
            </div>
            {savedCases.length===0?(
              <div style={{fontSize:11,color:X.t3,lineHeight:1.5}}>
                No saved cases yet. After analyzing an op note, click "Save to Training" to add it to this surgeon's training library. Each saved case teaches the system their case mix, coding patterns, and documentation style.
              </div>
            ):(
              <div style={{maxHeight:260,overflowY:"auto"}}>
                {savedCases.map((tc,i)=>(
                  <div key={tc.id} style={{padding:"8px 10px",borderRadius:6,background:X.s3,border:`1px solid ${X.b1}`,marginBottom:4,position:"relative"}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                          <span style={{fontSize:10,color:X.t4,fontFamily:mn}}>{tc.date}</span>
                          <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,fontWeight:700,
                            background:tc.grade==="A"?X.gD:tc.grade==="B"?X.acD:tc.grade==="C"?X.yD:X.rD,
                            color:tc.grade==="A"?X.g:tc.grade==="B"?X.ac:tc.grade==="C"?X.y:X.r,
                          }}>{tc.grade}</span>
                          {tc.editsAccepted>0&&<span style={{fontSize:9,color:X.g}}>✓{tc.editsAccepted}</span>}
                          {tc.editsRejected>0&&<span style={{fontSize:9,color:X.r}}>✗{tc.editsRejected}</span>}
                        </div>
                        <div style={{fontSize:11,fontWeight:600,color:X.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tc.dx||tc.summary}</div>
                        {tc.procedures&&<div style={{fontSize:10,color:X.t3,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tc.procedures}</div>}
                        <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:4}}>
                          {tc.codes.slice(0,8).map((cd,j)=>(
                            <span key={j} style={{fontSize:8,padding:"1px 4px",borderRadius:3,
                              background:cd.status==="supported"?X.gD:cd.status==="partial"?X.yD:X.rD,
                              color:cd.status==="supported"?X.g:cd.status==="partial"?X.y:X.r,
                              fontFamily:mn,
                            }}>{cd.code}{cd.qty>1?`×${cd.qty}`:""}</span>
                          ))}
                          {tc.codes.length>8&&<span style={{fontSize:8,color:X.t4}}>+{tc.codes.length-8} more</span>}
                        </div>
                      </div>
                      <button onClick={()=>removeTrainingCase(tc.id)} style={{
                        padding:"2px 5px",borderRadius:3,border:`1px solid ${X.b1}`,background:"transparent",
                        color:X.t4,fontSize:10,cursor:"pointer",fontFamily:ft,flexShrink:0,
                      }} title="Remove from training">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{fontSize:10,color:X.t4,marginTop:8}}>
              Saved cases are fed into the AI prompt so it learns this surgeon's case mix, typical CPT code patterns, and documentation habits. More cases = better personalization.
            </div>
          </div>

          <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
            <button onClick={async()=>{if(confirm("Erase all learned data AND saved training cases for this surgeon?"+(getTraining()?" Pre-trained profile is preserved.":""))){
              await sv(sk("styl"),[]);await sv(sk("ehist"),[]);await sv(sk("cases"),0);await sv(sk("tcases"),[]);
              setStyleMem([]);setEditHist([]);setEditPrefs([]);setCases(0);setSavedCases([]);
            }}} style={{padding:"6px 14px",borderRadius:5,border:`1px solid ${X.rD}`,background:"transparent",color:X.r,fontSize:11,cursor:"pointer",fontFamily:ft}}>
              Reset All Learned Data
            </button>
            {!getTraining()&&customProfiles.some(cp=>cp.id===surgeon)&&(
              <button onClick={()=>deleteProfile(surgeon)} style={{padding:"6px 14px",borderRadius:5,border:`1px solid ${X.r}`,background:X.rB,color:X.r,fontSize:11,cursor:"pointer",fontFamily:ft,fontWeight:600}}>
                Delete This Profile
              </button>
            )}
          </div>
        </div>)}

        {/* RULES */}
        {tab==="rules"&&(<div>
          {[{r:"Separate Procedures",d:"Each component (decompression, fusion, instrumentation, graft) in a DISTINCT paragraph.",i:"§"},
            {r:"Level Specificity",d:"Every level explicitly named ('L4-L5'). Never 'the affected level.'",i:"L"},
            {r:"Laterality",d:"Bilateral vs. unilateral for ALL decompression and instrumentation.",i:"↔"},
            {r:"Medical Necessity",d:"Link each procedure to specific pathology (stenosis, instability, HNP).",i:"Dx"},
            {r:"Graft Sourcing",d:"Auto vs. allo, morselized vs. structural, harvest site, separate incision.",i:"⊕"},
            {r:"Instrumentation Detail",d:"EACH screw by level+side. Rods, set screws, cross-links.",i:"#"},
            {r:"Add-on Language",d:"'Each additional' or 'at each subsequent level' to support add-on codes.",i:"+"},
            {r:"Distinct Procedures",d:"Decompression + fusion at same level must be SEPARATE documented procedures.",i:"≠"},
            {r:"Intraop Findings",d:"Describe pathology found (thickened ligamentum, osteophyte, HNP).",i:"⊙"},
            {r:"Time & Complexity",d:"Op time, EBL, complexity factors for high-RVU codes.",i:"⏱"},
          ].map((rule,i)=>(
            <div key={i} style={{padding:10,borderRadius:6,background:X.s2,border:`1px solid ${X.b1}`,marginBottom:4,display:"flex",gap:10}}>
              <div style={{width:26,height:26,borderRadius:5,background:X.s3,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:mn,fontWeight:700,fontSize:12,color:X.ac,flexShrink:0}}>{rule.i}</div>
              <div><div style={{fontWeight:700,fontSize:12,color:X.ac}}>{rule.r}</div><div style={{fontSize:11,color:X.t2,lineHeight:1.5,marginTop:2}}>{rule.d}</div></div>
            </div>
          ))}
          <div style={{marginTop:16,padding:12,borderRadius:7,background:X.gD,border:`1px solid ${X.g}20`}}>
            <div style={{fontWeight:700,fontSize:12,color:X.g,marginBottom:4}}>Ethical Coding</div>
            <div style={{fontSize:11,color:X.g,lineHeight:1.7,opacity:.85}}>
              This tool captures legitimate work — not upcode. The #1 spine billing error is undercoding: missing add-on codes for procedures genuinely performed. Your accept/reject patterns continuously train the system to match your documentation philosophy.
            </div>
          </div>
        </div>)}
      </div>

      <style>{`
        @keyframes ld{0%{width:5%;opacity:.5}50%{width:70%;opacity:1}100%{width:95%;opacity:.6}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        *{scrollbar-width:thin;scrollbar-color:${X.b1} transparent}
        textarea::placeholder,input::placeholder{color:${X.t4}}
        button:hover{filter:brightness(1.1)}
      `}</style>
    </div>
  );
}

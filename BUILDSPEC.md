# SpineCPT Pro — Build Specification for Claude Code

## WHAT THIS IS
A complete specification for building a production Electron desktop app for spine surgery operative note optimization. Feed this file to Claude Code and it will build the entire project.

## WHERE TO BUILD
```
C:\Users\sapan\Documents\UMD Research\spinecpt-desktop\
```

## TECH STACK
- **Runtime:** Electron 33+ (desktop app, Windows/Mac)
- **Frontend:** React 18 + Vite
- **AI:** Anthropic API (Claude Opus 4.6 with extended thinking)
- **Auth:** Supabase (optional, for multi-user)
- **Storage:** Local SQLite (via better-sqlite3) + optional Supabase sync
- **Voice:** Web Speech API (browser built-in, free)
- **Packaging:** electron-builder (generates .exe installer)

## CORE FEATURES TO BUILD

### 1. Voice-to-Note Dictation (PRIORITY)
- Real-time speech transcription using Web Speech API
- Live text editor that updates as surgeon speaks
- Auto-restart on silence gaps
- Voice works in Electron's Chromium webview (no browser needed)
- Template-guided dictation (sections appear as prompts)

### 2. Live CPT Detection
- As text is transcribed, scan against 122-code CPT keyword library
- Show matched codes in real-time sidebar with confidence scores
- Running wRVU total updates live
- Keyword highlighting in the note text

### 3. Compliance Scoring (Real-Time)
- 15 documentation elements checked against live text
- Score bar (0-100%) updates as surgeon speaks
- Critical gaps flagged in red (laterality, implant detail, medical necessity)
- Weighted scoring (laterality = 2x, consent = 1x)

### 4. Procedure Templates
- Pre-built templates: Posterior Lumbar Decompression, PLF/PLIF/TLIF, ACDF, Sacral Fracture Fixation, Kyphoplasty
- Each template has ordered sections with prompts
- Required vs optional sections marked
- Template auto-inserts section headers into dictation
- Each template lists expected CPT codes and ICD-10 codes

### 5. Full Note Analysis (Claude Opus)
- Send completed note to Claude Opus 4.6 with extended thinking (8K budget)
- System prompt includes synthesized surgeon profile
- Returns: identified CPT codes, inline edits, RVU before/after, documentation grade, bundling warnings
- 3-minute timeout with AbortController
- Response parsing filters thinking blocks, handles truncated JSON

### 6. NCCI Bundling Validation (Client-Side)
- 30+ spine-specific NCCI edit pairs hardcoded
- Validates identified codes against table after every analysis
- Two severity levels: error (cannot unbundle) vs warning (modifier may apply)
- Does NOT rely on AI for bundling — ground truth table

### 7. Surgeon-Adaptive Learning System
Three-layer architecture:
1. **Pre-trained profiles** (hardcoded): Ludwig (12 cases, 21 style rules, 22 terminology rules), Cavanaugh (1 case)
2. **Saved training cases** (persistent): auto-saved after every analysis. Stores: diagnosis, procedures, CPT codes with statuses, grade, style observations, full note text, analysis snapshot
3. **Ongoing learning**: style/terminology deduplication with 60% word overlap detection, frequency weighting, edit accept/reject tracking

**Profile Synthesis Engine** runs before every analysis:
- Deduplicates style observations, weights by frequency ("Uses passive voice [seen 8×]")
- Builds CPT code frequency map from saved cases
- Identifies commonly missed codes (gap rate >40% across 2+ cases)
- Tracks procedure mix automatically
- Auto-detects implant systems from note text
- Derives recurring weaknesses from edit acceptance patterns

### 8. Billing Accuracy Tracker
- After analysis, user can paste actual billed CPT codes
- System computes precision (of predicted, how many billed) and recall (of billed, how many caught)
- Tracks per-case and aggregate accuracy per surgeon
- Identifies top missed codes and top over-predicted codes
- Dashboard in Profile tab

### 9. Custom Surgeon Profiles
- Create/delete custom surgeon profiles
- Each profile has isolated storage (style, edit history, training cases, billing log)
- Profile selector in header bar

### 10. Job Queue
- Parallel analysis support
- Live timers per job
- Background execution (start new note while analysis runs)
- Job cards with status dots, click to load results

## FILE STRUCTURE
```
spinecpt-desktop/
├── main.js                     # Electron main process
├── preload.js                  # IPC security bridge
├── package.json
├── electron-builder.json       # Packaging config for .exe
├── vite.config.js
├── .env                        # ANTHROPIC_API_KEY
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Root component + routing
│   ├── index.css               # Global styles (dark theme)
│   │
│   ├── data/
│   │   ├── cptLibrary.js       # 122 CPT codes with RVU, keywords, doc requirements
│   │   ├── ncciPairs.js        # NCCI bundling edit pairs
│   │   ├── icd10.js            # ICD-10 spine codes
│   │   ├── templates.js        # Procedure templates with sections
│   │   ├── complianceRules.js  # 15 documentation compliance rules
│   │   └── surgeonProfiles.js  # Pre-trained Ludwig + Cavanaugh profiles
│   │
│   ├── modules/
│   │   ├── dictation.js        # Web Speech API wrapper
│   │   ├── cptDetector.js      # Live CPT keyword scanner
│   │   ├── compliance.js       # Real-time compliance scorer
│   │   ├── analyzer.js         # Claude API caller + response parser
│   │   ├── ncci.js             # NCCI bundling validator
│   │   ├── synthesizer.js      # Profile synthesis engine
│   │   ├── storage.js          # SQLite + Supabase sync
│   │   └── billing.js          # Billed vs predicted tracker
│   │
│   ├── components/
│   │   ├── Header.jsx          # App header with surgeon selector
│   │   ├── DictateTab.jsx      # Voice dictation + live sidebar
│   │   ├── AnalyzeTab.jsx      # Note analysis + results
│   │   ├── CasesTab.jsx        # Case backlog browser
│   │   ├── LibraryTab.jsx      # CPT code library browser
│   │   ├── ProfileTab.jsx      # Surgeon profile + learning stats
│   │   ├── RulesTab.jsx        # Documentation rules reference
│   │   │
│   │   ├── dictation/
│   │   │   ├── VoiceButton.jsx
│   │   │   ├── LiveEditor.jsx
│   │   │   ├── ComplianceBar.jsx
│   │   │   ├── CPTSidebar.jsx
│   │   │   └── TemplateGuide.jsx
│   │   │
│   │   ├── analysis/
│   │   │   ├── RVUComparison.jsx
│   │   │   ├── EditBlock.jsx
│   │   │   ├── NCCIPanel.jsx
│   │   │   ├── BillingInput.jsx
│   │   │   └── CodesList.jsx
│   │   │
│   │   └── shared/
│   │       ├── Badge.jsx
│   │       ├── GradeCircle.jsx
│   │       └── CodePill.jsx
│   │
│   └── hooks/
│       ├── useSurgeon.js       # Surgeon state + switching
│       ├── useJobs.js          # Job queue management
│       └── useStorage.js       # Storage read/write hook
```

## DATA: CPT LIBRARY (122 codes)
Import the complete CPT library from the existing spinecpt-adaptive.jsx file. It's the `const CPT = { ... }` object at the top. Structure per code:
```javascript
{ c: "63047", d: "Laminectomy+facetectomy+foraminotomy, lumbar, 1 seg", v: 17.46, k: ["laminectomy","facetectomy","foraminotomy","lumbar","stenosis"], r: "CRITICAL: facetectomy + foraminotomy + lamina removal as SEPARATE steps", a: 0 }
// c=code, d=description, v=RVU, k=keywords, r=requirements, a=addon flag
```

## DATA: PRE-TRAINED SURGEON PROFILES
Import from existing spinecpt-adaptive.jsx. Ludwig has:
- 21 style patterns (passive voice, "Following this," transitions, "colinear" spelling, etc.)
- 22 terminology rules ("rongeur" not "pituitary forceps", etc.)
- 7 strengths, 7 weaknesses
- 5 implant systems
Cavanaugh has: 16 style, 14 terminology, 7 strengths, 4 weaknesses

## ANALYSIS PROMPT
The system prompt to Claude must include:
1. Synthesized surgeon profile (from synthesizer.js)
2. Relevant CPT codes pre-filtered by keyword matching
3. Instructions to return ONLY valid JSON with: summary, style_observations, terminology_observations, original_rvu, enhanced_rvu, identified_codes (with qty field), bundling_warnings, missing_elements, overall_documentation_grade, text_edits, missing_paragraphs, checklist
4. Instructions for add-on code quantities (list multiple times for multiple levels)

## ELECTRON CONFIG
- Window: 1400x900, dark background (#060911)
- Menu: minimal (File > Quit, Help > About)
- IPC channels: 'analyze' (send to Claude API), 'storage-read', 'storage-write'
- API key loaded from .env in main process, never exposed to renderer
- Auto-updater: check GitHub releases on startup

## UI THEME (dark)
```javascript
bg: "#060911", s1: "#0c1219", s2: "#111922", s3: "#182230",
b1: "#1e2d3d", b2: "#2a3f54",
t1: "#e8edf3", t2: "#a4b4c7", t3: "#6b7f95", t4: "#3d5169",
ac: "#4fc3f7", acD: "#4fc3f710", p: "#ce93d8", pD: "#ce93d810",
g: "#66bb6a", gD: "#66bb6a15", r: "#ef5350", rD: "#ef535015",
y: "#ffb74d", yD: "#ffb74d15", o: "#ff8a65", oD: "#ff8a6515"
```

## EXISTING CODE TO PORT
The complete working implementation exists in:
`C:\Users\sapan\Documents\UMD Research\spinecpt-pro\src\App.jsx`

This is a single 2600-line JSX file with everything working. The job is to decompose it into the modular structure above while preserving ALL functionality:
- All 122 CPT codes
- Both pre-trained surgeon profiles (Ludwig, Cavanaugh)
- NCCI bundling table (30+ pairs)
- Profile synthesis engine
- Voice dictation with live CPT + compliance
- Job queue with timers
- Training case auto-save
- Billing accuracy tracker
- Custom profile creation/deletion
- All UI tabs (Dictate, Analyze, Cases, Library, Profile, Rules)

## BUILD ORDER
1. Initialize project: package.json, vite.config.js, electron configs
2. Data files: cptLibrary.js, ncciPairs.js, icd10.js, templates.js, complianceRules.js, surgeonProfiles.js
3. Core modules: storage.js, cptDetector.js, compliance.js, ncci.js, synthesizer.js
4. API module: analyzer.js (Claude API caller)
5. Electron: main.js, preload.js
6. React components: build from leaves up (shared → dictation → analysis → tabs → App)
7. Hooks: useSurgeon.js, useJobs.js, useStorage.js
8. Test: electron . to verify
9. Package: electron-builder to generate .exe

## COMMANDS TO RUN AFTER BUILD
```bash
cd "C:\Users\sapan\Documents\UMD Research\spinecpt-desktop"
npm install
npm run dev     # development with hot reload
npm run build   # package as .exe
```

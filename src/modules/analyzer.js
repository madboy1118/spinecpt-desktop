// Claude API caller + response parser

import { filterRelevantCodes } from './cptDetector.js';
import { buildPrompt } from './synthesizer.js';
import { countDocumentedLevels, validateAddonQuantities } from './levelValidator.js';

// Strip HPI/hospital course — only send the procedure note
export function extractProcedureNote(note) {
  const markers = ["DESCRIPTION OF PROCEDURE", "PROCEDURE IN DETAIL", "OPERATIVE NOTE", "PROCEDURE:", "TECHNIQUE:"];
  const endMarkers = ["HPI:", "HOSPITAL COURSE:", "Hospital Course:", "HISTORY OF PRESENT", "REASONS FOR ADMISSION", "Reasons for Admission"];
  let text = note;
  for (const m of markers) {
    const idx = note.toUpperCase().indexOf(m.toUpperCase());
    if (idx !== -1) { text = note.slice(idx); break; }
  }
  for (const m of endMarkers) {
    const idx = text.indexOf(m);
    if (idx > 100) { text = text.slice(0, idx).trim(); break; }
  }
  return text;
}

// Main analysis function
export async function analyzeNote({ noteText, prof, styleMem, editPrefs, training, savedCases, editHist, billingCorrections }) {
  const relevantCPT = filterRelevantCodes(noteText);
  const ctx = Object.entries(relevantCPT)
    .map(([cat, codes]) => `## ${cat}\n${codes.map(co => `${co.c}: ${co.d} (${co.v} RVU)${co.a ? " [ADD-ON]" : ""} | ${co.r}`).join("\n")}`)
    .join("\n\n");

  const systemPrompt = buildPrompt(prof, styleMem, editPrefs, training, savedCases, editHist, billingCorrections) + "\n\nRELEVANT CPT CODES:\n" + ctx;

  const payload = {
    model: "claude-opus-4-20250514",
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{
      role: "user",
      content: `Analyze this spine operative note. Focus on the DESCRIPTION OF PROCEDURE section for coding. The full note header (diagnoses, procedures listed, findings) provides context. Return ONLY valid JSON \u2014 no markdown fences, no preamble text.\n\n---\n${noteText}\n---`
    }]
  };

  let data;

  // Use Electron IPC if available, otherwise fall back to fetch proxy
  if (window.electronAPI?.analyze) {
    data = await window.electronAPI.analyze(payload);
  } else {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      await res.text().catch(() => "");
      const errMsg = `API returned HTTP ${res.status}. ${res.status === 429 ? "Rate limited \u2014 wait and retry." : res.status === 401 ? "Authentication error." : "Check console."}`;
      throw new Error(errMsg);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("json")) {
      await res.text().catch(() => "");
      throw new Error(`Server returned ${contentType || "unknown"} instead of JSON \u2014 try again.`);
    }

    data = await res.json();
  }

  if (data.error) {
    throw new Error(`API error: ${data.error.message || JSON.stringify(data.error)}`);
  }
  if (!data.content || data.content.length === 0) {
    throw new Error("Empty response \u2014 try shorter note.");
  }

  const txt = data.content.map(i => i.text || "").join("") || "";
  let cleanTxt = txt.replace(/```json|```/g, "").trim();

  // Fix truncated JSON
  if (data.stop_reason === "max_tokens" || (data.stop_reason === "end_turn" && !cleanTxt.endsWith("}"))) {
    let opens = 0, closeBrackets = 0;
    for (const ch of cleanTxt) {
      if (ch === "{") opens++;
      if (ch === "}") opens--;
      if (ch === "[") closeBrackets++;
      if (ch === "]") closeBrackets--;
    }
    cleanTxt = cleanTxt.replace(/,\s*$/, "");
    while (closeBrackets > 0) { cleanTxt += "]"; closeBrackets--; }
    while (opens > 0) { cleanTxt += "}"; opens--; }
  }

  try {
    const parsed = JSON.parse(cleanTxt);

    // Post-processing: validate add-on code quantities against documented levels
    // Only run if note has meaningful level documentation (avoids false positives on short notes)
    const docLevels = countDocumentedLevels(noteText);
    if (docLevels.levelCount >= 2) {
      const levelWarnings = validateAddonQuantities(parsed.identified_codes, docLevels);
      if (levelWarnings.length > 0) {
        parsed.level_warnings = levelWarnings;
        parsed.bundling_warnings = [...(parsed.bundling_warnings || []), ...levelWarnings.map(w => w.message)];
      }
    }
    parsed._documented_levels = docLevels;

    // Attach usage metadata for cost tracking
    parsed._usage = {
      input_tokens: data.usage?.input_tokens || 0,
      output_tokens: data.usage?.output_tokens || 0,
      model: data.model || payload.model || "unknown",
      timestamp: Date.now(),
    };
    return parsed;
  } catch {
    throw new Error("Response wasn't valid JSON \u2014 try shorter note.");
  }
}

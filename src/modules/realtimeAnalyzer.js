// Lightweight Claude call for real-time feedback during dictation
// Uses a much shorter prompt and requests minimal JSON (~1024 tokens)

import { filterRelevantCodes } from './cptDetector.js';

export async function realtimeAnalyze({ noteText, templateId, prof, abortSignal }) {
  const relevantCPT = filterRelevantCodes(noteText);
  const codeList = Object.values(relevantCPT).flat()
    .map(co => `${co.c}: ${co.d} (${co.v} RVU)`)
    .slice(0, 40)
    .join("\n");

  const systemPrompt = `You are a spine surgery documentation assistant providing REAL-TIME feedback as a surgeon dictates.
Surgeon: ${prof?.name || "Unknown"} | Focus: ${prof?.focus || "Spine"}

Relevant CPT codes:
${codeList}

Return ONLY valid JSON (no markdown fences). Be concise. Focus on what's MISSING, not what's present.`;

  const payload = {
    model: "claude-opus-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{
      role: "user",
      content: `Analyze this in-progress operative note dictation. Identify preliminary CPT codes, missing documentation elements, and give an estimated grade. Return JSON:
{"preliminary_codes":[{"code":"XXXXX","description":"...","confidence":0.0,"rvu":0.0}],"missing_elements":[{"element":"...","priority":"high|medium|low","suggestion":"..."}],"estimated_grade":"A|B|C|D|F","section_coverage":{"Section Name":"complete|partial|missing"},"inline_prompts":[{"message":"...","priority":"high|medium"}]}

Note so far:
---
${noteText.slice(0, 4000)}
---`
    }]
  };

  let data;
  if (window.electronAPI?.analyze) {
    // Check if already aborted before starting IPC call
    if (abortSignal?.aborted) throw new DOMException("Aborted", "AbortError");
    const resultPromise = window.electronAPI.analyze(payload);
    // Race the IPC call against the abort signal
    if (abortSignal) {
      data = await Promise.race([
        resultPromise,
        new Promise((_, reject) => {
          abortSignal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
        }),
      ]);
    } else {
      data = await resultPromise;
    }
  } else {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: abortSignal,
    });
    data = await res.json();
  }

  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  if (!data.content?.length) return null;

  const txt = data.content.map(i => i.text || "").join("").replace(/```json|```/g, "").trim();

  // Fix truncated JSON
  let clean = txt;
  let opens = 0, brackets = 0;
  for (const ch of clean) {
    if (ch === "{") opens++;
    if (ch === "}") opens--;
    if (ch === "[") brackets++;
    if (ch === "]") brackets--;
  }
  clean = clean.replace(/,\s*$/, "");
  while (brackets > 0) { clean += "]"; brackets--; }
  while (opens > 0) { clean += "}"; opens--; }

  try {
    const parsed = JSON.parse(clean);
    parsed._usage = {
      input_tokens: data.usage?.input_tokens || 0,
      output_tokens: data.usage?.output_tokens || 0,
      model: data.model || payload.model,
      timestamp: Date.now(),
    };
    return parsed;
  } catch (e) {
    console.warn("Real-time analysis: invalid JSON response", e.message, clean.slice(0, 200));
    return null;
  }
}

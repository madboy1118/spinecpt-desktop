import { useState, useEffect } from 'react';
import { X, ft, mn } from '../theme.js';
import { ld, sv } from '../modules/storage.js';

const VERSION = "1.0.0";

export { VERSION };

export default function SettingsTab() {
  const [anthropicKey, setAnthropicKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [ratePerRvu, setRatePerRvu] = useState(33.89);
  const [dictationEngine, setDictationEngine] = useState("realtime");
  const [chunkDuration, setChunkDuration] = useState(7);
  const [realtimeAnalysis, setRealtimeAnalysis] = useState(true);
  const [autoHeaders, setAutoHeaders] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings
    ld("settings-rate-per-rvu", 33.89).then(setRatePerRvu);
    ld("speech-engine", "realtime").then(setDictationEngine);
    ld("settings-chunk-duration", 7).then(setChunkDuration);
    ld("dictate-realtimeEnabled", true).then(setRealtimeAnalysis);
    ld("dictate-autoHeaders", true).then(setAutoHeaders);
    // API keys are in .env, not in storage — show masked
    if (window.electronAPI?.checkApiStatus) {
      window.electronAPI.checkApiStatus().then(status => {
        setAnthropicKey(status?.hasApiKey ? "sk-ant-***configured***" : "");
      });
    }
  }, []);

  const saveSettings = async () => {
    await sv("settings-rate-per-rvu", ratePerRvu);
    await sv("speech-engine", dictationEngine);
    await sv("settings-chunk-duration", chunkDuration);
    await sv("dictate-realtimeEnabled", realtimeAnalysis);
    await sv("dictate-autoHeaders", autoHeaders);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (<div style={{ maxWidth: 600 }}>
    <div style={{ fontSize: 16, fontWeight: 700, color: X.t1, marginBottom: 4 }}>Settings</div>
    <div style={{ fontSize: 11, color: X.t3, marginBottom: 20 }}>Configure SpineCPT Pro preferences</div>

    {/* API Keys */}
    <Section title="API Keys" subtitle="Managed in .env file — restart app after changes">
      <Field label="Anthropic API Key (Claude Opus 4)" hint="Edit .env file to change">
        <input value={anthropicKey} disabled style={inputStyle({ disabled: true })} />
        <div style={{ fontSize: 10, color: anthropicKey ? X.g : X.r, marginTop: 4 }}>
          {anthropicKey ? "\u2713 Configured" : "\u2717 Not set — add ANTHROPIC_API_KEY to .env"}
        </div>
      </Field>
      <Field label="OpenAI API Key (Whisper / Realtime)" hint="Edit .env file to change">
        <input value={openaiKey || "Check .env file"} disabled style={inputStyle({ disabled: true })} />
      </Field>
      <div style={{ fontSize: 10, color: X.t4, padding: "8px 0", lineHeight: 1.6 }}>
        API keys are stored in <code style={{ fontFamily: mn, color: X.ac }}>.env</code> in the project root, not in the app. This keeps them out of the database and git history.
      </div>
    </Section>

    {/* Billing */}
    <Section title="Billing" subtitle="Configure RVU conversion rate">
      <Field label="$/RVU Rate" hint="Used for dollar calculations in analysis results">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: X.t3, fontSize: 14 }}>$</span>
          <input type="number" value={ratePerRvu} onChange={e => setRatePerRvu(parseFloat(e.target.value) || 0)} step="0.01"
            style={{ ...inputStyle({}), width: 100 }} />
          <span style={{ fontSize: 11, color: X.t4 }}>per wRVU</span>
        </div>
      </Field>
    </Section>

    {/* Dictation */}
    <Section title="Dictation" subtitle="Voice transcription preferences">
      <Field label="Transcription Engine">
        <select value={dictationEngine} onChange={e => setDictationEngine(e.target.value)}
          style={{ ...inputStyle({}), width: 200 }}>
          <option value="realtime">Realtime (OpenAI, low latency)</option>
          <option value="whisper">Whisper (OpenAI, chunk-based)</option>
          <option value="webspeech">Web Speech API (free, browser-only)</option>
        </select>
      </Field>
      <Field label="Auto-insert section headers">
        <Toggle checked={autoHeaders} onChange={setAutoHeaders} label="Insert template headers automatically during dictation" />
      </Field>
      <Field label="Live AI analysis during dictation">
        <Toggle checked={realtimeAnalysis} onChange={setRealtimeAnalysis} label="Run Claude analysis in background while dictating (uses API tokens)" />
      </Field>
    </Section>

    {/* Keyboard Shortcuts Reference */}
    <Section title="Keyboard Shortcuts" subtitle="Available throughout the app">
      <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "4px 12px" }}>
        {[
          ["Ctrl + Enter", "Analyze current note"],
          ["Ctrl + D", "Start/stop dictation"],
          ["Ctrl + N", "New note (clear editor)"],
          ["Ctrl + S", "Save to training"],
          ["Ctrl + Z", "Undo last action"],
          ["Ctrl + Shift + Z", "Redo last action"],
          ["Ctrl + K", "Search everywhere (command palette)"],
          ["Ctrl + C", "Copy (in final note view)"],
        ].map(([key, desc], i) => (
          <div key={i} style={{ display: "contents" }}>
            <kbd style={{ fontFamily: mn, fontSize: 11, color: X.ac, padding: "2px 6px", background: X.s3, borderRadius: 4, border: `1px solid ${X.b1}`, textAlign: "center" }}>{key}</kbd>
            <span style={{ fontSize: 11, color: X.t2, lineHeight: 2 }}>{desc}</span>
          </div>
        ))}
      </div>
    </Section>

    {/* Data & Backups */}
    <Section title="Data & Backups" subtitle="Auto-backup runs every 15 minutes">
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={async () => {
          const r = await window.electronAPI?.triggerBackup();
          if (r?.success) alert("Backup created successfully");
        }} style={{ padding: "6px 14px", borderRadius: 5, border: `1px solid ${X.b1}`, background: X.s2, color: X.t2, fontSize: 11, cursor: "pointer", fontFamily: ft }}>
          Backup Now
        </button>
        <button onClick={() => window.electronAPI?.exportSettings()} style={{ padding: "6px 14px", borderRadius: 5, border: `1px solid ${X.ac}40`, background: X.acD, color: X.ac, fontSize: 11, cursor: "pointer", fontFamily: ft }}>
          Export All Data
        </button>
        <button onClick={async () => {
          const r = await window.electronAPI?.importSettings();
          if (r?.success) { alert("Settings imported. Restart the app to apply."); }
          else if (r?.error) { alert("Import failed: " + r.error); }
        }} style={{ padding: "6px 14px", borderRadius: 5, border: `1px solid ${X.y}40`, background: X.yD, color: X.y, fontSize: 11, cursor: "pointer", fontFamily: ft }}>
          Import Data
        </button>
      </div>
      <div style={{ fontSize: 10, color: X.t4, marginTop: 8, lineHeight: 1.5 }}>
        Export saves all settings, cases, profiles, and learned data to a JSON file. Import overwrites current data (auto-backup created first).
      </div>
    </Section>

    {/* Save */}
    <div style={{ display: "flex", gap: 8, marginTop: 20, alignItems: "center" }}>
      <button onClick={saveSettings} style={{
        padding: "10px 28px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: ft,
        background: `linear-gradient(135deg,${X.ac},${X.p})`, color: X.bg, fontWeight: 700, fontSize: 13,
      }}>{saved ? "\u2713 Saved" : "Save Settings"}</button>
      <span style={{ fontSize: 10, color: X.t4 }}>Some changes require an app restart</span>
    </div>

    {/* Version footer */}
    <div style={{ marginTop: 32, paddingTop: 16, borderTop: `1px solid ${X.b1}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: X.t2 }}>SpineCPT Pro v{VERSION}</div>
        <div style={{ fontSize: 10, color: X.t4, marginTop: 2 }}>&copy; 2026 University of Maryland. All rights reserved.</div>
      </div>
      <div style={{ fontSize: 10, color: X.t4, textAlign: "right" }}>
        Claude Opus 4 &middot; 250 CPT codes &middot; 10 templates
      </div>
    </div>
  </div>);
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: 20, padding: 16, borderRadius: 10, background: X.s1, border: `1px solid ${X.b1}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: X.t1, marginBottom: 2 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 10, color: X.t4, marginBottom: 12 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: X.t2, marginBottom: 4 }}>{label}</div>
      {hint && <div style={{ fontSize: 9, color: X.t4, marginBottom: 4 }}>{hint}</div>}
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <div onClick={() => onChange(!checked)} style={{
        width: 36, height: 20, borderRadius: 10, padding: 2, cursor: "pointer",
        background: checked ? X.ac : X.s3, transition: "background 0.2s",
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: 8, background: "#fff",
          transform: checked ? "translateX(16px)" : "translateX(0)",
          transition: "transform 0.2s",
        }} />
      </div>
      <span style={{ fontSize: 11, color: X.t2 }}>{label}</span>
    </label>
  );
}

function inputStyle({ disabled } = {}) {
  return {
    padding: "8px 12px", borderRadius: 6, background: disabled ? X.s3 : X.s2,
    border: `1px solid ${X.b1}`, color: disabled ? X.t4 : X.t1,
    fontSize: 12, fontFamily: ft, outline: "none", boxSizing: "border-box",
  };
}

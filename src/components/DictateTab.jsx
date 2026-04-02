import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { X, ft, mn } from '../theme.js';
import { createDictation } from '../modules/dictation.js';
import { createWhisperDictation } from '../modules/whisperDictation.js';
import { createVoiceCommandProcessor, readBackText } from '../modules/voiceCommands.js';
import { detectCodes, computeDetectedRVU } from '../modules/cptDetector.js';
import { scoreCompliance } from '../modules/compliance.js';
import { validateNCCI } from '../data/ncciPairs.js';
import { useTemplateGuide } from '../hooks/useTemplateGuide.js';
import { useRealtimeAnalysis } from '../hooks/useRealtimeAnalysis.js';
import TEMPLATES from '../data/templates.js';
import VoiceButton from './dictation/VoiceButton.jsx';
import LiveEditor from './dictation/LiveEditor.jsx';
import ComplianceBar from './dictation/ComplianceBar.jsx';
import CPTSidebar from './dictation/CPTSidebar.jsx';
import TemplateGuide from './dictation/TemplateGuide.jsx';
import InlineSuggestions from './dictation/InlineSuggestions.jsx';
import NCCIWarnings from './dictation/NCCIWarnings.jsx';
import AutoSendCountdown from './dictation/AutoSendCountdown.jsx';
import VoiceCommandFeedback from './dictation/VoiceCommandFeedback.jsx';
import { ld, sv } from '../modules/storage.js';
import Tutorial from './Tutorial.jsx';

export default function DictateTab({ onSendToAnalyze, prof }) {
  const [noteText, setNoteText] = useState("");
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [engine, setEngine] = useState("webspeech");
  const [autoHeaders, setAutoHeaders] = useState(true);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialChecked, setTutorialChecked] = useState(false);
  const [restored, setRestored] = useState(false);

  const dictRef = useRef(null);
  const segmentHistory = useRef([]); // for undo
  const cursorPos = useRef(0); // track cursor for insert-at-cursor
  const saveTimer = useRef(null);

  // Restore session state + load preferences
  useEffect(() => {
    ld("speech-engine", "webspeech").then(setEngine);
    ld("spinecpt-tutorial-seen", false).then(seen => {
      if (!seen) setShowTutorial(true);
      setTutorialChecked(true);
    });
    // Restore dictation session
    Promise.all([
      ld("dictate-noteText", ""),
      ld("dictate-template", null),
      ld("dictate-autoHeaders", true),
      ld("dictate-realtimeEnabled", true),
    ]).then(([text, templateId, ah, rt]) => {
      if (text) setNoteText(text);
      if (templateId) setSelectedTemplate(TEMPLATES.find(t => t.id === templateId) || null);
      setAutoHeaders(ah);
      setRealtimeEnabled(rt);
      setRestored(true);
    });
  }, []);

  // Reset cursor position when template changes
  useEffect(() => { cursorPos.current = noteText.length; }, [selectedTemplate]);

  // Persist noteText (debounced)
  useEffect(() => {
    if (!restored) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => sv("dictate-noteText", noteText), 500);
    return () => clearTimeout(saveTimer.current);
  }, [noteText, restored]);

  // Persist settings
  useEffect(() => { if (restored) sv("dictate-template", selectedTemplate?.id || null); }, [selectedTemplate]);
  useEffect(() => { if (restored) sv("dictate-autoHeaders", autoHeaders); }, [autoHeaders]);
  useEffect(() => { if (restored) sv("dictate-realtimeEnabled", realtimeEnabled); }, [realtimeEnabled]);

  // Keyword-based detection (instant, no API)
  const matches = noteText.trim() ? detectCodes(noteText) : [];
  const totalRvu = computeDetectedRVU(matches);
  const compliance = noteText.trim() ? scoreCompliance(noteText) : { score: 0, results: [] };

  // Real-time AI analysis hook (must be before templateGuide which uses its results)
  const { result: realtimeResult, isAnalyzing: realtimeAnalyzing, triggerNow } = useRealtimeAnalysis(
    noteText,
    {
      enabled: realtimeEnabled && noteText.trim().split(/\s+/).length >= 30,
      debounceMs: 10000,
      minWords: 30,
      templateId: selectedTemplate?.id,
      prof,
    }
  );

  // NCCI bundling validation (combine keyword + AI detected codes)
  const allDetectedCodes = [...matches, ...(realtimeResult?.preliminary_codes || [])];
  const ncciWarnings = allDetectedCodes.length > 0 ? validateNCCI(allDetectedCodes) : [];

  // Template guide hook
  const templateGuide = useTemplateGuide(
    noteText,
    selectedTemplate,
    realtimeResult?.section_coverage
  );

  // Voice command processor — use refs to avoid recreating on every noteText change
  const noteTextRef = useRef(noteText);
  noteTextRef.current = noteText;
  const templateGuideRef = useRef(templateGuide);
  templateGuideRef.current = templateGuide;

  const commandProcessor = useMemo(() => createVoiceCommandProcessor({
    nextSection: () => {
      templateGuideRef.current.advanceSection();
      setLastCommand({ command: "nextSection", label: "Next Section", ts: Date.now() });
    },
    goBack: () => {
      templateGuideRef.current.goBack();
      setLastCommand({ command: "goBack", label: "Previous Section", ts: Date.now() });
    },
    readBack: () => {
      readBackText(noteTextRef.current);
      setLastCommand({ command: "readBack", label: "Reading Back...", ts: Date.now() });
    },
    done: () => {
      handleStop();
      if (noteTextRef.current.trim().split(/\s+/).length >= 20) {
        setShowCountdown(true);
      }
      setLastCommand({ command: "done", label: "Done", ts: Date.now() });
    },
    undo: () => {
      const last = segmentHistory.current.pop();
      if (last) setNoteText(prev => prev.slice(0, prev.length - last.length).trimEnd() + " ");
      setLastCommand({ command: "undo", label: "Undone", ts: Date.now() });
    },
    pause: () => {
      handleStop();
      setLastCommand({ command: "pause", label: "Paused", ts: Date.now() });
    },
  }), []); // stable — reads current values from refs

  // Check Whisper support
  const whisperSupported = !!(window.electronAPI?.transcribeWhisper);
  const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const createEngine = useCallback((eng) => {
    const onResult = ({ final, interim: int }) => {
      if (final) {
        // Run through voice command processor first
        const { isCommand, cleanText } = commandProcessor.process(final);
        if (!isCommand && cleanText) {
          segmentHistory.current.push(cleanText);
          if (segmentHistory.current.length > 100) segmentHistory.current.shift();
          setNoteText(prev => {
            // Insert at cursor position if user has been typing mid-note
            const pos = cursorPos.current;
            if (pos > 0 && pos < prev.length) {
              cursorPos.current = pos + cleanText.length;
              return prev.slice(0, pos) + cleanText + prev.slice(pos);
            }
            cursorPos.current = prev.length + cleanText.length;
            return prev + cleanText;
          });
        }
      }
      setInterim(int);
    };

    if (eng === "whisper" && whisperSupported) {
      return createWhisperDictation({
        onResult, onEnd: () => setListening(false),
        onError: (err) => console.error("Whisper error:", err),
        chunkDurationMs: 5000,
      });
    }
    return createDictation({
      onResult, onEnd: () => setListening(false),
      onError: (err) => console.error("Dictation error:", err),
    });
  }, [commandProcessor, whisperSupported]);

  const handleStart = useCallback(() => {
    // Insert template header for current section if auto-headers enabled
    if (autoHeaders && selectedTemplate && templateGuide.sections[templateGuide.currentSectionIndex]) {
      const sec = templateGuide.sections[templateGuide.currentSectionIndex];
      const header = `\n${sec.title.toUpperCase()}:\n`;
      if (!noteText.includes(sec.title.toUpperCase() + ":")) {
        setNoteText(prev => (prev.trim() ? prev.trim() + "\n" : "") + header);
      }
    }

    if (!dictRef.current || dictRef.current._engine !== engine) {
      dictRef.current = createEngine(engine);
      dictRef.current._engine = engine;
    }
    dictRef.current.start();
    setListening(true);
    setShowCountdown(false);
  }, [engine, createEngine, autoHeaders, selectedTemplate, templateGuide, noteText]);

  const handleStop = useCallback(() => {
    dictRef.current?.stop();
    setListening(false);
    setInterim("");
  }, []);

  const handleToggleEngine = useCallback(() => {
    const newEngine = engine === "whisper" ? "webspeech" : "whisper";
    setEngine(newEngine);
    sv("speech-engine", newEngine);
    if (listening) {
      handleStop();
    }
    dictRef.current = null; // force recreate on next start
  }, [engine, listening, handleStop]);

  const insertAllHeaders = () => {
    if (!selectedTemplate) return;
    const headers = selectedTemplate.sections.map(s => `${s.title.toUpperCase()}:\n`).join("\n\n");
    setNoteText(prev => headers + "\n" + prev);
  };

  // Auto-insert header when section advances (if enabled)
  const prevSectionIdx = useRef(templateGuide.currentSectionIndex);
  useEffect(() => {
    if (!autoHeaders || !selectedTemplate) return;
    if (templateGuide.currentSectionIndex !== prevSectionIdx.current && listening) {
      const sec = templateGuide.sections[templateGuide.currentSectionIndex];
      if (sec && !noteText.includes(sec.title.toUpperCase() + ":")) {
        setNoteText(prev => prev.trimEnd() + `\n\n${sec.title.toUpperCase()}:\n`);
      }
    }
    prevSectionIdx.current = templateGuide.currentSectionIndex;
  }, [templateGuide.currentSectionIndex, autoHeaders, selectedTemplate, listening]);

  const handleSendToAnalyze = useCallback((auto = false) => {
    setShowCountdown(false);
    sv("dictate-noteText", ""); // clear draft after sending
    onSendToAnalyze?.(noteText, { autoAnalyze: auto });
  }, [noteText, onSendToAnalyze]);

  const wordCount = noteText.split(/\s+/).filter(Boolean).length;

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
        <VoiceButton
          listening={listening} onStart={handleStart} onStop={handleStop}
          supported={!!SpeechRecognition || whisperSupported}
          engine={engine} onToggleEngine={handleToggleEngine}
          whisperSupported={whisperSupported}
        />
        <select
          value={selectedTemplate?.id || ""}
          onChange={e => setSelectedTemplate(TEMPLATES.find(t => t.id === e.target.value) || null)}
          style={{ padding: "8px 12px", borderRadius: 6, background: X.s2, border: `1px solid ${X.b1}`, color: X.t1, fontSize: 12, fontFamily: ft, outline: "none" }}
        >
          <option value="">No template</option>
          {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        {/* Real-time analysis toggle */}
        <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 10, color: realtimeEnabled ? X.ac : X.t4 }}>
          <input type="checkbox" checked={realtimeEnabled} onChange={e => setRealtimeEnabled(e.target.checked)}
            style={{ width: 12, height: 12, accentColor: X.ac }} />
          Live AI
        </label>

        {wordCount > 0 && (
          <span style={{ fontSize: 11, color: X.t3 }}>{wordCount} words</span>
        )}

        {realtimeResult?.estimated_grade && (
          <span style={{
            fontSize: 14, fontWeight: 800, padding: "2px 8px", borderRadius: 4,
            background: realtimeResult.estimated_grade === "A" ? X.gD : realtimeResult.estimated_grade === "B" ? X.acD : realtimeResult.estimated_grade === "C" ? X.yD : X.rD,
            color: realtimeResult.estimated_grade === "A" ? X.g : realtimeResult.estimated_grade === "B" ? X.ac : realtimeResult.estimated_grade === "C" ? X.y : X.r,
          }}>{realtimeResult.estimated_grade}</span>
        )}
        {realtimeAnalyzing && (
          <span style={{ fontSize: 9, color: X.p, fontWeight: 600, animation: "pulse 1.5s infinite" }}>analyzing...</span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => setShowTutorial(true)} style={{
            padding: "6px 12px", borderRadius: 5, border: `1px solid ${X.b1}`,
            background: "transparent", color: X.t3, fontSize: 10, cursor: "pointer", fontFamily: ft,
          }}>? Tutorial</button>
          {wordCount >= 20 && !listening && (
            <button onClick={() => setShowCountdown(true)} style={{
              padding: "8px 20px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: ft,
              background: `linear-gradient(135deg,${X.ac},${X.p})`, color: X.bg, fontWeight: 700, fontSize: 12,
            }}>Send to Analyze</button>
          )}
          {wordCount >= 20 && !listening && (
            <button onClick={() => handleSendToAnalyze(true)} style={{
              padding: "8px 16px", borderRadius: 6, border: `1px solid ${X.ac}40`, cursor: "pointer", fontFamily: ft,
              background: X.acD, color: X.ac, fontWeight: 600, fontSize: 11,
            }}>Auto-Analyze</button>
          )}
        </div>
      </div>

      {/* Main layout: Editor + Sidebar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}>
        {/* Left: Editor + Template Guide */}
        <div>
          <LiveEditor value={noteText} onChange={(val) => { segmentHistory.current = []; setNoteText(val); }} interim={interim} listening={listening} onCursorPosition={pos => { cursorPos.current = pos; }} />

          {/* Template Guide (below editor) */}
          {selectedTemplate && (
            <div style={{ marginTop: 10 }}>
              <TemplateGuide
                sections={templateGuide.sections}
                currentSectionIndex={templateGuide.currentSectionIndex}
                progress={templateGuide.progress}
                allRequiredComplete={templateGuide.allRequiredComplete}
                onAdvance={templateGuide.advanceSection}
                onGoBack={templateGuide.goBack}
                onGoToSection={templateGuide.goToSection}
                onInsertHeaders={insertAllHeaders}
                autoHeaders={autoHeaders}
                onToggleAutoHeaders={() => setAutoHeaders(!autoHeaders)}
              />
            </div>
          )}

          {/* Voice commands hint */}
          {listening && (
            <div style={{ marginTop: 8, padding: "6px 12px", borderRadius: 6, background: X.s2, border: `1px solid ${X.b1}` }}>
              <div style={{ fontSize: 9, color: X.t4, fontWeight: 600, marginBottom: 2 }}>VOICE COMMANDS</div>
              <div style={{ fontSize: 10, color: X.t3, lineHeight: 1.6 }}>
                "next section" {"\u00b7"} "go back" {"\u00b7"} "read that back" {"\u00b7"} "scratch that" {"\u00b7"} "I'm done" {"\u00b7"} "pause"
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <ComplianceBar score={compliance.score} results={compliance.results} />

          <CPTSidebar
            matches={matches}
            totalRvu={totalRvu}
            aiCodes={realtimeResult?.preliminary_codes}
            isAnalyzing={realtimeAnalyzing}
          />

          <NCCIWarnings warnings={ncciWarnings} />

          <InlineSuggestions
            complianceResults={compliance.results}
            aiMissingElements={realtimeResult?.missing_elements}
            aiInlinePrompts={realtimeResult?.inline_prompts}
            sectionCoverage={realtimeResult?.section_coverage}
            template={selectedTemplate}
          />
        </div>
      </div>

      {/* Auto-send countdown toast */}
      {showCountdown && (
        <AutoSendCountdown
          seconds={5}
          onSend={() => handleSendToAnalyze(true)}
          onCancel={() => setShowCountdown(false)}
        />
      )}

      {/* Voice command feedback toast */}
      {lastCommand && (
        <VoiceCommandFeedback
          key={lastCommand.ts}
          command={lastCommand.command}
          label={lastCommand.label}
        />
      )}

      {/* Tutorial overlay — shows on first visit or when "? Tutorial" clicked */}
      {showTutorial && (
        <Tutorial forceShow={true} onClose={() => setShowTutorial(false)} />
      )}
    </div>
  );
}

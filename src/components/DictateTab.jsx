import { useState, useRef, useCallback, useMemo, useEffect, useDeferredValue } from 'react';
import { X, ft } from '../theme.js';
import { createDictation } from '../modules/dictation.js';
import { createWhisperFlowDictation } from '../modules/whisperFlowDictation.js';
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

function normalizeEnginePreference(value) {
  if (value === "whisper" || value === "realtime" || value === "local") return "whisperflow";
  return value || "webspeech";
}

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
  const [dictationError, setDictationError] = useState("");
  const [whisperFlowStatus, setWhisperFlowStatus] = useState({ available: false, baseUrl: "http://127.0.0.1:8181", wsUrl: "ws://127.0.0.1:8181/ws", error: "" });
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialChecked, setTutorialChecked] = useState(false);
  const [restored, setRestored] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const deferredNoteText = useDeferredValue(noteText);

  const dictRef = useRef(null);
  const segmentHistory = useRef([]); // for undo
  const cursorPos = useRef(0); // track cursor for insert-at-cursor
  const saveTimer = useRef(null);

  // Restore session state + load preferences
  useEffect(() => {
    ld("speech-engine", "webspeech").then((value) => setEngine(normalizeEnginePreference(value)));
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

  useEffect(() => {
    if (!window.electronAPI?.getWhisperFlowStatus) return undefined;

    let active = true;
    const refresh = () => {
      window.electronAPI.getWhisperFlowStatus()
        .then((status) => {
          if (active && status) setWhisperFlowStatus(status);
        })
        .catch(() => {});
    };

    refresh();
    const timer = setInterval(refresh, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  // Reset cursor position when template changes
  useEffect(() => {
    cursorPos.current = noteText.length;
    setCursorPosition(noteText.length);
  }, [selectedTemplate]);

  useEffect(() => {
    if (!restored) return;
    cursorPos.current = noteText.length;
    setCursorPosition(noteText.length);
  }, [restored]);

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
  const matches = deferredNoteText.trim() ? detectCodes(deferredNoteText) : [];
  const totalRvu = computeDetectedRVU(matches);
  const compliance = deferredNoteText.trim() ? scoreCompliance(deferredNoteText) : { score: 0, results: [] };

  // Real-time AI analysis hook (must be before templateGuide which uses its results)
  const { result: realtimeResult, isAnalyzing: realtimeAnalyzing, triggerNow } = useRealtimeAnalysis(
    deferredNoteText,
    {
      enabled: realtimeEnabled && !listening && deferredNoteText.trim().split(/\s+/).length >= 30,
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

  // Check engine support. In Electron, WhisperFlow is the local low-latency path.
  const isElectron = !!window.electronAPI;
  const whisperFlowSupported = !!(window.electronAPI?.getWhisperFlowStatus && whisperFlowStatus.available);
  const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const webSpeechWorks = !!SpeechRecognition && !isElectron;

  // Auto-select WhisperFlow dictation in Electron if available
  useEffect(() => {
    if (isElectron && whisperFlowSupported && engine === "webspeech") {
      setEngine("whisperflow");
      sv("speech-engine", "whisperflow");
    }
  }, [isElectron, whisperFlowSupported, engine]);

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
              const nextPos = pos + cleanText.length;
              cursorPos.current = nextPos;
              setCursorPosition(nextPos);
              return prev.slice(0, pos) + cleanText + prev.slice(pos);
            }
            const nextPos = prev.length + cleanText.length;
            cursorPos.current = nextPos;
            setCursorPosition(nextPos);
            return prev + cleanText;
          });
        }
      }
      setInterim(int);
      if (int || final) setDictationError("");
    };

    if (eng === "whisperflow" && whisperFlowSupported) {
      return createWhisperFlowDictation({
        onResult, onEnd: () => { setListening(false); setAudioLevel(0); },
        onError: (err) => {
          setDictationError(err);
          setListening(false);
          setAudioLevel(0);
          console.error("WhisperFlow dictation error:", err);
        },
        onAudioLevel: setAudioLevel,
        wsUrl: whisperFlowStatus.wsUrl,
      });
    }
    if (eng === "whisperflow") {
      return {
        supported: false,
        start: () => {
          const detail = whisperFlowStatus.error ? `: ${whisperFlowStatus.error}` : "";
          const message = `WhisperFlow unavailable${detail}`;
          setDictationError(message);
          return false;
        },
        stop: () => {},
        isListening: () => false,
      };
    }
    return createDictation({
      onResult, onEnd: () => setListening(false),
      onError: (err) => {
        setDictationError(err);
        setListening(false);
        console.error("Dictation error:", err);
      },
    });
  }, [commandProcessor, whisperFlowSupported, whisperFlowStatus.error, whisperFlowStatus.wsUrl]);

  const handleStart = useCallback(async () => {
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
    setDictationError("");
    const started = await dictRef.current.start();
    if (!started) {
      setListening(false);
      return;
    }
    setListening(true);
    setShowCountdown(false);
  }, [engine, createEngine, autoHeaders, selectedTemplate, templateGuide, noteText]);

  const handleStop = useCallback(() => {
    setListening(false);
    setInterim("");
    dictRef.current?.stop();
  }, []);

  const handleToggleEngine = useCallback(() => {
    const newEngine = engine === "whisperflow" ? "webspeech" : "whisperflow";
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
  const previewCursor = Math.max(0, Math.min(cursorPosition, noteText.length));
  const previewSegments = interim ? {
    before: noteText.slice(0, previewCursor),
    interim,
    after: noteText.slice(previewCursor),
  } : null;

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
        <VoiceButton
          listening={listening} onStart={handleStart} onStop={handleStop}
          supported={whisperFlowSupported || webSpeechWorks}
          engine={engine} onToggleEngine={handleToggleEngine}
          whisperFlowSupported={whisperFlowSupported}
        />
        {isElectron && !whisperFlowSupported && (
          <span style={{ fontSize: 10, color: X.y, background: X.yD, padding: "3px 8px", borderRadius: 4 }}>
            WhisperFlow unavailable{whisperFlowStatus.error ? `: ${whisperFlowStatus.error}` : ""}
          </span>
        )}
        {dictationError && (
          <span style={{ fontSize: 10, color: X.r, background: X.rD, padding: "3px 8px", borderRadius: 4 }}>
            {dictationError}
          </span>
        )}
        {/* Audio level meter */}
        {listening && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 20 }}>
              {[0.01, 0.02, 0.03, 0.05, 0.07, 0.09, 0.12, 0.16, 0.2].map((threshold, i) => (
                <div key={i} style={{
                  width: 3, borderRadius: 1,
                  height: 4 + i * 2,
                  background: audioLevel > threshold ? (i < 5 ? X.g : i < 7 ? X.y : X.r) : X.s3,
                  transition: "background 0.05s",
                }} />
              ))}
            </div>
            <span style={{ fontSize: 9, color: audioLevel > 0.02 ? X.g : X.r, fontWeight: 600 }}>
              {audioLevel > 0.02 ? "MIC OK" : "NO INPUT"}
            </span>
          </div>
        )}
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
        {listening && realtimeEnabled && (
          <span style={{ fontSize: 10, color: X.t4 }}>
            AI paused while dictating
          </span>
        )}

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
          <LiveEditor
            value={noteText}
            previewSegments={previewSegments}
            onChange={(val) => {
              segmentHistory.current = [];
              setNoteText(val);
            }}
            interim={interim}
            listening={listening}
            onCursorPosition={(pos) => {
              cursorPos.current = pos;
              setCursorPosition(pos);
            }}
          />

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

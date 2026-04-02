import { useState, useEffect } from 'react';
import { X, ft, mn } from '../theme.js';
import { ld, sv } from '../modules/storage.js';

const STEPS = [
  {
    title: "Welcome to SpineCPT Pro",
    content: "This tool helps you create optimized operative notes with accurate CPT coding. You can dictate, type, or do both — the system works with your natural workflow.",
    icon: "S",
    highlight: null,
  },
  {
    title: "Step 1: Pick a Template",
    content: "Select a procedure template from the dropdown. The system will guide you through each section (indications, approach, decompression, instrumentation, etc.) and track your progress as you dictate.",
    icon: "1",
    highlight: "template",
    tips: ["Templates auto-insert section headers as you advance", "You can skip sections or go in any order"],
  },
  {
    title: "Step 2: Dictate Your Note",
    content: "Hit \"Start Dictation\" and speak naturally. The system transcribes in real-time. You can pause at any time to type corrections or additions — both voice and keyboard work simultaneously.",
    icon: "2",
    highlight: "dictate",
    tips: [
      "Speak naturally — don't spell out punctuation",
      "Click anywhere in the note to position your cursor, then resume dictating — text inserts at the cursor",
      "Use voice commands: \"next section\", \"go back\", \"scratch that\", \"read that back\"",
    ],
  },
  {
    title: "Step 3: Watch the Sidebar",
    content: "As you dictate, the right sidebar updates in real-time with compliance scoring, detected CPT codes, and suggestions for missing documentation. The AI analyzer runs periodically to give you a preliminary grade.",
    icon: "3",
    highlight: "sidebar",
    tips: [
      "Green items = documented. Red items = still needed.",
      "The \"Missing Documentation\" panel shows exactly what to add",
      "Your estimated grade updates as you cover more elements",
    ],
  },
  {
    title: "Step 4: Send to Full Analysis",
    content: "When you're done dictating, the note is automatically sent for deep analysis by the AI. It identifies every billable CPT code, suggests inline text edits in your voice, calculates RVU impact, and grades your documentation A through F.",
    icon: "4",
    highlight: "analyze",
    tips: [
      "Say \"I'm done\" to trigger auto-send",
      "Or click \"Send to Analyze\" / \"Auto-Analyze\" manually",
      "Review each suggested edit — accept or reject individually",
    ],
  },
  {
    title: "Step 5: Review & Copy",
    content: "On the Analyze tab, review the suggested edits, check the CPT codes, and accept the changes you agree with. The \"Final Note\" sub-tab gives you the optimized note ready to paste into your EMR.",
    icon: "5",
    highlight: "review",
    tips: [
      "\"Accept All\" applies every edit at once",
      "The RVU comparison shows the billing impact of the edits",
      "Click \"Save to Training\" to teach the system your preferences",
    ],
  },
  {
    title: "You're All Set",
    content: "The system learns your style, terminology, and coding patterns over time. The more notes you analyze, the more personalized the suggestions become. You can re-open this tutorial anytime from the Dictate tab.",
    icon: "\u2713",
    highlight: null,
  },
];

export default function Tutorial({ onClose, forceShow = false }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(forceShow);

  useEffect(() => {
    if (!forceShow) {
      ld("spinecpt-tutorial-seen", false).then(seen => {
        if (!seen) setVisible(true);
      });
    }
  }, [forceShow]);

  const handleClose = () => {
    setVisible(false);
    sv("spinecpt-tutorial-seen", true);
    onClose?.();
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleClose();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!visible) return null;

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.75)", zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, backdropFilter: "blur(4px)",
    }} onClick={handleClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: X.s1, border: `1px solid ${X.b2}`, borderRadius: 16,
        padding: 0, maxWidth: 520, width: "100%",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        overflow: "hidden",
      }}>
        {/* Progress dots */}
        <div style={{ padding: "16px 24px 0", display: "flex", gap: 6, justifyContent: "center" }}>
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{
              width: i === step ? 24 : 8, height: 8, borderRadius: 4, cursor: "pointer",
              background: i === step ? X.ac : i < step ? X.g : X.s3,
              transition: "all .3s",
            }} />
          ))}
        </div>

        {/* Icon */}
        <div style={{ display: "flex", justifyContent: "center", padding: "20px 0 8px" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: isLast ? `linear-gradient(135deg,${X.g},${X.ac})` : `linear-gradient(135deg,${X.ac},${X.p})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 24, color: X.bg,
          }}>{s.icon}</div>
        </div>

        {/* Content */}
        <div style={{ padding: "8px 28px 16px" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: X.t1, textAlign: "center", marginBottom: 8 }}>
            {s.title}
          </div>
          <div style={{ fontSize: 13, color: X.t2, lineHeight: 1.7, textAlign: "center", marginBottom: 12 }}>
            {s.content}
          </div>

          {/* Tips */}
          {s.tips && (
            <div style={{ padding: 12, borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}` }}>
              {s.tips.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "4px 0" }}>
                  <span style={{ color: X.ac, fontSize: 11, flexShrink: 0, marginTop: 1 }}>{"\u2022"}</span>
                  <span style={{ fontSize: 12, color: X.t3, lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{
          padding: "12px 24px 20px", display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}>
          <button onClick={handleClose} style={{
            padding: "8px 16px", borderRadius: 6, border: `1px solid ${X.b2}`,
            background: "transparent", color: X.t3, fontSize: 12, cursor: "pointer", fontFamily: ft,
          }}>Skip Tutorial</button>

          <div style={{ display: "flex", gap: 8 }}>
            {step > 0 && (
              <button onClick={handleBack} style={{
                padding: "8px 16px", borderRadius: 6, border: `1px solid ${X.b1}`,
                background: X.s2, color: X.t2, fontSize: 12, cursor: "pointer", fontFamily: ft,
              }}>{"\u2190"} Back</button>
            )}
            <button onClick={handleNext} style={{
              padding: "8px 24px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: ft,
              background: isLast ? `linear-gradient(135deg,${X.g},${X.ac})` : `linear-gradient(135deg,${X.ac},${X.p})`,
              color: X.bg, fontWeight: 700, fontSize: 13,
            }}>
              {isLast ? "Get Started" : `Next (${step + 1}/${STEPS.length})`}
            </button>
          </div>
        </div>

        {/* Keyboard hint */}
        <div style={{ padding: "0 24px 12px", textAlign: "center" }}>
          <span style={{ fontSize: 10, color: X.t4 }}>
            Use {"\u2190"} {"\u2192"} arrow keys to navigate {"\u00b7"} Esc to close
          </span>
        </div>
      </div>

      <style>{`@keyframes fadeScale{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

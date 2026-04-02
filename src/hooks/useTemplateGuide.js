import { useState, useEffect, useCallback, useRef } from 'react';

export function useTemplateGuide(noteText, template, sectionCoverage) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [manualOverride, setManualOverride] = useState(false);
  const prevAutoIdx = useRef(0);

  const sections = (template?.sections || []).map((s, i) => {
    const status = computeSectionStatus(noteText, s, sectionCoverage);
    return { ...s, index: i, status };
  });

  // Auto-advance: when current section becomes complete, move to next incomplete
  useEffect(() => {
    if (!template || manualOverride) return;
    const current = sections[currentIdx];
    if (current?.status === "complete") {
      const nextIncomplete = sections.findIndex((s, i) => i > currentIdx && s.status !== "complete");
      if (nextIncomplete !== -1 && nextIncomplete !== prevAutoIdx.current) {
        prevAutoIdx.current = nextIncomplete;
        setCurrentIdx(nextIncomplete);
      }
    }
  }, [noteText, template, currentIdx, manualOverride]);

  // Reset when template changes
  useEffect(() => {
    setCurrentIdx(0);
    setManualOverride(false);
    prevAutoIdx.current = 0;
  }, [template?.id]);

  const advanceSection = useCallback(() => {
    setManualOverride(false);
    setCurrentIdx(prev => Math.min(prev + 1, (template?.sections?.length || 1) - 1));
  }, [template]);

  const goBack = useCallback(() => {
    setManualOverride(true);
    setCurrentIdx(prev => Math.max(prev - 1, 0));
  }, []);

  const goToSection = useCallback((idx) => {
    setManualOverride(true);
    setCurrentIdx(idx);
  }, []);

  const currentPrompt = sections[currentIdx]?.prompt || "";
  const currentTitle = sections[currentIdx]?.title || "";
  const allRequiredComplete = sections.filter(s => s.required).every(s => s.status === "complete");
  const completedCount = sections.filter(s => s.status === "complete").length;
  const progress = sections.length > 0 ? Math.round((completedCount / sections.length) * 100) : 0;

  return {
    currentSectionIndex: currentIdx,
    sections,
    advanceSection,
    goBack,
    goToSection,
    currentPrompt,
    currentTitle,
    allRequiredComplete,
    completedCount,
    progress,
  };
}

function computeSectionStatus(noteText, section, sectionCoverage) {
  if (!noteText || !section) return "pending";

  const lower = noteText.toLowerCase();
  const titleLower = section.title.toLowerCase();
  const keywords = section.keywords || [];

  // Check if section header is present in the note
  const headerPresent = lower.includes(titleLower + ":") || lower.includes(titleLower.toUpperCase() + ":");

  // Count keyword matches
  const matched = keywords.filter(kw => lower.includes(kw.toLowerCase()));
  const matchRatio = keywords.length > 0 ? matched.length / keywords.length : 0;

  // Check AI section coverage if available
  const aiStatus = sectionCoverage?.[section.title];

  if (aiStatus === "complete" || (matchRatio >= 0.4 && matched.length >= 2)) return "complete";
  if (aiStatus === "partial" || (matchRatio >= 0.15 && matched.length >= 1)) return "partial";
  if (headerPresent) return "partial";
  return "pending";
}

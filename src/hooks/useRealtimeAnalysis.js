import { useState, useEffect, useRef, useCallback } from 'react';
import { realtimeAnalyze } from '../modules/realtimeAnalyzer.js';

export function useRealtimeAnalysis(noteText, { enabled = false, debounceMs = 10000, minWords = 30, templateId = null, prof = null } = {}) {
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzedWordCount, setLastAnalyzedWordCount] = useState(0);
  const [error, setError] = useState(null);

  const timeoutRef = useRef(null);
  const abortRef = useRef(null);
  const lastTextRef = useRef("");

  const wordCount = noteText ? noteText.split(/\s+/).filter(Boolean).length : 0;

  const runAnalysis = useCallback(async (text) => {
    if (!text || !prof) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await realtimeAnalyze({
        noteText: text,
        templateId,
        prof,
        abortSignal: abortRef.current.signal,
      });
      if (res) {
        setResult(res);
        setLastAnalyzedWordCount(text.split(/\s+/).filter(Boolean).length);
        lastTextRef.current = text;
      }
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [templateId, prof]);

  useEffect(() => {
    if (!enabled || wordCount < minWords) return;

    // Clear previous debounce
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // If significant new content (50+ new words), trigger sooner
    const wordDelta = wordCount - lastAnalyzedWordCount;
    const delay = wordDelta > 50 ? 3000 : debounceMs;

    timeoutRef.current = setTimeout(() => {
      // Only analyze if text actually changed meaningfully
      if (noteText !== lastTextRef.current && wordCount >= minWords) {
        runAnalysis(noteText);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [noteText, enabled, wordCount, minWords, debounceMs, lastAnalyzedWordCount, runAnalysis]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Manual trigger
  const triggerNow = useCallback(() => {
    if (noteText && wordCount >= minWords) runAnalysis(noteText);
  }, [noteText, wordCount, minWords, runAnalysis]);

  return { result, isAnalyzing, lastAnalyzedWordCount, error, triggerNow };
}

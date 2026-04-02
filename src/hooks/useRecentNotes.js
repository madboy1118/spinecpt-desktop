import { useState, useEffect, useCallback } from 'react';
import { ld, sv } from '../modules/storage.js';

const KEY = "spinecpt-recent-notes";
const MAX = 5;

export function useRecentNotes() {
  const [recentNotes, setRecentNotes] = useState([]);

  useEffect(() => { ld(KEY, []).then(setRecentNotes); }, []);

  const addRecentNote = useCallback(async (opNote, analysis, surgeonName) => {
    if (!opNote?.trim()) return;
    const entry = {
      id: Date.now(),
      snippet: opNote.slice(0, 100).replace(/\n/g, " ").trim(),
      surgeonName: surgeonName || "Unknown",
      grade: analysis?.overall_documentation_grade || "?",
      timestamp: Date.now(),
      opNote,
    };
    const updated = [entry, ...recentNotes.filter(n => n.snippet !== entry.snippet)].slice(0, MAX);
    setRecentNotes(updated);
    await sv(KEY, updated);
  }, [recentNotes]);

  return { recentNotes, addRecentNote };
}

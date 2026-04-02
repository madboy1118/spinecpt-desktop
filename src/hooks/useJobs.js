import { useState, useRef, useEffect, useCallback } from 'react';
import { ld, sv } from '../modules/storage.js';

const JOBS_KEY = "spinecpt-jobs";
const ACTIVE_JOB_KEY = "spinecpt-active-job";
const MAX_PERSISTED_JOBS = 100;

export function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [activeJobId, setActiveJobId] = useState(null);
  const jobIdRef = useRef(0);
  const [showQueue, setShowQueue] = useState(false);
  const [tick, setTick] = useState(0);
  const initDone = useRef(false);

  // Load persisted jobs on mount
  const initJobs = useCallback(async () => {
    const saved = await ld(JOBS_KEY, []);
    // Filter out any that were mid-run (stale from crash) — mark them as error
    const restored = saved.map(j => j.status === "running" ? { ...j, status: "error", error: "Interrupted — app was closed", endTime: j.startTime } : j);
    if (restored.length > 0) {
      setJobs(restored);
      jobIdRef.current = Math.max(...restored.map(j => j.id), 0);
    }
    const savedActive = await ld(ACTIVE_JOB_KEY, null);
    if (savedActive && restored.some(j => j.id === savedActive)) setActiveJobId(savedActive);
    initDone.current = true;
  }, []);

  // Persist jobs whenever they change (skip initial empty state)
  useEffect(() => {
    if (!initDone.current) return;
    // Only persist completed/errored jobs, not running ones' analysis (too large mid-stream)
    const toPersist = jobs.slice(0, MAX_PERSISTED_JOBS);
    sv(JOBS_KEY, toPersist);
  }, [jobs]);

  // Persist active job ID
  useEffect(() => {
    if (!initDone.current) return;
    sv(ACTIVE_JOB_KEY, activeJobId);
  }, [activeJobId]);

  // Live timer — tick every second while any job is running
  useEffect(() => {
    const hasRunning = jobs.some(j => j.status === "running");
    if (!hasRunning) return;
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, [jobs]);

  const fmtTime = (ms) => {
    if (!ms || ms < 0) return "\u2014";
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    return `${m}m ${s % 60}s`;
  };

  const fmtTimestamp = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const updateJob = (id, updates) => setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));

  const createJob = (noteText, surgeonId, surgeonName, options = {}) => {
    const { setActive = true } = options;
    const id = ++jobIdRef.current;
    const noteDx = noteText.slice(0, 80).replace(/\n/g, " ").trim();
    const newJob = {
      id, opNote: noteText, noteSnippet: noteDx, surgeonId, surgeonName,
      status: "running", analysis: null, error: null,
      startTime: Date.now(), endTime: null, accepted: [], rejected: [],
    };
    setJobs(prev => [newJob, ...prev]);
    if (setActive) setActiveJobId(id);
    return id;
  };

  const removeJob = (id) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    if (activeJobId === id) setActiveJobId(null);
  };

  const clearDoneJobs = () => setJobs(prev => prev.filter(j => j.status === "running"));

  return {
    jobs, activeJobId, setActiveJobId, showQueue, setShowQueue, tick,
    fmtTime, fmtTimestamp, updateJob, createJob, removeJob, clearDoneJobs, initJobs,
  };
}

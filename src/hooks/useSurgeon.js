import { useState, useCallback } from 'react';
import { ld, sv, del } from '../modules/storage.js';
import SURGEON_PROFILES from '../data/surgeonProfiles.js';

function derivePrefs(h) {
  if (!h || h.length < 3) return [];
  const p = [];
  const t = {};
  h.forEach(x => { if (!t[x.et]) t[x.et] = { a: 0, r: 0 }; x.ok ? t[x.et].a++ : t[x.et].r++; });
  Object.entries(t).forEach(([k, { a, r }]) => {
    const pct = a / (a + r);
    if (pct < .25) p.push(`Surgeon REJECTS most "${k}" edits \u2014 avoid.`);
    else if (pct > .8) p.push(`Surgeon ACCEPTS most "${k}" edits \u2014 prioritize.`);
    else p.push(`Surgeon accepts ~${Math.round(pct * 100)}% of "${k}" edits.`);
  });
  return p;
}

export function useSurgeon() {
  const [surgeon, setSurgeon] = useState("ludwig");
  const [prof, setProf] = useState({ name: "", focus: "" });
  const [styleMem, setStyleMem] = useState([]);
  const [editHist, setEditHist] = useState([]);
  const [editPrefs, setEditPrefs] = useState([]);
  const [cases, setCases] = useState(0);
  const [savedCases, setSavedCases] = useState([]);
  const [customProfiles, setCustomProfiles] = useState([]);
  const [billingCorrections, setBillingCorrections] = useState([]);

  const sk = (key) => `${surgeon}-${key}`;
  const getTraining = useCallback(() => SURGEON_PROFILES[surgeon] || null, [surgeon]);

  const allSurgeons = useCallback(() => {
    const list = Object.entries(SURGEON_PROFILES).map(([key, sp]) => ({ id: key, name: sp.name, builtin: true }));
    customProfiles.forEach(cp => list.push({ id: cp.id, name: cp.name, builtin: false }));
    return list;
  }, [customProfiles]);

  const loadSurgeon = async (s) => {
    const training = SURGEON_PROFILES[s];
    const p = await ld(`${s}-prof`, training ? { name: training.name, focus: training.focus } : { name: "", focus: "" });
    setProf(p);
    setStyleMem(await ld(`${s}-styl`, []));
    const eh = await ld(`${s}-ehist`, []);
    setEditHist(eh);
    setEditPrefs(derivePrefs(eh));
    setCases(await ld(`${s}-cases`, 0));
    setSavedCases(await ld(`${s}-tcases`, []));
    setBillingCorrections(await ld(`${s}-billing-corrections`, []));
  };

  const initSurgeon = async () => {
    const cp = await ld("custom-profiles", []);
    setCustomProfiles(cp);
    const s = await ld("active-surgeon", "ludwig");
    setSurgeon(s);
    await loadSurgeon(s);
  };

  const switchSurgeon = async (s) => {
    setSurgeon(s);
    await sv("active-surgeon", s);
    await loadSurgeon(s);
  };

  const createProfile = async (newName, newFocus) => {
    if (!newName.trim()) return false;
    const id = newName.trim().toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    if (SURGEON_PROFILES[id] || customProfiles.some(cp => cp.id === id)) {
      alert("A profile with that name already exists.");
      return false;
    }
    const entry = { id, name: newName.trim() };
    const updated = [...customProfiles, entry];
    setCustomProfiles(updated);
    await sv("custom-profiles", updated);
    await sv(`${id}-prof`, { name: newName.trim(), focus: newFocus.trim() });
    await switchSurgeon(id);
    return true;
  };

  const deleteProfile = async (id) => {
    if (!confirm(`Delete profile "${customProfiles.find(c => c.id === id)?.name}"? This removes all learned data.`)) return;
    const updated = customProfiles.filter(cp => cp.id !== id);
    setCustomProfiles(updated);
    await sv("custom-profiles", updated);
    try { await del(`${id}-prof`); } catch {}
    try { await del(`${id}-styl`); } catch {}
    try { await del(`${id}-ehist`); } catch {}
    try { await del(`${id}-cases`); } catch {}
    try { await del(`${id}-tcases`); } catch {}
    try { await del(`${id}-billing-corrections`); } catch {}
    if (surgeon === id) await switchSurgeon("ludwig");
  };

  const logEdit = async (et, ok) => {
    const u = [...editHist, { et, ok, ts: Date.now() }].slice(-300);
    setEditHist(u);
    setEditPrefs(derivePrefs(u));
    await sv(sk("ehist"), u);
  };

  const saveStyle = async (obs) => {
    if (!obs || obs.length === 0) return;
    const existing = [...styleMem];
    const newObs = [];
    obs.forEach(o => {
      const norm = o.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
      if (norm.length < 10) return;
      const normWords = new Set(norm.split(/\s+/));
      const isDupe = existing.some(e => {
        const eNorm = e.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
        const eWords = new Set(eNorm.split(/\s+/));
        const overlap = [...normWords].filter(w => eWords.has(w)).length;
        return overlap / Math.max(normWords.size, eWords.size) > 0.6;
      });
      if (!isDupe) { newObs.push(o); existing.push(o); }
    });
    if (newObs.length > 0) {
      const u = [...styleMem, ...newObs].slice(-60);
      setStyleMem(u);
      await sv(sk("styl"), u);
    }
  };

  const updateProf = async (newProf) => {
    setProf(newProf);
    await sv(sk("prof"), newProf);
  };

  const incrementCases = async () => {
    const n = cases + 1;
    setCases(n);
    await sv(sk("cases"), n);
  };

  const updateSavedCases = async (updated) => {
    setSavedCases(updated);
    await sv(sk("tcases"), updated);
  };

  const addBillingCorrection = async (correction) => {
    const updated = [...billingCorrections, correction].slice(-100);
    setBillingCorrections(updated);
    await sv(sk("billing-corrections"), updated);
  };

  const resetLearned = async () => {
    await sv(sk("styl"), []);
    await sv(sk("ehist"), []);
    await sv(sk("cases"), 0);
    await sv(sk("tcases"), []);
    setStyleMem([]);
    setEditHist([]);
    setEditPrefs([]);
    setCases(0);
    setSavedCases([]);
    await sv(sk("billing-corrections"), []);
    setBillingCorrections([]);
  };

  return {
    surgeon, prof, styleMem, editHist, editPrefs, cases, savedCases, customProfiles, billingCorrections,
    getTraining, allSurgeons, initSurgeon, switchSurgeon, createProfile, deleteProfile,
    logEdit, saveStyle, updateProf, incrementCases, updateSavedCases, resetLearned, addBillingCorrection, sk,
  };
}

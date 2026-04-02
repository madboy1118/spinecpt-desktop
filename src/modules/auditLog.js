import { ld, sv } from './storage.js';

const AUDIT_KEY = "spinecpt-audit-log";
const MAX_ENTRIES = 2000;

export async function logAuditEvent(action, userId, surgeonId, surgeonName, jobId, details) {
  const log = await ld(AUDIT_KEY, []);
  log.push({
    id: Date.now(),
    action,
    userId: userId || "unknown",
    surgeonId: surgeonId || "unknown",
    surgeonName: surgeonName || "Unknown",
    jobId: jobId || null,
    timestamp: Date.now(),
    details: details || {},
  });
  await sv(AUDIT_KEY, log.slice(-MAX_ENTRIES));
}

export async function loadAuditLog() {
  return ld(AUDIT_KEY, []);
}

export async function clearAuditLog() {
  await sv(AUDIT_KEY, []);
}

export function exportAuditLog(log, format = "json") {
  if (format === "csv") {
    const header = "timestamp,action,userId,surgeonId,surgeonName,jobId,details";
    const rows = log.map(e => {
      const ts = new Date(e.timestamp).toISOString();
      const details = JSON.stringify(e.details || {}).replace(/"/g, '""');
      return `${ts},${e.action},${e.userId},${e.surgeonId},${e.surgeonName},${e.jobId || ""},"${details}"`;
    });
    return [header, ...rows].join("\n");
  }
  return JSON.stringify(log, null, 2);
}

import { useState, useEffect } from 'react';
import { X, ft, mn } from '../theme.js';

export default function UpdateNotification() {
  const [status, setStatus] = useState("idle"); // idle | available | downloading | ready | error
  const [version, setVersion] = useState("");
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    api.onUpdateAvailable?.((info) => { setStatus("downloading"); setVersion(info.version); });
    api.onUpdateProgress?.((info) => { setProgress(info.percent); });
    api.onUpdateDownloaded?.((info) => { setStatus("ready"); setVersion(info.version); setDismissed(false); });
    api.onUpdateError?.(() => { setStatus("error"); });
  }, []);

  if (dismissed || status === "idle" || status === "error") return null;

  return (
    <div style={{
      padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
      background: status === "ready" ? X.gD : X.acD,
      borderBottom: `1px solid ${status === "ready" ? X.g : X.ac}30`,
      fontSize: 12,
    }}>
      {status === "downloading" && (
        <>
          <span style={{ color: X.ac, fontWeight: 600 }}>Downloading update v{version}...</span>
          <div style={{ width: 80, height: 4, background: X.s3, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: X.ac, borderRadius: 2, transition: "width .3s" }} />
          </div>
          <span style={{ color: X.t4, fontFamily: mn, fontSize: 10 }}>{progress}%</span>
        </>
      )}
      {status === "ready" && (
        <>
          <span style={{ color: X.g, fontWeight: 600 }}>Update v{version} ready</span>
          <button onClick={() => window.electronAPI?.installUpdate()} style={{
            padding: "4px 14px", borderRadius: 5, border: "none", cursor: "pointer", fontFamily: ft,
            background: X.g, color: X.bg, fontWeight: 700, fontSize: 11,
          }}>Restart Now</button>
          <button onClick={() => setDismissed(true)} style={{
            padding: "4px 10px", borderRadius: 5, border: `1px solid ${X.g}40`, background: "transparent",
            color: X.g, fontSize: 10, cursor: "pointer", fontFamily: ft,
          }}>Later</button>
        </>
      )}
    </div>
  );
}

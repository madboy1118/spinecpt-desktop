const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const WebSocket = require('ws');

require('dotenv').config();

let mainWindow;
let allowClose = false;

// ═══ REALTIME TRANSCRIPTION (OpenAI WebSocket) ═══
const realtimeTranscriptionSessions = new Map();
const REALTIME_URL = process.env.OPENAI_REALTIME_TRANSCRIPTION_URL || 'wss://api.openai.com/v1/realtime';
const REALTIME_MODEL = process.env.OPENAI_REALTIME_TRANSCRIPTION_MODEL || 'gpt-4o-transcribe';
const REALTIME_PROMPT = 'You are transcribing a spine surgeon dictating an operative note. Preserve medical terminology. Common terms: laminectomy, foraminotomy, facetectomy, pedicle screws, TLIF, PLIF, ACDF, decompression, stenosis, spondylolisthesis, corpectomy, kyphoplasty, interbody cage, neuromonitoring, EMG, fluoroscopy, Kerrison rongeur, ligamentum flavum, thecal sac, dura, nerve root, S2AI, posterolateral fusion, decortication, autograft, allograft.';
const WHISPER_FLOW_BASE_URL = (process.env.WHISPER_FLOW_BASE_URL || 'http://127.0.0.1:8181').replace(/\/+$/, '');

function getRealtimeSession(wcId) { return realtimeTranscriptionSessions.get(wcId) || null; }

function sendRealtimeEvent(session, event) {
  if (!session || session.sender.isDestroyed()) return;
  session.sender.send('realtime-transcription-event', { sessionToken: session.token, event });
}

function teardownRealtimeSession(session, { reason = 'closed', notify = true, closeSocket = true } = {}) {
  if (!session || session.disposed) return;
  session.disposed = true;
  realtimeTranscriptionSessions.delete(session.webContentsId);
  if (session.readyTimer) clearTimeout(session.readyTimer);
  if (session.closeTimer) clearTimeout(session.closeTimer);
  if (closeSocket && session.ws?.readyState < WebSocket.CLOSING) try { session.ws.close(); } catch {}
  if (notify) sendRealtimeEvent(session, { type: 'realtime.transcription.closed', reason });
}

function getWhisperFlowStatusPayload(overrides = {}) {
  const wsUrl = `${WHISPER_FLOW_BASE_URL.replace(/^http/i, 'ws')}/ws`;
  return {
    available: false,
    baseUrl: WHISPER_FLOW_BASE_URL,
    wsUrl,
    error: '',
    ...overrides,
  };
}

function startRealtimeSession(sender, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'paste-your-openai-key-here') {
    return Promise.resolve({ error: { message: 'OPENAI_API_KEY not set in .env' } });
  }
  const existing = getRealtimeSession(sender.id);
  if (existing) teardownRealtimeSession(existing, { reason: 'restarted', notify: false });

  return new Promise((resolve) => {
    const session = { webContentsId: sender.id, sender, token: options.sessionToken || `s-${Date.now()}`, ws: null, ready: false, disposed: false, chunksSinceCommit: 0, readyTimer: null, closeTimer: null };
    let settled = false;
    const finish = (r) => { if (!settled) { settled = true; resolve(r); } };

    const ws = new WebSocket(REALTIME_URL, { headers: { Authorization: `Bearer ${apiKey}`, 'OpenAI-Beta': 'realtime=v1' } });
    session.ws = ws;
    realtimeTranscriptionSessions.set(sender.id, session);

    session.readyTimer = setTimeout(() => {
      finish({ error: { message: 'Realtime session timed out' } });
      teardownRealtimeSession(session, { reason: 'timeout' });
    }, 10000);

    ws.on('open', () => {
      try {
        ws.send(JSON.stringify({
          type: 'session.update',
          session: { type: 'transcription', audio: { input: { format: { type: 'audio/pcm', rate: 24000 }, noise_reduction: { type: options.noiseReduction || 'near_field' }, transcription: { model: options.model || REALTIME_MODEL, language: options.language || 'en', prompt: REALTIME_PROMPT }, turn_detection: { type: 'server_vad', threshold: options.vadThreshold ?? 0.6, prefix_padding_ms: 240, silence_duration_ms: 320 } } } },
        }));
      } catch (err) { finish({ error: { message: err.message } }); teardownRealtimeSession(session); }
    });

    ws.on('message', (raw) => {
      let msg; try { msg = JSON.parse(raw.toString()); } catch { return; }
      if (msg.type === 'session.updated') { session.ready = true; clearTimeout(session.readyTimer); finish({ ok: true }); return; }
      if (msg.type === 'input_audio_buffer.committed') session.chunksSinceCommit = 0;
      if (msg.type === 'error' && !session.ready) finish({ error: { message: msg.error?.message || 'Session failed' } });
      sendRealtimeEvent(session, msg);
    });

    ws.on('error', (err) => { if (!session.ready) finish({ error: { message: err.message } }); else sendRealtimeEvent(session, { type: 'realtime.transcription.error', error: { message: err.message } }); });
    ws.on('close', (code, reason) => { if (!session.ready) finish({ error: { message: `Closed (${code})` } }); teardownRealtimeSession(session, { reason: reason?.toString() || `${code}`, closeSocket: false }); });
  });
}

// ═══ WINDOW ═══
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#060911',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;
  if (isDev) mainWindow.loadURL('http://localhost:5173');
  else mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));

  const menu = Menu.buildFromTemplate([
    { label: 'File', submenu: [{ role: 'quit' }] },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'resetZoom' }] },
    { label: 'Help', submenu: [{ label: 'About SpineCPT Pro', click: () => dialog.showMessageBox(mainWindow, { type: 'info', title: 'About SpineCPT Pro', message: 'SpineCPT Pro v1.0.0', detail: 'AI-powered spine surgery operative note optimization.\n250 CPT codes \u2022 Adaptive surgeon profiles \u2022 Real-time dictation\n\n\u00a9 2026 University of Maryland.' }) }] },
  ]);
  Menu.setApplicationMenu(menu);

  // Confirm before close
  mainWindow.on('close', (e) => {
    if (allowClose || mainWindow?.isDestroyed()) return;
    e.preventDefault();
    try { mainWindow.webContents.send('check-unsaved'); }
    catch { allowClose = true; mainWindow?.close(); }
  });

  ipcMain.on('unsaved-response', (_, isDirty) => {
    if (!isDirty) { allowClose = true; if (!mainWindow?.isDestroyed()) mainWindow.close(); return; }
    const choice = dialog.showMessageBoxSync(mainWindow, { type: 'question', buttons: ['Close Anyway', 'Cancel'], defaultId: 1, title: 'Unsaved Work', message: 'You have unsaved work. Close anyway?' });
    if (choice === 0) { allowClose = true; if (!mainWindow?.isDestroyed()) mainWindow.close(); }
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();
  if (app.isPackaged) {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
    autoUpdater.on('update-available', (info) => mainWindow?.webContents.send('update-available', { version: info.version }));
    autoUpdater.on('download-progress', (p) => mainWindow?.webContents.send('update-progress', { percent: Math.round(p.percent) }));
    autoUpdater.on('update-downloaded', (info) => mainWindow?.webContents.send('update-downloaded', { version: info.version }));
    autoUpdater.on('error', (err) => mainWindow?.webContents.send('update-error', err?.message || 'Update error'));
  }
  // Auto-backup on startup (delayed) and every 15 min
  setTimeout(backupStore, 10000);
  setInterval(backupStore, 15 * 60 * 1000);
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ═══ WINDOW CONTROLS IPC ═══
ipcMain.handle('window-minimize', () => mainWindow?.minimize());
ipcMain.handle('window-maximize', () => { if (mainWindow?.isMaximized()) mainWindow.unmaximize(); else mainWindow?.maximize(); });
ipcMain.handle('window-close', () => { allowClose = false; mainWindow?.close(); });

// ═══ CLAUDE API ═══
ipcMain.handle('analyze', async (_, payload) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { error: { message: 'ANTHROPIC_API_KEY not set in .env' } };
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) { return { error: { message: err.message } }; }
});

// ═══ AUTO-UPDATE ═══
ipcMain.handle('install-update', () => { allowClose = true; autoUpdater.quitAndInstall(false, true); });
ipcMain.handle('check-for-updates', () => { if (app.isPackaged) autoUpdater.checkForUpdatesAndNotify().catch(() => {}); });

// ═══ API STATUS ═══
ipcMain.handle('check-api-status', async () => {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
  let isOnline = true;
  try { await fetch('https://api.anthropic.com', { method: 'HEAD', signal: AbortSignal.timeout(3000) }); } catch { isOnline = false; }
  return { hasApiKey, isOnline };
});

ipcMain.handle('whisper-flow-status', async () => {
  try {
    const res = await fetch(`${WHISPER_FLOW_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) {
      return getWhisperFlowStatusPayload({ error: `health check failed (${res.status})` });
    }
    return getWhisperFlowStatusPayload({ available: true });
  } catch (err) {
    return getWhisperFlowStatusPayload({ error: err.message || 'service unavailable' });
  }
});

// ═══ STORAGE ═══
const storePath = path.join(app.getPath('userData'), 'spinecpt-store.json');
function readStore() { try { if (fs.existsSync(storePath)) return JSON.parse(fs.readFileSync(storePath, 'utf-8')); } catch {} return {}; }
function writeStore(store) { fs.writeFileSync(storePath, JSON.stringify(store), 'utf-8'); }

ipcMain.handle('storage-get', (_, key) => { const s = readStore(); return s[key] !== undefined ? { value: s[key] } : null; });
ipcMain.handle('storage-set', (_, key, value) => { const s = readStore(); s[key] = value; writeStore(s); });
ipcMain.handle('storage-delete', (_, key) => { const s = readStore(); delete s[key]; writeStore(s); });

// ═══ WHISPER API ═══
ipcMain.handle('transcribe-whisper', async (_, audioBuffer) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'paste-your-openai-key-here') return { error: { message: 'OPENAI_API_KEY not set' } };
  try {
    const file = new File([Buffer.from(audioBuffer)], 'audio.webm', { type: 'audio/webm' });
    const form = new FormData();
    form.append('file', file);
    form.append('model', 'whisper-1');
    form.append('language', 'en');
    form.append('temperature', '0');
    form.append('prompt', REALTIME_PROMPT);
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}` }, body: form });
    return await res.json();
  } catch (err) { return { error: { message: err.message } }; }
});

// ═══ REALTIME TRANSCRIPTION IPC ═══
ipcMain.handle('realtime-transcription-start', (event, options) => startRealtimeSession(event.sender, options));
ipcMain.on('realtime-transcription-append', (event, payload) => {
  const session = getRealtimeSession(event.sender.id);
  if (!session || session.disposed || !session.ready || !payload.audioBuffer) return;
  if (payload.sessionToken && payload.sessionToken !== session.token) return;
  if (session.ws.readyState !== WebSocket.OPEN) return;
  session.chunksSinceCommit++;
  session.ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: Buffer.from(payload.audioBuffer).toString('base64') }));
});
ipcMain.handle('realtime-transcription-stop', (event, payload) => {
  const session = getRealtimeSession(event.sender.id);
  if (!session || session.disposed) return { ok: true };
  if (payload?.sessionToken && payload.sessionToken !== session.token) return { ok: true };
  if (session.ws.readyState === WebSocket.OPEN && session.chunksSinceCommit > 0) {
    try { session.ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' })); } catch {}
  }
  session.closeTimer = setTimeout(() => teardownRealtimeSession(session, { reason: 'stopped' }), 2500);
  return { ok: true };
});

// ═══ AUTO-BACKUP ═══
function backupStore() {
  try {
    if (!fs.existsSync(storePath)) return null;
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const bp = `${storePath}.bak-${ts}`;
    fs.copyFileSync(storePath, bp);
    // Prune — keep last 3
    const dir = path.dirname(storePath);
    const base = path.basename(storePath);
    fs.readdirSync(dir).filter(f => f.startsWith(base + '.bak-')).sort().reverse().slice(3).forEach(f => { try { fs.unlinkSync(path.join(dir, f)); } catch {} });
    return bp;
  } catch { return null; }
}

ipcMain.handle('trigger-backup', () => ({ success: !!backupStore() }));
ipcMain.handle('get-backup-info', () => {
  try {
    const dir = path.dirname(storePath);
    const base = path.basename(storePath);
    const backups = fs.readdirSync(dir).filter(f => f.startsWith(base + '.bak-')).sort().reverse();
    return { count: backups.length, lastBackup: backups[0] || null };
  } catch { return { count: 0 }; }
});

// ═══ IMPORT / EXPORT ═══
ipcMain.handle('export-settings', async () => {
  const result = await dialog.showSaveDialog(mainWindow, { title: 'Export SpineCPT Settings', defaultPath: 'spinecpt-settings.json', filters: [{ name: 'JSON', extensions: ['json'] }] });
  if (result.canceled) return { canceled: true };
  try { fs.writeFileSync(result.filePath, JSON.stringify(readStore(), null, 2), 'utf-8'); return { success: true }; }
  catch (err) { return { error: err.message }; }
});

ipcMain.handle('import-settings', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { title: 'Import SpineCPT Settings', filters: [{ name: 'JSON', extensions: ['json'] }], properties: ['openFile'] });
  if (result.canceled) return { canceled: true };
  try { backupStore(); writeStore(JSON.parse(fs.readFileSync(result.filePaths[0], 'utf-8'))); return { success: true }; }
  catch (err) { return { error: err.message }; }
});

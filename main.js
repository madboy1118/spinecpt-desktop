const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

require('dotenv').config();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#060911',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In dev, load from Vite dev server; in prod, load built files
  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Minimal menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About SpineCPT Pro',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About SpineCPT Pro',
              message: 'SpineCPT Pro v1.0.0',
              detail: 'AI-powered spine surgery operative note optimization.\n250 CPT codes \u2022 Adaptive surgeon profiles \u2022 Real-time dictation analysis\n\n\u00a9 2026 University of Maryland. All rights reserved.',
            });
          },
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();

  // Auto-update (production only)
  if (app.isPackaged) {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});

    autoUpdater.on('update-available', (info) => {
      mainWindow?.webContents.send('update-available', { version: info.version });
    });
    autoUpdater.on('download-progress', (progress) => {
      mainWindow?.webContents.send('update-progress', { percent: Math.round(progress.percent) });
    });
    autoUpdater.on('update-downloaded', (info) => {
      mainWindow?.webContents.send('update-downloaded', { version: info.version });
    });
    autoUpdater.on('error', (err) => {
      mainWindow?.webContents.send('update-error', err?.message || 'Update error');
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC: Analyze — proxy to Claude API (keeps API key in main process)
ipcMain.handle('analyze', async (event, payload) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { error: { message: 'ANTHROPIC_API_KEY not set in .env' } };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (err) {
    return { error: { message: err.message } };
  }
});

// IPC: Auto-update controls
ipcMain.handle('install-update', () => { autoUpdater.quitAndInstall(false, true); });
ipcMain.handle('check-for-updates', () => { if (app.isPackaged) autoUpdater.checkForUpdatesAndNotify().catch(() => {}); });

// IPC: Check API status — returns whether API key is set and network is available
ipcMain.handle('check-api-status', async () => {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
  let isOnline = true;
  try {
    await fetch('https://api.anthropic.com', { method: 'HEAD', signal: AbortSignal.timeout(3000) });
  } catch {
    isOnline = false;
  }
  return { hasApiKey, isOnline };
});

// IPC: Storage — simple key-value using a JSON file (no SQLite dependency for now)
const fs = require('fs');
const storePath = path.join(app.getPath('userData'), 'spinecpt-store.json');

function readStore() {
  try {
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    }
  } catch {}
  return {};
}

function writeStore(store) {
  fs.writeFileSync(storePath, JSON.stringify(store), 'utf-8');
}

ipcMain.handle('storage-get', (event, key) => {
  const store = readStore();
  return store[key] !== undefined ? { value: store[key] } : null;
});

ipcMain.handle('storage-set', (event, key, value) => {
  const store = readStore();
  store[key] = value;
  writeStore(store);
});

// IPC: Whisper API transcription — receives audio buffer, returns text
ipcMain.handle('transcribe-whisper', async (event, audioBuffer) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: { message: 'OPENAI_API_KEY not set in .env — add it to use Whisper transcription' } };
  }

  try {
    const buffer = Buffer.from(audioBuffer);
    const file = new File([buffer], 'audio.webm', { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('prompt', 'Spine surgery operative note: laminectomy, foraminotomy, facetectomy, pedicle screws, TLIF, PLIF, ACDF, decompression, stenosis, spondylolisthesis, corpectomy, kyphoplasty, interbody cage, neuromonitoring, EMG, fluoroscopy');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: formData,
    });

    return await response.json();
  } catch (err) {
    return { error: { message: err.message } };
  }
});

ipcMain.handle('storage-delete', (event, key) => {
  const store = readStore();
  delete store[key];
  writeStore(store);
});

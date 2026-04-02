const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('storage', {
  get: (key) => ipcRenderer.invoke('storage-get', key),
  set: (key, value) => ipcRenderer.invoke('storage-set', key, value),
  delete: (key) => ipcRenderer.invoke('storage-delete', key),
});

contextBridge.exposeInMainWorld('electronAPI', {
  analyze: (payload) => ipcRenderer.invoke('analyze', payload),
  transcribeWhisper: (audioBuffer) => ipcRenderer.invoke('transcribe-whisper', audioBuffer),
  checkApiStatus: () => ipcRenderer.invoke('check-api-status'),
  onUpdateAvailable: (cb) => ipcRenderer.on('update-available', (_, info) => cb(info)),
  onUpdateProgress: (cb) => ipcRenderer.on('update-progress', (_, info) => cb(info)),
  onUpdateDownloaded: (cb) => ipcRenderer.on('update-downloaded', (_, info) => cb(info)),
  onUpdateError: (cb) => ipcRenderer.on('update-error', (_, msg) => cb(msg)),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
});

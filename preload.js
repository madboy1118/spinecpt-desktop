const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('storage', {
  get: (key) => ipcRenderer.invoke('storage-get', key),
  set: (key, value) => ipcRenderer.invoke('storage-set', key, value),
  delete: (key) => ipcRenderer.invoke('storage-delete', key),
});

contextBridge.exposeInMainWorld('electronAPI', {
  analyze: (payload) => ipcRenderer.invoke('analyze', payload),
  transcribeWhisper: (audioBuffer) => ipcRenderer.invoke('transcribe-whisper', audioBuffer),
  getWhisperFlowStatus: () => ipcRenderer.invoke('whisper-flow-status'),
  startRealtimeTranscription: (options) => ipcRenderer.invoke('realtime-transcription-start', options),
  appendRealtimeTranscriptionAudio: (payload) => ipcRenderer.send('realtime-transcription-append', payload),
  stopRealtimeTranscription: (payload) => ipcRenderer.invoke('realtime-transcription-stop', payload),
  onRealtimeTranscriptionEvent: (cb) => {
    const listener = (_, payload) => cb(payload);
    ipcRenderer.on('realtime-transcription-event', listener);
    return () => ipcRenderer.removeListener('realtime-transcription-event', listener);
  },
  checkApiStatus: () => ipcRenderer.invoke('check-api-status'),
  onUpdateAvailable: (cb) => ipcRenderer.on('update-available', (_, info) => cb(info)),
  onUpdateProgress: (cb) => ipcRenderer.on('update-progress', (_, info) => cb(info)),
  onUpdateDownloaded: (cb) => ipcRenderer.on('update-downloaded', (_, info) => cb(info)),
  onUpdateError: (cb) => ipcRenderer.on('update-error', (_, msg) => cb(msg)),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  // Window controls (frameless)
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  // Backup & Import/Export
  triggerBackup: () => ipcRenderer.invoke('trigger-backup'),
  getBackupInfo: () => ipcRenderer.invoke('get-backup-info'),
  exportSettings: () => ipcRenderer.invoke('export-settings'),
  importSettings: () => ipcRenderer.invoke('import-settings'),
  // Close confirmation
  onCheckUnsaved: (cb) => ipcRenderer.on('check-unsaved', () => cb()),
  respondUnsaved: (isDirty) => ipcRenderer.send('unsaved-response', isDirty),
});

// Whisper API dictation engine — captures audio, sends chunks to Electron main process

export function createWhisperDictation({ onResult, onEnd, onError, chunkDurationMs = 5000, lang = 'en' }) {
  let mediaStream = null;
  let recorder = null;
  let listening = false;
  let autoRestart = false;
  let chunkTimer = null;

  const supported = !!(navigator.mediaDevices?.getUserMedia && window.electronAPI?.transcribeWhisper);

  async function processChunk(blob) {
    try {
      const buffer = await blob.arrayBuffer();
      const data = await window.electronAPI.transcribeWhisper(buffer);
      if (data.error) {
        onError?.(data.error.message || data.error);
        return;
      }
      const text = data.text?.trim();
      if (text) {
        onResult?.({ final: text + " ", interim: "" });
      }
    } catch (e) {
      onError?.(e.message);
    }
  }

  return {
    supported,

    start: async () => {
      if (listening) return;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 }
        });

        recorder = new MediaRecorder(mediaStream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : 'audio/webm'
        });

        let chunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          if (chunks.length > 0) {
            const blob = new Blob(chunks, { type: recorder.mimeType });
            chunks = [];
            if (blob.size > 1000) {
              onResult?.({ final: "", interim: "transcribing..." });
              processChunk(blob);
            }
          }
          if (autoRestart && listening) {
            try { recorder.start(); } catch {}
          }
        };

        recorder.start();
        listening = true;
        autoRestart = true;

        // Chunk timer — stop and restart recorder periodically to flush chunks
        chunkTimer = setInterval(() => {
          if (recorder?.state === "recording") {
            recorder.stop();
          }
        }, chunkDurationMs);

      } catch (e) {
        onError?.(e.message || "Microphone access denied");
      }
    },

    stop: () => {
      autoRestart = false;
      listening = false;
      if (chunkTimer) { clearInterval(chunkTimer); chunkTimer = null; }
      try { recorder?.stop(); } catch {}
      mediaStream?.getTracks().forEach(t => t.stop());
      mediaStream = null;
      recorder = null;
      onEnd?.();
    },

    isListening: () => listening,
  };
}

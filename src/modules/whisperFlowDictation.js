const HALLUCINATIONS = [
  "thank you for watching", "thanks for watching", "thank you for listening",
  "please subscribe", "like and subscribe", "see you next time",
  "bye bye", "bye-bye", "good bye", "subtitles by",
  "transcribed by", "translated by", "copyright", "all rights reserved",
  "you", "the end", "...", "music",
];

const TARGET_SAMPLE_RATE = 16000;
const PROCESSOR_BUFFER_SIZE = 4096;

function isHallucination(text) {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return true;
  return HALLUCINATIONS.some((entry) => normalized === entry || normalized.includes(entry));
}

function computeAudioLevel(samples) {
  if (!samples?.length) return 0;
  let sumSquares = 0;
  for (let index = 0; index < samples.length; index += 1) {
    sumSquares += samples[index] * samples[index];
  }
  return Math.sqrt(sumSquares / samples.length);
}

function clampSample(value) {
  return Math.max(-1, Math.min(1, value));
}

function downsampleToPcm16(samples, inputRate, targetRate) {
  if (!samples?.length) return new Int16Array(0);

  const ratio = inputRate / targetRate;
  const outputLength = Math.max(1, Math.round(samples.length / ratio));
  const output = new Int16Array(outputLength);

  let inputOffset = 0;
  for (let outputIndex = 0; outputIndex < outputLength; outputIndex += 1) {
    const nextOffset = Math.min(samples.length, Math.round((outputIndex + 1) * ratio));
    let total = 0;
    let count = 0;

    for (let sampleIndex = inputOffset; sampleIndex < nextOffset; sampleIndex += 1) {
      total += samples[sampleIndex];
      count += 1;
    }

    const averaged = clampSample(count > 0 ? total / count : samples[Math.min(inputOffset, samples.length - 1)] || 0);
    output[outputIndex] = averaged < 0 ? averaged * 0x8000 : averaged * 0x7fff;
    inputOffset = nextOffset;
  }

  return output;
}

export function createWhisperFlowDictation({
  onResult,
  onEnd,
  onError,
  onAudioLevel,
  wsUrl = "ws://127.0.0.1:8181/ws",
}) {
  let mediaStream = null;
  let audioContext = null;
  let sourceNode = null;
  let processorNode = null;
  let sinkNode = null;
  let socket = null;
  let listening = false;
  let closedByUser = false;
  let inputSampleRate = TARGET_SAMPLE_RATE;

  const supported = !!(
    navigator.mediaDevices?.getUserMedia &&
    typeof WebSocket !== "undefined"
  );

  async function cleanupAudio() {
    onAudioLevel?.(0);
    if (processorNode) {
      try { processorNode.disconnect(); } catch {}
      processorNode.onaudioprocess = null;
      processorNode = null;
    }
    if (sourceNode) {
      try { sourceNode.disconnect(); } catch {}
      sourceNode = null;
    }
    if (sinkNode) {
      try { sinkNode.disconnect(); } catch {}
      sinkNode = null;
    }
    mediaStream?.getTracks().forEach((track) => track.stop());
    mediaStream = null;
    if (audioContext) {
      try { await audioContext.close(); } catch {}
      audioContext = null;
    }
  }

  function cleanupSocket() {
    if (!socket) return;
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    socket = null;
  }

  async function teardown({ fireOnEnd = false } = {}) {
    listening = false;
    await cleanupAudio();
    if (socket && socket.readyState < WebSocket.CLOSING) {
      try { socket.close(); } catch {}
    }
    cleanupSocket();
    onResult?.({ final: "", interim: "" });
    if (fireOnEnd) onEnd?.();
  }

  function handleServerMessage(raw) {
    let parsed;
    try {
      parsed = JSON.parse(typeof raw.data === "string" ? raw.data : "");
    } catch {
      return;
    }

    const text = parsed?.data?.text?.trim();
    if (!text || isHallucination(text)) return;

    if (parsed.is_partial) {
      onResult?.({ final: "", interim: text });
      return;
    }

    const finalText = text.endsWith(" ") ? text : `${text} `;
    onResult?.({ final: finalText, interim: "" });
  }

  async function startAudioCapture() {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    audioContext = new AudioContext();
    await audioContext.resume();
    inputSampleRate = audioContext.sampleRate;
    sourceNode = audioContext.createMediaStreamSource(mediaStream);
    processorNode = audioContext.createScriptProcessor(PROCESSOR_BUFFER_SIZE, 1, 1);
    sinkNode = audioContext.createGain();
    sinkNode.gain.value = 0;

    processorNode.onaudioprocess = (event) => {
      if (!listening || !socket || socket.readyState !== WebSocket.OPEN) return;

      const samples = new Float32Array(event.inputBuffer.getChannelData(0));
      onAudioLevel?.(computeAudioLevel(samples));

      const pcm16 = downsampleToPcm16(samples, inputSampleRate, TARGET_SAMPLE_RATE);
      if (!pcm16.length) return;

      try {
        socket.send(new Uint8Array(pcm16.buffer));
      } catch (error) {
        onError?.(error.message || "WhisperFlow stream failed");
      }
    };

    sourceNode.connect(processorNode);
    processorNode.connect(sinkNode);
    sinkNode.connect(audioContext.destination);
  }

  return {
    supported,

    start: async () => {
      if (!supported) {
        onError?.("WhisperFlow dictation is not supported in this build");
        return false;
      }
      if (listening) return true;

      closedByUser = false;
      onResult?.({ final: "", interim: "" });

      return new Promise((resolve) => {
        let settled = false;
        const finish = (value) => {
          if (settled) return;
          settled = true;
          resolve(value);
        };

        try {
          socket = new WebSocket(wsUrl);
        } catch (error) {
          onError?.(error.message || "Unable to connect to WhisperFlow");
          cleanupSocket();
          finish(false);
          return;
        }

        socket.binaryType = "arraybuffer";

        socket.onopen = async () => {
          try {
            await startAudioCapture();
            listening = true;
            finish(true);
          } catch (error) {
            await teardown();
            onError?.(error.message || "Microphone access denied");
            finish(false);
          }
        };

        socket.onmessage = handleServerMessage;

        socket.onerror = async () => {
          const message = `Unable to reach WhisperFlow at ${wsUrl}`;
          await teardown();
          onError?.(message);
          finish(false);
        };

        socket.onclose = async () => {
          const shouldNotify = listening;
          const shouldError = !closedByUser && !settled;
          await teardown({ fireOnEnd: shouldNotify });
          if (shouldError) {
            onError?.("WhisperFlow connection closed");
            finish(false);
          } else {
            finish(true);
          }
        };
      });
    },

    stop: async () => {
      if (!listening && !socket) return true;
      closedByUser = true;
      await teardown({ fireOnEnd: true });
      return true;
    },

    isListening: () => listening,
  };
}

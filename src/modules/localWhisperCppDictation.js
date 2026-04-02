const HALLUCINATIONS = [
  "thank you for watching", "thanks for watching", "thank you for listening",
  "please subscribe", "like and subscribe", "see you next time",
  "bye bye", "bye-bye", "good bye", "subtitles by",
  "transcribed by", "translated by", "copyright", "all rights reserved",
  "you", "the end", "...", "music",
];

const TARGET_SAMPLE_RATE = 16000;
const PROCESSOR_BUFFER_SIZE = 4096;
const MIN_SPEECH_LEVEL = 0.018;
const SPEECH_END_MS = 320;
const MIN_UTTERANCE_MS = 350;
const MAX_UTTERANCE_MS = 1800;
const PREROLL_BUFFERS = 2;

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

function concatFloat32(chunks, totalLength) {
  const output = new Float32Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

function encodeWav(pcm16, sampleRate) {
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcm16.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset, text) {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let index = 0; index < pcm16.length; index += 1) {
    view.setInt16(offset, pcm16[index], true);
    offset += 2;
  }

  return buffer;
}

export function createLocalWhisperCppDictation({ onResult, onEnd, onError, onAudioLevel }) {
  let mediaStream = null;
  let audioContext = null;
  let sourceNode = null;
  let processorNode = null;
  let sinkNode = null;
  let listening = false;
  let processing = false;
  const queue = [];
  const preRoll = [];
  let speechBuffers = [];
  let speechSamples = 0;
  let lastSpeechAt = 0;
  let inputSampleRate = TARGET_SAMPLE_RATE;

  const supported = !!(
    navigator.mediaDevices?.getUserMedia &&
    window.electronAPI?.transcribeLocalWhisper
  );

  function resetSpeechState() {
    speechBuffers = [];
    speechSamples = 0;
    lastSpeechAt = 0;
  }

  async function processQueue() {
    if (processing || queue.length === 0) return;
    processing = true;
    onResult?.({ final: "", interim: "transcribing..." });

    const wavBuffer = queue.shift();

    try {
      const data = await window.electronAPI.transcribeLocalWhisper({
        audioBuffer: wavBuffer,
        language: "en",
      });

      if (data?.error) {
        onError?.(data.error.message || data.error);
      } else {
        const text = data?.text?.trim();
        if (text && !isHallucination(text)) {
          const finalText = text.endsWith(" ") ? text : `${text} `;
          onResult?.({ final: finalText, interim: "" });
        }
      }
    } catch (error) {
      onError?.(error.message || "Local dictation failed");
    } finally {
      processing = false;
      if (queue.length > 0) {
        processQueue();
      } else {
        onResult?.({ final: "", interim: "" });
      }
    }
  }

  function flushSpeechChunk() {
    if (speechSamples === 0) return;

    const durationMs = (speechSamples / inputSampleRate) * 1000;
    if (durationMs < MIN_UTTERANCE_MS) {
      resetSpeechState();
      return;
    }

    const merged = concatFloat32(speechBuffers, speechSamples);
    const pcm16 = downsampleToPcm16(merged, inputSampleRate, TARGET_SAMPLE_RATE);
    if (pcm16.length === 0) {
      resetSpeechState();
      return;
    }

    queue.push(encodeWav(pcm16, TARGET_SAMPLE_RATE));
    resetSpeechState();
    processQueue();
  }

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

  return {
    supported,

    start: async () => {
      if (!supported) {
        onError?.("Local dictation is not available in this build");
        return false;
      }
      if (listening) return true;

      queue.length = 0;
      preRoll.length = 0;
      resetSpeechState();

      try {
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
          if (!listening) return;

          const samples = new Float32Array(event.inputBuffer.getChannelData(0));
          const level = computeAudioLevel(samples);
          onAudioLevel?.(level);

          preRoll.push(samples);
          while (preRoll.length > PREROLL_BUFFERS) {
            preRoll.shift();
          }

          const now = performance.now();
          if (level >= MIN_SPEECH_LEVEL) {
            if (speechSamples === 0) {
              speechBuffers = [...preRoll];
              speechSamples = speechBuffers.reduce((sum, chunk) => sum + chunk.length, 0);
            } else {
              speechBuffers.push(samples);
              speechSamples += samples.length;
            }
            lastSpeechAt = now;
            const durationMs = (speechSamples / inputSampleRate) * 1000;
            if (durationMs >= MAX_UTTERANCE_MS) {
              flushSpeechChunk();
            }
            return;
          }

          if (speechSamples > 0) {
            speechBuffers.push(samples);
            speechSamples += samples.length;

            const durationMs = (speechSamples / inputSampleRate) * 1000;
            const silenceMs = now - lastSpeechAt;
            if (
              (durationMs >= MIN_UTTERANCE_MS && silenceMs >= SPEECH_END_MS) ||
              durationMs >= MAX_UTTERANCE_MS
            ) {
              flushSpeechChunk();
            }
          }
        };

        sourceNode.connect(processorNode);
        processorNode.connect(sinkNode);
        sinkNode.connect(audioContext.destination);

        listening = true;
        onResult?.({ final: "", interim: "" });
        return true;
      } catch (error) {
        listening = false;
        await cleanupAudio();
        onError?.(error.message || "Microphone access denied");
        return false;
      }
    },

    stop: async () => {
      if (!listening) return true;
      listening = false;
      flushSpeechChunk();
      await cleanupAudio();
      onEnd?.();
      return true;
    },

    isListening: () => listening,
  };
}

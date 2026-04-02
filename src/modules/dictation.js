// Web Speech API wrapper for voice dictation

export function createDictation({ onResult, onEnd, onError, lang = 'en-US' }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return {
      supported: false,
      start: () => {
        onError?.("Speech recognition not supported");
        return false;
      },
      stop: () => {},
      isListening: () => false,
    };
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = lang;
  let listening = false;
  let autoRestart = false;

  recognition.onresult = (event) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += transcript;
      } else {
        interim += transcript;
      }
    }
    onResult?.({ final, interim });
  };

  recognition.onend = () => {
    listening = false;
    if (autoRestart) {
      try { recognition.start(); listening = true; } catch {}
    } else {
      onEnd?.();
    }
  };

  recognition.onerror = (event) => {
    if (event.error === 'no-speech' || event.error === 'aborted') return;
    onError?.(event.error);
  };

  return {
    supported: true,
    start: () => {
      autoRestart = true;
      try {
        recognition.start();
        listening = true;
        return true;
      } catch (err) {
        onError?.(err.message || "Unable to start speech recognition");
        return false;
      }
    },
    stop: () => {
      autoRestart = false;
      try { recognition.stop(); } catch {}
      listening = false;
    },
    isListening: () => listening,
  };
}

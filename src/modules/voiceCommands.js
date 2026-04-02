// Voice command registry — intercepts spoken phrases before they enter the note

const COMMANDS = [
  { pattern: /\b(next section|move on|advance section)\b/i, command: "nextSection", label: "Next Section" },
  { pattern: /\b(go back|previous section|back up|last section)\b/i, command: "goBack", label: "Previous Section" },
  { pattern: /\b(read that back|read back|play ?back)\b/i, command: "readBack", label: "Read Back" },
  { pattern: /\b(i'?m done|finish dictation|stop dictation|end dictation|all done)\b/i, command: "done", label: "Done" },
  { pattern: /\b(scratch that|undo that|delete that|undo|never ?mind)\b/i, command: "undo", label: "Undo" },
  { pattern: /\b(pause dictation|hold on|pause)\b/i, command: "pause", label: "Pause" },
];

export function createVoiceCommandProcessor(handlers) {
  return {
    process(transcript) {
      const trimmed = transcript.trim();
      for (const cmd of COMMANDS) {
        if (cmd.pattern.test(trimmed)) {
          // Only treat as command if the entire utterance is basically the command
          // (allow a few extra words, but not a whole sentence with a command word in it)
          const words = trimmed.split(/\s+/).length;
          if (words <= 6) {
            handlers[cmd.command]?.();
            return { isCommand: true, command: cmd.command, label: cmd.label, cleanText: "" };
          }
        }
      }
      return { isCommand: false, command: null, label: null, cleanText: transcript };
    },
  };
}

export function readBackText(text) {
  if (!window.speechSynthesis) return;
  // Read last paragraph
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  const lastParagraph = paragraphs[paragraphs.length - 1] || text.slice(-500);
  const utterance = new SpeechSynthesisUtterance(lastParagraph.trim());
  utterance.rate = 0.9;
  utterance.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

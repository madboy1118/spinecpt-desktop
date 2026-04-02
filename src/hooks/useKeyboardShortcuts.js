import { useEffect } from 'react';

export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      switch (e.key.toLowerCase()) {
        case 'enter':
          e.preventDefault();
          handlers.onAnalyze?.();
          break;
        case 'd':
          e.preventDefault();
          handlers.onToggleDictation?.();
          break;
        case 'n':
          if (!e.shiftKey) {
            e.preventDefault();
            handlers.onNewNote?.();
          }
          break;
        case 's':
          e.preventDefault();
          handlers.onSave?.();
          break;
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            handlers.onRedo?.();
          } else {
            e.preventDefault();
            handlers.onUndo?.();
          }
          break;
        case 'k':
          e.preventDefault();
          handlers.onCommandPalette?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

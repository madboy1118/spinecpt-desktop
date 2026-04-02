import { useState, useRef, useCallback } from 'react';

const MAX_HISTORY = 100;

export function useUndoRedo(initialValue = "") {
  const [value, setValue] = useState(initialValue);
  const history = useRef([initialValue]);
  const pointer = useRef(0);
  const skipRecord = useRef(false);

  const set = useCallback((newValue) => {
    const val = typeof newValue === "function" ? newValue(history.current[pointer.current]) : newValue;

    if (skipRecord.current) {
      skipRecord.current = false;
      setValue(val);
      return;
    }

    // Trim future history if we've undone
    if (pointer.current < history.current.length - 1) {
      history.current = history.current.slice(0, pointer.current + 1);
    }

    // Don't record if identical
    if (val === history.current[pointer.current]) {
      setValue(val);
      return;
    }

    history.current.push(val);
    if (history.current.length > MAX_HISTORY) history.current.shift();
    pointer.current = history.current.length - 1;
    setValue(val);
  }, []);

  const undo = useCallback(() => {
    if (pointer.current > 0) {
      pointer.current -= 1;
      skipRecord.current = true;
      setValue(history.current[pointer.current]);
      return true;
    }
    return false;
  }, []);

  const redo = useCallback(() => {
    if (pointer.current < history.current.length - 1) {
      pointer.current += 1;
      skipRecord.current = true;
      setValue(history.current[pointer.current]);
      return true;
    }
    return false;
  }, []);

  const canUndo = pointer.current > 0;
  const canRedo = pointer.current < history.current.length - 1;

  const reset = useCallback((newValue = "") => {
    history.current = [newValue];
    pointer.current = 0;
    setValue(newValue);
  }, []);

  return { value, set, undo, redo, canUndo, canRedo, reset };
}

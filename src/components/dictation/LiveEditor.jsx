import { useRef, useEffect, useCallback } from 'react';
import { X, mn, ft } from '../../theme.js';

export default function LiveEditor({ value, onChange, interim, listening, onCursorPosition }) {
  const textareaRef = useRef(null);
  const cursorRef = useRef(value.length);

  // Track cursor position on every interaction
  const updateCursor = useCallback(() => {
    if (textareaRef.current) {
      cursorRef.current = textareaRef.current.selectionStart;
      onCursorPosition?.(cursorRef.current);
    }
  }, [onCursorPosition]);

  // Keep cursor in the right place after dictation inserts text
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta && document.activeElement === ta) {
      // Only restore cursor if user is actively editing (not if dictation just appended)
      // The cursor will naturally be at the end for dictation appends
    }
  }, [value]);

  return (
    <div style={{ position: "relative" }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => {
          onChange(e.target.value);
          cursorRef.current = e.target.selectionStart;
        }}
        onClick={updateCursor}
        onKeyUp={updateCursor}
        onSelect={updateCursor}
        placeholder="Start dictating or type your operative note...&#10;&#10;You can freely switch between voice and keyboard at any time."
        style={{
          width: "100%", minHeight: 320, padding: 16, paddingTop: 32, borderRadius: 10,
          background: X.s2, border: `1px solid ${listening ? X.ac : X.b1}`, color: X.t1,
          fontSize: 13, fontFamily: mn, lineHeight: 1.8, resize: "vertical",
          outline: "none", boxSizing: "border-box",
          transition: "border-color .2s",
        }}
        onFocus={e => { if (!listening) e.target.style.borderColor = X.ac; }}
        onBlur={e => { if (!listening) e.target.style.borderColor = X.b1; }}
      />

      {/* Mode indicator badge */}
      <div style={{
        position: "absolute", top: 8, left: 12, right: 12,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        pointerEvents: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {listening ? (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
              background: X.rD, color: X.r, display: "flex", alignItems: "center", gap: 4,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: X.r, animation: "pulse 1s infinite" }} />
              DICTATING
            </span>
          ) : (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
              background: X.s3, color: X.t4,
            }}>
              TYPING
            </span>
          )}
          {listening && (
            <span style={{ fontSize: 9, color: X.t4, fontFamily: ft }}>
              speak or type — both work
            </span>
          )}
        </div>
      </div>

      {/* Interim speech text overlay */}
      {interim && (
        <div style={{
          position: "absolute", bottom: 8, left: 16, right: 16,
          padding: "4px 8px", borderRadius: 4, background: X.acD,
          color: X.ac, fontSize: 12, fontFamily: mn, opacity: 0.7,
        }}>{interim}</div>
      )}
    </div>
  );
}

import { useRef, useEffect, useCallback } from 'react';
import { X, mn, ft } from '../../theme.js';

export default function LiveEditor({ value, previewSegments, onChange, interim, listening, onCursorPosition }) {
  const textareaRef = useRef(null);
  const mirrorRef = useRef(null);
  const cursorRef = useRef(value.length);
  const showLivePreview = listening && !!previewSegments;

  const syncScroll = useCallback(() => {
    if (!textareaRef.current || !mirrorRef.current) return;
    mirrorRef.current.scrollTop = textareaRef.current.scrollTop;
    mirrorRef.current.scrollLeft = textareaRef.current.scrollLeft;
  }, []);

  const updateCursor = useCallback(() => {
    if (textareaRef.current) {
      cursorRef.current = textareaRef.current.selectionStart;
      onCursorPosition?.(cursorRef.current);
    }
  }, [onCursorPosition]);

  useEffect(() => {
    syncScroll();
  }, [value, previewSegments, syncScroll]);

  return (
    <div style={{ position: "relative" }}>
      {showLivePreview && (
        <div
          ref={mirrorRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            minHeight: 320,
            padding: 16,
            paddingTop: 32,
            borderRadius: 10,
            overflow: "hidden",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: X.t1,
            fontSize: 13,
            fontFamily: mn,
            lineHeight: 1.8,
            boxSizing: "border-box",
            pointerEvents: "none",
          }}
        >
          <span>{previewSegments.before}</span>
          <span style={{
            color: X.ac,
            fontStyle: "italic",
            textDecoration: "underline dotted",
            textUnderlineOffset: 3,
          }}>{previewSegments.interim}</span>
          <span>{previewSegments.after}</span>
          {!previewSegments.before && !previewSegments.after && !previewSegments.interim && (
            <span style={{ color: X.t4 }}>
              Start dictating or type your operative note...
            </span>
          )}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => {
          onChange(e.target.value);
          cursorRef.current = e.target.selectionStart;
          onCursorPosition?.(cursorRef.current);
        }}
        onClick={updateCursor}
        onKeyUp={updateCursor}
        onSelect={updateCursor}
        onScroll={syncScroll}
        placeholder="Start dictating or type your operative note...&#10;&#10;You can freely switch between voice and keyboard at any time."
        style={{
          width: "100%", minHeight: 320, padding: 16, paddingTop: 32, borderRadius: 10,
          background: X.s2, border: `1px solid ${listening ? X.ac : X.b1}`,
          color: showLivePreview ? "transparent" : X.t1,
          caretColor: X.t1,
          fontSize: 13, fontFamily: mn, lineHeight: 1.8, resize: "vertical",
          outline: "none", boxSizing: "border-box",
          transition: "border-color .2s",
          position: "relative",
          zIndex: 1,
        }}
        onFocus={e => { if (!listening) e.target.style.borderColor = X.ac; }}
        onBlur={e => { if (!listening) e.target.style.borderColor = X.b1; }}
      />

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
              live preview only until finalized
            </span>
          )}
        </div>
      </div>

      {!showLivePreview && interim && (
        <div style={{
          position: "absolute", bottom: 8, left: 16, right: 16,
          padding: "4px 8px", borderRadius: 4, background: X.acD,
          color: X.ac, fontSize: 12, fontFamily: mn, opacity: 0.7,
        }}>{interim}</div>
      )}
    </div>
  );
}

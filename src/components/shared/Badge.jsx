import { mn } from '../../theme.js';

export default function Badge({ text, bg, color, style = {} }) {
  return (
    <span style={{
      fontSize: 9, padding: "2px 6px", borderRadius: 4,
      background: bg, color, fontWeight: 700, fontFamily: mn,
      ...style,
    }}>{text}</span>
  );
}

import { Component } from 'react';
import { X, ft, mn } from '../../theme.js';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errorText = `${this.state.error?.message || "Unknown error"}\n\n${this.state.errorInfo?.componentStack || ""}`;
      return (
        <div style={{ fontFamily: ft, background: X.bg, color: X.t1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ maxWidth: 500, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: X.rD, border: `2px solid ${X.r}40`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 16 }}>!</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: X.t1, marginBottom: 8 }}>Something went wrong</div>
            <div style={{ fontSize: 13, color: X.t3, marginBottom: 20, lineHeight: 1.6 }}>
              SpineCPT Pro encountered an unexpected error. Your data is safe.
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: X.s2, border: `1px solid ${X.b1}`, textAlign: "left", maxHeight: 150, overflowY: "auto", marginBottom: 16 }}>
              <pre style={{ fontFamily: mn, fontSize: 10, color: X.r, whiteSpace: "pre-wrap", margin: 0 }}>{this.state.error?.message || "Unknown error"}</pre>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })} style={{
                padding: "10px 24px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: ft,
                background: `linear-gradient(135deg,${X.ac},${X.p})`, color: X.bg, fontWeight: 700, fontSize: 13,
              }}>Try Again</button>
              <button onClick={() => { try { navigator.clipboard?.writeText(errorText); } catch {} }} style={{
                padding: "10px 16px", borderRadius: 7, border: `1px solid ${X.b2}`, background: "transparent",
                color: X.t3, fontSize: 12, cursor: "pointer", fontFamily: ft,
              }}>Copy Error</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

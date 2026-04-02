// UI Theme constants — dark and light modes

const dark = {
  bg: "#060911", s1: "#0b1120", s2: "#111a2f", s3: "#18243d",
  b1: "#1c2d50", b2: "#263d6a",
  ac: "#38bdf8", acD: "#0c4a6e",
  g: "#4ade80", gD: "#052e16", gB: "#0d3320", gBr: "#166534",
  y: "#fbbf24", yD: "#451a03", yB: "#422006",
  r: "#f87171", rD: "#450a0a", rB: "#3f1111", rBr: "#991b1b",
  p: "#a78bfa", pD: "#3b0764", pB: "#2e1065",
  o: "#fb923c", oD: "#7c2d12",
  t1: "#f1f5f9", t2: "#94a3b8", t3: "#64748b", t4: "#475569",
};

const light = {
  bg: "#f8fafc", s1: "#ffffff", s2: "#f1f5f9", s3: "#e2e8f0",
  b1: "#cbd5e1", b2: "#94a3b8",
  ac: "#0284c7", acD: "#e0f2fe",
  g: "#16a34a", gD: "#dcfce7", gB: "#bbf7d0", gBr: "#166534",
  y: "#ca8a04", yD: "#fef9c3", yB: "#fef08a",
  r: "#dc2626", rD: "#fee2e2", rB: "#fecaca", rBr: "#991b1b",
  p: "#7c3aed", pD: "#ede9fe", pB: "#ddd6fe",
  o: "#ea580c", oD: "#fff7ed",
  t1: "#0f172a", t2: "#475569", t3: "#94a3b8", t4: "#cbd5e1",
};

let currentTheme = "dark";
export let X = { ...dark };

export function setTheme(theme) {
  currentTheme = theme;
  Object.assign(X, theme === "light" ? light : dark);
}

export function getTheme() {
  return currentTheme;
}

export function toggleTheme() {
  setTheme(currentTheme === "dark" ? "light" : "dark");
  return currentTheme;
}

export const ft = "'Outfit',system-ui,sans-serif";
export const mn = "'JetBrains Mono','SF Mono',monospace";

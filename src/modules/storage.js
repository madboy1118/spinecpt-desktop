// Storage module — wraps window.storage IPC bridge (Electron) with fallback to localStorage

async function ld(key, fallback) {
  try {
    if (window.storage) {
      const r = await window.storage.get(key);
      return r ? JSON.parse(r.value) : fallback;
    }
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function sv(key, value) {
  try {
    const json = JSON.stringify(value);
    if (window.storage) {
      await window.storage.set(key, json);
    } else {
      localStorage.setItem(key, json);
    }
  } catch (e) {
    console.error("Storage write error:", e);
  }
}

async function del(key) {
  try {
    if (window.storage) {
      await window.storage.delete(key);
    } else {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.error("Storage delete error:", e);
  }
}

export { ld, sv, del };

import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine !== false);
  const [hasApiKey, setHasApiKey] = useState(true); // optimistic default

  useEffect(() => {
    // Check API key via Electron IPC
    if (window.electronAPI?.checkApiStatus) {
      window.electronAPI.checkApiStatus().then(status => {
        setHasApiKey(status?.hasApiKey ?? false);
      });
    }

    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return {
    isOnline,
    hasApiKey,
    isOffline: !isOnline || !hasApiKey,
    reason: !isOnline ? "No network connection" : !hasApiKey ? "ANTHROPIC_API_KEY not set in .env" : null,
  };
}

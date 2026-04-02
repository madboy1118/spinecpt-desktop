import { useState, useEffect, useRef } from 'react';

export function useSessionTimer() {
  const startTime = useRef(Date.now());
  const [duration, setDuration] = useState("0m");

  useEffect(() => {
    const update = () => {
      const elapsed = Date.now() - startTime.current;
      const mins = Math.floor(elapsed / 60000);
      const hrs = Math.floor(mins / 60);
      setDuration(hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`);
    };
    update();
    const iv = setInterval(update, 60000);
    return () => clearInterval(iv);
  }, []);

  const reset = () => { startTime.current = Date.now(); setDuration("0m"); };

  return { duration, reset };
}

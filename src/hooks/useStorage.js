import { useState, useEffect, useCallback } from 'react';
import { ld, sv } from '../modules/storage.js';

export function useStorage(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    ld(key, defaultValue).then(v => setValue(v));
  }, [key]);

  const update = useCallback(async (newValue) => {
    setValue(newValue);
    await sv(key, newValue);
  }, [key]);

  return [value, update];
}

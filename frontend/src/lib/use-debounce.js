import { useEffect, useState } from "react";

/**
 * useDebounce
 * Delays updating a value until after a given delay.
 * Great for search boxes or filters (e.g., with Fuse.js)
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

import { useState, useEffect } from "react";

/**
 * Debounce hook untuk menunda eksekusi nilai
 * Digunakan untuk FAQ suggestion saat mengetik
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timer untuk update nilai setelah delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timer jika value berubah sebelum delay selesai
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
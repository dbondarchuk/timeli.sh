"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * A hook that returns a throttled version of the provided callback function.
 * The throttled function will execute at most once per specified time period,
 * regardless of how many times it's called.
 *
 * @param callback - The function to throttle
 * @param deps - Dependencies array (same as useCallback)
 * @param delay - The throttle delay in milliseconds (default: 500)
 * @returns A throttled version of the callback function
 */
export const useThrottleCallback = <T extends (...args: Parameters<T>) => any>(
  callback: T,
  deps: React.DependencyList,
  delay: number = 500,
): T => {
  const lastExecutedRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastExecutedRef.current >= delay) {
        // If enough time has passed, execute immediately
        lastExecutedRef.current = now;
        callback(...args);
      } else {
        // If not enough time has passed, schedule execution for later
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        const timeSinceLastExecution = now - lastExecutedRef.current;
        const remainingDelay = delay - timeSinceLastExecution;

        timeoutRef.current = setTimeout(() => {
          lastExecutedRef.current = Date.now();
          callback(...args);
        }, remainingDelay);
      }
    },
    [delay, ...deps],
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []); // Empty dependency array means this effect runs only on mount and unmount

  return throttledCallback;
};

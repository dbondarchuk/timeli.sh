import React from "react";

export const useDebounceCacheFn = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number = 300,
) => {
  const cache = React.useRef<Record<string, boolean>>({});
  type FnReturnType = Awaited<ReturnType<T>>;

  // Debounced/cancellable unique slug check
  const checkTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const checkPromises = React.useRef<
    Record<
      string,
      { resolve: (v: FnReturnType) => void; reject: (e: any) => void }
    >
  >({});

  const lastKey = React.useRef<string | undefined>(undefined);
  const lastPromise = React.useRef<Promise<FnReturnType> | null>(null);

  const cachedFn = React.useCallback(
    (...args: Parameters<T>): Promise<FnReturnType> => {
      // Cancel previous timeout if any
      if (checkTimeout.current) {
        clearTimeout(checkTimeout.current);
        checkTimeout.current = null;
        lastPromise.current = null;
      }

      const key = JSON.stringify(args);

      // If we already have a promise for this slug, return it
      if (lastPromise.current && lastKey.current === key) {
        return lastPromise.current;
      }

      // Otherwise, create a new promise that will resolve after a delay
      lastKey.current = key;
      lastPromise.current = new Promise((resolve, reject) => {
        checkPromises.current[key] = { resolve, reject };
        checkTimeout.current = setTimeout(async () => {
          try {
            const result = await fn(...args);
            cache.current[key] = result;
            // Only resolve if this is still the latest slug checked
            if (lastKey.current === key) {
              resolve(result);
            }
          } catch (e) {
            if (lastKey.current === key) {
              reject(e);
            }
          } finally {
            checkTimeout.current = null;
          }
        }, delay); // 300ms debounce
      });

      return lastPromise.current;
    },
    [fn, delay],
  );

  return cachedFn;
};

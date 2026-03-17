import { useQueryState } from "nuqs";
import { useCallback } from "react";

/**
 * Hook to reload the page by updating the timestamp query parameter.
 * @returns {Object} An object containing the refresh key and the reload function.
 * @returns {string} refreshKey - The current refresh key.
 * @returns {() => void} reload - A function to reload the page by updating the timestamp query parameter.
 */
export const useReload = () => {
  const [refreshKey, _reload] = useQueryState("ts", {
    history: "replace",
    shallow: false,
  });

  const reload = useCallback(() => {
    _reload(`${new Date().getTime()}`);
  }, [_reload]);

  return { refreshKey, reload };
};

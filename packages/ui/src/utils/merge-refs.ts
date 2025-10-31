import { ForwardedRef, RefObject } from "react";

/**
 * Merges multiple refs into one. Works with either callback or object refs.
 */
export function mergeRefs<T>(
  ...refs: Array<ForwardedRef<T> | RefObject<T> | null | undefined>
): ForwardedRef<T> {
  if (refs.length === 1 && refs[0]) {
    return refs[0];
  }

  return (value: T | null) => {
    for (let ref of refs) {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        ref.current = value;
      }
    }
  };
}

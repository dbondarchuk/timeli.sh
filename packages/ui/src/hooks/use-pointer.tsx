"use client";

import { useCallback, useEffect, useState } from "react";

interface PointerPosition {
  x: number;
  y: number;
  isActive: boolean;
}

interface UsePointerOptions {
  resetOnExit?: boolean;
}

export function usePointer<T extends HTMLElement = HTMLElement>(
  options: UsePointerOptions = {},
) {
  const { resetOnExit = true } = options;

  const [position, setPosition] = useState<PointerPosition>({
    x: 0,
    y: 0,
    isActive: false,
  });

  const [element, setElement] = useState<T | null>(null);

  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  const updatePosition = useCallback(
    (event: PointerEvent) => {
      if (element) {
        const rect = element.getBoundingClientRect();
        const x = Math.max(0, Math.round(event.clientX - rect.left));
        const y = Math.max(0, Math.round(event.clientY - rect.top));
        setPosition({ x, y, isActive: true });
      } else {
        setPosition({
          x: event.clientX,
          y: event.clientY,
          isActive: true,
        });
      }
    },
    [element],
  );

  const resetPosition = useCallback(() => {
    setPosition({ x: 0, y: 0, isActive: false });
  }, []);

  useEffect(() => {
    const target = element || document;

    // Pointer events cover mouse + touch + pen
    target.addEventListener("pointermove", updatePosition as any);
    target.addEventListener("pointerdown", updatePosition as any);

    if (resetOnExit) {
      target.addEventListener("pointerleave", resetPosition);
      target.addEventListener("pointerup", resetPosition);
      target.addEventListener("pointercancel", resetPosition);
    }

    return () => {
      target.removeEventListener("pointermove", updatePosition as any);
      target.removeEventListener("pointerdown", updatePosition as any);

      if (resetOnExit) {
        target.removeEventListener("pointerleave", resetPosition);
        target.removeEventListener("pointerup", resetPosition);
        target.removeEventListener("pointercancel", resetPosition);
      }
    };
  }, [element, updatePosition, resetPosition, resetOnExit]);

  return {
    ref,
    x: position.x,
    y: position.y,
    isActive: position.isActive,
  };
}

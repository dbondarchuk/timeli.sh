"use client";

import React from "react";

import { cn, createPrimitiveElement, withRef, withVariants } from "@udecode/cn";
import {
  type ResizeHandle as ResizeHandlePrimitive,
  isTouchEvent,
  Resizable as ResizablePrimitive,
  ResizeHandleOptions,
  useResizeHandle,
  useResizeHandleValue,
} from "@udecode/plate-resizable";
import { useReadOnly } from "@udecode/plate/react";
import { cva } from "class-variance-authority";
import { useWindow } from "./window-context";

export const mediaResizeHandleVariants = cva(
  cn(
    "top-0 flex w-6 flex-col justify-center select-none",
    "after:flex after:h-16 after:w-[3px] after:rounded-[6px] after:bg-ring after:opacity-0 after:content-['_'] group-hover:after:opacity-100",
  ),
  {
    variants: {
      direction: {
        left: "-left-3 -ml-3 pl-3",
        right: "-right-3 -mr-3 items-end pr-3",
      },
    },
  },
);

export const useResizeHandleState = ({
  direction = "left",
  initialSize: _initialSize,
  onHover,
  onHoverEnd,
  onMouseDown,
  onResize: onResizeProp,
  onTouchStart,
}: ResizeHandleOptions) => {
  const readOnly = useReadOnly();
  const onResizeStore = useResizeHandleValue("onResize");
  const onResize = onResizeProp ?? onResizeStore;
  const window = useWindow();

  const [isResizing, setIsResizing] = React.useState(false);
  const [initialPosition, setInitialPosition] = React.useState(0);
  const [initialSizeState, setInitialSize] = React.useState(0);
  const initialSize = _initialSize ?? initialSizeState;

  const isHorizontal = direction === "left" || direction === "right";

  React.useEffect(() => {
    if (!isResizing) return;

    const sendResizeEvent = (
      event: MouseEvent | TouchEvent,
      finished: boolean,
    ) => {
      const { clientX, clientY } = isTouchEvent(event)
        ? event.touches[0] || event.changedTouches[0]
        : event;

      const currentPosition = isHorizontal ? clientX : clientY;
      const delta = currentPosition - initialPosition;
      onResize({
        delta,
        direction,
        finished,
        initialSize,
      });
    };

    const handleMouseMove = (event: MouseEvent | TouchEvent) =>
      sendResizeEvent(event, false);

    const handleMouseUp = (event: MouseEvent | TouchEvent) => {
      setIsResizing(false);
      onHoverEnd?.();
      sendResizeEvent(event, true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [
    isResizing,
    initialPosition,
    initialSize,
    onResize,
    isHorizontal,
    onHoverEnd,
    direction,
  ]);

  return {
    direction,
    initialPosition,
    initialSize,
    isHorizontal,
    isResizing,
    readOnly,
    setInitialPosition,
    setInitialSize,
    setIsResizing,
    onHover,
    onHoverEnd,
    onMouseDown,
    onResize,
    onTouchStart,
  };
};

const resizeHandleVariants = cva(cn("absolute z-40"), {
  variants: {
    direction: {
      bottom: "w-full cursor-row-resize",
      left: "h-full cursor-col-resize",
      right: "h-full cursor-col-resize",
      top: "w-full cursor-row-resize",
    },
  },
});

const ResizeHandleVariants = withVariants(
  createPrimitiveElement("div"),
  resizeHandleVariants,
  ["direction"],
);

export const ResizeHandle = withRef<typeof ResizeHandlePrimitive>(
  ({ options, ...props }, ref) => {
    const state = useResizeHandleState(options ?? {});
    const resizeHandle = useResizeHandle(state);

    if (state.readOnly) return null;

    return (
      <ResizeHandleVariants
        ref={ref}
        data-resizing={state.isResizing}
        direction={options?.direction}
        {...resizeHandle.props}
        {...props}
      />
    );
  },
);

const resizableVariants = cva("", {
  variants: {
    align: {
      center: "mx-auto",
      left: "mr-auto",
      right: "ml-auto",
    },
  },
});

export const Resizable = withVariants(ResizablePrimitive, resizableVariants, [
  "align",
]);

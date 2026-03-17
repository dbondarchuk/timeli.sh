"use client";

import { cn } from "@timelish/ui";
import type React from "react";
import { useCallback, useRef } from "react";
import { useEditorStore } from "../lib/store";
import type {
  Element,
  GroupElement as GroupElementType,
  ImageElement,
  Paint,
  ShapeElement,
  TextElement,
} from "../lib/types";
import { EditorContextMenu } from "./context-menu";

interface GroupElementProps {
  element: GroupElementType;
  zoom: number;
  mode: "edit" | "preview";
  marqueeHoverIds: string[];
  allowGrouping: boolean;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function resolvePaintCss(paint: Paint | undefined, fallback: string): string {
  if (!paint || paint.type === "none") return "transparent";
  if (paint.type === "color") return paint.color || fallback;
  if (paint.type === "gradient" && paint.gradient) {
    const { type, colors, angle } = paint.gradient;
    return type === "linear"
      ? `linear-gradient(${angle ?? 0}deg, ${colors.join(", ")})`
      : `radial-gradient(circle, ${colors.join(", ")})`;
  }
  if (paint.type === "image" && paint.image?.src) {
    return `url(${paint.image.src})`;
  }
  return fallback;
}

/** Renders a single child's visual content (no interactivity). */
function ChildContent({ child }: { child: Element }) {
  if (child.type === "text") {
    const el = child as TextElement;
    const alignMap: Record<string, string> = {
      left: "flex-start",
      center: "center",
      right: "flex-end",
    };
    return (
      <div
        className="w-full h-full flex items-center px-2 whitespace-pre-wrap overflow-hidden"
        style={{
          fontFamily: el.styles.fontFamily || "inherit",
          fontSize: el.styles.fontSize || 16,
          fontWeight: el.styles.fontWeight || 400,
          lineHeight: el.styles.lineHeight || 1.5,
          color: el.styles.color || "#000000",
          backgroundColor: el.styles.backgroundColor || "transparent",
          justifyContent:
            alignMap[el.styles.textAlign ?? "left"] ?? "flex-start",
        }}
      >
        {el.content}
      </div>
    );
  }

  if (child.type === "image") {
    const el = child as ImageElement;
    return (
      <img
        src={el.src || "/placeholder.svg"}
        alt=""
        className="w-full h-full"
        style={{
          objectFit: el.styles.objectFit || "contain",
          display: "block",
        }}
        draggable={false}
      />
    );
  }

  if (child.type === "shape") {
    const el = child as ShapeElement;
    const fillPaint =
      el.styles.fillPaint ??
      (el.styles.fill
        ? { type: "color" as const, color: el.styles.fill }
        : undefined);
    const strokePaint =
      el.styles.strokePaint ??
      (el.styles.stroke
        ? { type: "color" as const, color: el.styles.stroke }
        : undefined);
    const fillCss = resolvePaintCss(fillPaint, "transparent");
    const isGradientOrImage =
      fillPaint?.type === "gradient" || fillPaint?.type === "image";
    const strokeColor =
      strokePaint?.type === "color"
        ? strokePaint.color
        : el.styles.stroke || undefined;
    const strokeWidth = el.styles.strokeWidth || 1;

    if (el.shapeType === "line") {
      return (
        <div
          style={{
            width: "100%",
            height: strokeWidth || 2,
            background: resolvePaintCss(strokePaint ?? fillPaint, "#000000"),
          }}
        />
      );
    }
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          border: strokeColor
            ? `${strokeWidth}px solid ${strokeColor}`
            : "none",
          borderRadius:
            el.shapeType === "circle" ? "50%" : el.styles.borderRadius || 0,
          ...(isGradientOrImage
            ? {
                background: fillCss,
                backgroundSize: fillPaint?.image?.fit || "cover",
              }
            : { backgroundColor: fillCss }),
        }}
      />
    );
  }

  return null;
}

const HANDLE_SIZE = 8;

export function GroupElementRenderer({
  element,
  zoom,
  mode,
  marqueeHoverIds,
  allowGrouping,
}: GroupElementProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { design, selectedElements, selectElement, updateElement } =
    useEditorStore();

  const isSelected = selectedElements.includes(element.id);
  const isMarqueeHover = marqueeHoverIds.includes(element.id);

  const children = element.children
    .map((id) => design.elements.find((el) => el.id === id))
    .filter(Boolean) as Element[];

  // ── Drag ──────────────────────────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (mode === "preview" || e.button !== 0) return;
      e.stopPropagation();

      if (e.shiftKey) {
        selectElement(element.id, true);
      } else if (!selectedElements.includes(element.id)) {
        selectElement(element.id);
      }

      const startX = e.clientX;
      const startY = e.clientY;
      const origX = element.position.x;
      const origY = element.position.y;

      const onMove = (ev: MouseEvent) => {
        ev.preventDefault();
        const dx = (ev.clientX - startX) / zoom;
        const dy = (ev.clientY - startY) / zoom;
        updateElement(element.id, {
          position: { x: origX + dx, y: origY + dy },
        });
      };

      const onUp = () => {
        useEditorStore.getState().pushHistory();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [element, zoom, mode, selectedElements, selectElement, updateElement],
  );

  // ── Resize (bottom-right handle) ──────────────────────────────────────────
  // Scale the group bounding box AND all children proportionally.
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;
      const startW = element.size.width;
      const startH = element.size.height;

      // Capture each child's current size and position at drag-start
      const childSnapshots = children.map((c) => ({
        id: c.id,
        x: c.position.x,
        y: c.position.y,
        w: c.size.width,
        h: c.size.height,
        fontSize:
          c.type === "text" ? ((c as TextElement).styles?.fontSize ?? 16) : 0,
        fontSizeLocked:
          c.type === "text"
            ? !!(c as TextElement).styles?.fontSizeLocked
            : true,
        styles: c.type === "text" ? (c as TextElement).styles : null,
      }));

      const onMove = (ev: MouseEvent) => {
        ev.preventDefault();
        const dw = (ev.clientX - startX) / zoom;
        const dh = (ev.clientY - startY) / zoom;
        const newW = Math.max(20, startW + dw);
        const newH = Math.max(20, startH + dh);
        const scaleX = newW / startW;
        const scaleY = newH / startH;

        // Update group bounding box
        updateElement(element.id, { size: { width: newW, height: newH } });

        // Scale each child's size and position relative to group origin
        childSnapshots.forEach((snap) => {
          const updates: any = {
            position: { x: snap.x * scaleX, y: snap.y * scaleY },
            size: {
              width: Math.max(4, snap.w * scaleX),
              height: Math.max(4, snap.h * scaleY),
            },
          };
          if (!snap.fontSizeLocked && snap.styles) {
            const fontScale = Math.min(scaleX, scaleY);
            updates.styles = {
              ...snap.styles,
              fontSize: Math.max(6, Math.round(snap.fontSize * fontScale)),
            };
          }
          updateElement(snap.id, updates);
        });
      };

      const onUp = () => {
        useEditorStore.getState().pushHistory();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [element, zoom, children, updateElement],
  );

  // ── Rotate ────────────────────────────────────────────────────────────────
  const handleRotateMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const startAngle =
        Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      const origRotation = element.rotation;

      const onMove = (ev: MouseEvent) => {
        ev.preventDefault();
        const currentAngle =
          Math.atan2(ev.clientY - centerY, ev.clientX - centerX) *
          (180 / Math.PI);
        updateElement(element.id, {
          rotation: (origRotation + currentAngle - startAngle + 360) % 360,
        });
      };
      const onUp = () => {
        useEditorStore.getState().pushHistory();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [element, updateElement],
  );

  return (
    <EditorContextMenu elementId={element.id} allowGrouping={allowGrouping}>
      <div
        ref={wrapperRef}
        className={cn(
          "absolute select-none",
          mode === "edit" && "cursor-move",
          isSelected && mode === "edit" && "ring-2 ring-primary",
          isMarqueeHover &&
            mode === "edit" &&
            !isSelected &&
            "ring-2 ring-primary/50",
        )}
        style={{
          left: element.position.x * zoom,
          top: element.position.y * zoom,
          width: element.size.width * zoom,
          height: element.size.height * zoom,
          transform: `rotate(${element.rotation}deg)`,
          opacity: element.opacity,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Children rendered with relative positions */}
        {children.map((child) => (
          <div
            key={child.id}
            className="absolute pointer-events-none"
            style={{
              left: child.position.x * zoom,
              top: child.position.y * zoom,
              width: child.size.width * zoom,
              height: child.size.height * zoom,
              transform: `rotate(${child.rotation}deg)`,
              opacity: child.opacity,
            }}
          >
            <ChildContent child={child} />
          </div>
        ))}

        {/* Selection handles */}
        {isSelected && mode === "edit" && (
          <>
            {/* Rotation line */}
            <div
              className="absolute bg-primary pointer-events-none z-10"
              style={{
                width: 1,
                height: 14,
                top: -14,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
            {/* Rotate handle */}
            <div
              className="absolute bg-white border-2 border-primary rounded-full cursor-crosshair z-20"
              style={{
                width: HANDLE_SIZE,
                height: HANDLE_SIZE,
                top: -(14 + HANDLE_SIZE),
                left: "50%",
                transform: "translateX(-50%)",
              }}
              onMouseDown={handleRotateMouseDown}
            />
            {/* Resize handle (bottom-right) */}
            <div
              className="absolute bg-white border-2 border-primary cursor-se-resize z-20"
              style={{
                width: HANDLE_SIZE,
                height: HANDLE_SIZE,
                bottom: -HANDLE_SIZE / 2,
                right: -HANDLE_SIZE / 2,
              }}
              onMouseDown={handleResizeMouseDown}
            />
          </>
        )}
      </div>
    </EditorContextMenu>
  );
}

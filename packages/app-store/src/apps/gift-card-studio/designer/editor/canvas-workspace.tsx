"use client";

import type React from "react";

import { cn } from "@timelish/ui";
import { useEffect, useRef, useState } from "react";
import { isTypingInInput } from "../lib/keyboard";
import { useEditorStore } from "../lib/store";
import type { GroupElement } from "../lib/types";
import { AlignmentGuides } from "./alignment-guides";
import { CanvasElement } from "./canvas-element";
import { EditorContextMenu } from "./context-menu";
import { GroupElementRenderer } from "./group-element";

interface CanvasWorkspaceProps {
  allowGrouping?: boolean;
}

export function CanvasWorkspace({
  allowGrouping = true,
}: CanvasWorkspaceProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const preventUnselectionRef = useRef(false);
  const {
    design,
    zoom,
    pan,
    mode,
    clearSelection,
    setPan,
    selectedElements,
    disabled,
  } = useEditorStore();
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState({ x: 0, y: 0 });
  const [marqueeEnd, setMarqueeEnd] = useState({ x: 0, y: 0 });
  const [marqueeHoverIds, setMarqueeHoverIds] = useState<string[]>([]);

  const canvasTheme = design.canvas.theme || "light";

  const activeElements = design.elements.filter((el) =>
    selectedElements.includes(el.id),
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        setIsAltPressed(true);
      }

      // Ignore all editor shortcuts when the user is typing in any input,
      // textarea, select, or contenteditable element (including properties panel
      // inputs and in-canvas text editing).
      if (isTypingInInput(e)) return;

      // Copy shortcut (Cmd/Ctrl+C)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
        if (selectedElements.length > 0) {
          e.preventDefault();
          useEditorStore.getState().copySelectedElements();
        }
      }

      // Paste shortcut (Cmd/Ctrl+V)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
        e.preventDefault();
        useEditorStore.getState().pasteElements();
      }

      // Prevent default for editor shortcuts
      if (
        (e.metaKey || e.ctrlKey) &&
        ["z", "y", "d", "c", "v"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        setIsAltPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedElements]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (preventUnselectionRef.current) {
        preventUnselectionRef.current = false;
      } else {
        clearSelection();
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (mode === "preview") return;

    if (e.button === 0 && e.target === e.currentTarget) {
      // Left click on canvas background - start marquee selection
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        setIsMarqueeSelecting(true);
        setMarqueeStart({ x, y });
        setMarqueeEnd({ x, y });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Middle mouse button or shift + left click
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (isMarqueeSelecting) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        setMarqueeEnd({ x, y });

        // Calculate which elements are currently under the marquee
        const minX = Math.min(marqueeStart.x, x);
        const minY = Math.min(marqueeStart.y, y);
        const maxX = Math.max(marqueeStart.x, x);
        const maxY = Math.max(marqueeStart.y, y);

        const hoverIds = design.elements
          .filter((el) => {
            if (el.type === "group") {
              const elMinX = el.position.x;
              const elMinY = el.position.y;
              const elMaxX = el.position.x + el.size.width;
              const elMaxY = el.position.y + el.size.height;
              return !(
                elMaxX < minX ||
                elMinX > maxX ||
                elMaxY < minY ||
                elMinY > maxY
              );
            }

            const groups = design.elements.filter(
              (e) => e.type === "group",
            ) as any[];
            const parentGroup = groups.find((g) => g.children?.includes(el.id));
            if (parentGroup) return false;

            const elMinX = el.position.x;
            const elMinY = el.position.y;
            const elMaxX = el.position.x + el.size.width;
            const elMaxY = el.position.y + el.size.height;
            return !(
              elMaxX < minX ||
              elMinX > maxX ||
              elMaxY < minY ||
              elMinY > maxY
            );
          })
          .map((el) => el.id);

        setMarqueeHoverIds(hoverIds);
      }
    }
  };

  const handleMouseUp = () => {
    if (isMarqueeSelecting) {
      // Calculate final selection when mouse is released
      const minX = Math.min(marqueeStart.x, marqueeEnd.x);
      const minY = Math.min(marqueeStart.y, marqueeEnd.y);
      const maxX = Math.max(marqueeStart.x, marqueeEnd.x);
      const maxY = Math.max(marqueeStart.y, marqueeEnd.y);

      // Only select if marquee has some size (reduced threshold)
      if (Math.abs(maxX - minX) > 1 || Math.abs(maxY - minY) > 1) {
        const selectedIds = design.elements
          .filter((el) => {
            // Include groups in selection
            if (el.type === "group") {
              const elMinX = el.position.x;
              const elMinY = el.position.y;
              const elMaxX = el.position.x + el.size.width;
              const elMaxY = el.position.y + el.size.height;
              return !(
                elMaxX < minX ||
                elMinX > maxX ||
                elMaxY < minY ||
                elMinY > maxY
              );
            }

            // Check if element is part of a group
            const groups = design.elements.filter(
              (e) => e.type === "group",
            ) as any[];
            const parentGroup = groups.find((g) => g.children?.includes(el.id));

            // If in a group, skip (group will be selected instead)
            if (parentGroup) return false;

            const elMinX = el.position.x;
            const elMinY = el.position.y;
            const elMaxX = el.position.x + el.size.width;
            const elMaxY = el.position.y + el.size.height;

            // Check if element touches the marquee box
            return !(
              elMaxX < minX ||
              elMinX > maxX ||
              elMaxY < minY ||
              elMinY > maxY
            );
          })
          .map((el) => el.id);

        useEditorStore.getState().selectMultiple(selectedIds);
        preventUnselectionRef.current = true;
      }
    }

    setIsPanning(false);
    setIsMarqueeSelecting(false);
    setMarqueeHoverIds([]);
  };

  useEffect(() => {
    if (isPanning || isMarqueeSelecting) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isPanning, isMarqueeSelecting, panStart, marqueeStart, marqueeEnd]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      useEditorStore.getState().setZoom(zoom + delta);
    }
  };

  const { selectElement } = useEditorStore();

  const renderElements = () => {
    const renderedIds = new Set<string>();

    return design.elements.map((element) => {
      // Skip if already rendered as part of a group
      if (
        renderedIds.has(element.id) ||
        design.elements.some(
          (el) => el.type === "group" && el.children?.includes(element.id),
        )
      )
        return null;

      if (element.type === "group") {
        const groupElement = element as any;
        renderedIds.add(element.id);
        // Also mark children so they are not rendered standalone
        groupElement.children?.forEach((id: string) => renderedIds.add(id));

        return (
          <GroupElementRenderer
            key={element.id}
            element={element as GroupElement}
            zoom={zoom}
            mode={mode}
            marqueeHoverIds={marqueeHoverIds}
            allowGrouping={allowGrouping}
          />
        );
      }

      const isMarqueeHover = marqueeHoverIds.includes(element.id);

      return (
        <CanvasElement
          key={element.id}
          element={element}
          zoom={zoom}
          mode={mode}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          allowGrouping={allowGrouping}
          marqueeHover={isMarqueeHover}
        />
      );
    });
  };

  const getCanvasBackgroundStyle = () => {
    const bg = design.canvas.background;
    if (!bg) {
      return {
        backgroundColor: canvasTheme === "dark" ? "#1a1a1a" : "#ffffff",
      };
    }

    if (bg.type === "color") {
      return { backgroundColor: bg.color || "#ffffff" };
    }

    if (bg.type === "gradient" && bg.gradient) {
      const { type, colors, angle } = bg.gradient;
      if (type === "linear") {
        return {
          background: `linear-gradient(${angle || 0}deg, ${colors.join(", ")})`,
        };
      } else {
        return {
          background: `radial-gradient(circle, ${colors.join(", ")})`,
        };
      }
    }

    if (bg.type === "image" && bg.image) {
      return {
        backgroundImage: `url(${bg.image.src})`,
        backgroundSize: bg.image.fit || "cover",
        backgroundPosition: bg.image.position || "center",
        backgroundRepeat: "no-repeat",
      };
    }

    return { backgroundColor: canvasTheme === "dark" ? "#1a1a1a" : "#ffffff" };
  };

  const marqueeRect = isMarqueeSelecting
    ? {
        left: Math.min(marqueeStart.x, marqueeEnd.x) * zoom,
        top: Math.min(marqueeStart.y, marqueeEnd.y) * zoom,
        width: Math.abs(marqueeEnd.x - marqueeStart.x) * zoom,
        height: Math.abs(marqueeEnd.y - marqueeStart.y) * zoom,
      }
    : null;

  return (
    <div
      ref={containerRef}
      className={cn("flex-1 grid min-w-0 overflow-hidden relative bg-muted/30")}
      id="gift-card-editor-canvas"
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
    >
      <div className="w-full h-full overflow-auto p-12">
        <div className="flex items-center justify-center min-w-full min-h-full">
          <EditorContextMenu allowGrouping={allowGrouping}>
            <div
              ref={canvasRef}
              className="relative shadow-2xl select-none"
              style={{
                ...getCanvasBackgroundStyle(),
                width: design.canvas.width * zoom,
                height: design.canvas.height * zoom,
                minWidth: design.canvas.width * zoom,
                minHeight: design.canvas.height * zoom,
                transform: `translate(${pan.x}px, ${pan.y}px)`,
                userSelect: "none",
                WebkitUserSelect: "none",
                overflow: mode === "preview" ? "hidden" : "visible",
              }}
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
            >
              {renderElements()}

              {/* Marquee Selection Box */}
              {marqueeRect && mode === "edit" && (
                <div
                  className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
                  style={{
                    left: marqueeRect.left,
                    top: marqueeRect.top,
                    width: marqueeRect.width,
                    height: marqueeRect.height,
                  }}
                />
              )}

              {/* Alignment Guides */}
              {mode === "edit" && isDragging && activeElements.length > 0 && (
                <AlignmentGuides
                  activeElements={activeElements}
                  allElements={design.elements}
                  canvasWidth={design.canvas.width}
                  canvasHeight={design.canvas.height}
                  zoom={zoom}
                  isAltPressed={isAltPressed}
                />
              )}

              {/* Grid overlay in edit mode */}
              {mode === "edit" && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                    linear-gradient(to right, ${canvasTheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 1px, transparent 1px),
                    linear-gradient(to bottom, ${canvasTheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 1px, transparent 1px)
                  `,
                    backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                  }}
                />
              )}
            </div>
          </EditorContextMenu>
        </div>
      </div>

      {mode === "edit" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs px-3 py-2 rounded-lg pointer-events-none">
          Shortcuts: Arrows (Move) • Shift+Arrows (Move 10px) • Ctrl+C (Copy) •
          Ctrl+V (Paste) • Ctrl+Z (Undo) • Ctrl+Shift+Z (Redo) • Ctrl+D
          (Duplicate) • Del (Delete)
        </div>
      )}
    </div>
  );
}

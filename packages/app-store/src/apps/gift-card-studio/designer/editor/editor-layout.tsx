"use client";

import { useEffect } from "react";
import { EDITOR_FONTS } from "../lib/fonts";
import { isTypingInInput } from "../lib/keyboard";
import { useEditorStore } from "../lib/store";
import { CanvasWorkspace } from "./canvas-workspace";
import { LayersPanel } from "./layers-panel";
import { PropertiesPanel } from "./properties-panel";
import { Sidebar } from "./sidebar";
import { Toolbar } from "./toolbar";

interface EditorLayoutProps {
  allowGrouping?: boolean;
  /** When true, use h-full instead of h-screen so the editor fits inside a parent container (e.g. form). */
  embedded?: boolean;
}

export function EditorLayout({
  allowGrouping = true,
  embedded = false,
}: EditorLayoutProps = {}) {
  const {
    undo,
    redo,
    deleteElement,
    selectedElements,
    duplicateElement,
    updateElement,
    design,
  } = useEditorStore();

  // Inject Google Fonts stylesheet so previews render correctly
  useEffect(() => {
    const id = "editor-font-preload";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    // Load all editor fonts in regular + bold so dropdown previews look right
    const params = EDITOR_FONTS.map(
      (f) => `family=${encodeURIComponent(f.value)}:wght@400;700`,
    ).join("&");
    link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Never fire editor shortcuts while the user is typing in an input,
      // textarea, select, or contenteditable (properties panel / in-canvas text).
      if (isTypingInInput(e)) return;

      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
        selectedElements.length > 0
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1; // Larger step with shift
        const dx =
          e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy =
          e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;

        selectedElements.forEach((id) => {
          const element = design.elements.find((el) => el.id === id);
          if (element && !element.locked) {
            updateElement(id, {
              position: {
                x: element.position.x + dx,
                y: element.position.y + dy,
              },
            });
          }
        });
        useEditorStore.getState().pushHistory();
        return;
      }

      // Undo: Cmd/Ctrl + Z
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") ||
        ((e.metaKey || e.ctrlKey) && e.key === "y")
      ) {
        e.preventDefault();
        redo();
      }

      // Delete: Delete or Backspace
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedElements.length > 0
      ) {
        e.preventDefault();
        selectedElements.forEach((id) => deleteElement(id));
      }

      // Duplicate: Cmd/Ctrl + D
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "d" &&
        selectedElements.length > 0
      ) {
        e.preventDefault();
        selectedElements.forEach((id) => duplicateElement(id));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    undo,
    redo,
    deleteElement,
    selectedElements,
    duplicateElement,
    updateElement,
    design.elements,
  ]);

  return (
    <div
      className={
        embedded
          ? "h-full flex flex-col bg-background"
          : "h-screen flex flex-col bg-background"
      }
    >
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <CanvasWorkspace allowGrouping={allowGrouping} />
        <div className="w-80 border-l border-border flex flex-col">
          <PropertiesPanel />
          <LayersPanel allowGrouping={allowGrouping} />
        </div>
      </div>
    </div>
  );
}

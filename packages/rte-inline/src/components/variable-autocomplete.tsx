"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VariableData } from "../lib/rich-text-types";

interface VariableAutocompleteProps {
  position: { top: number; left: number };
  query: string;
  variables: VariableData;
  onSelect: (variable: string) => void;
  onClose: () => void;
}

export function VariableAutocomplete({
  position,
  query,
  variables,
  onSelect,
  onClose,
}: VariableAutocompleteProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const flattenVariables = (obj: VariableData, prefix = ""): string[] => {
      const result: string[] = [];

      for (const key in obj) {
        const value = obj[key];
        const path = prefix ? `${prefix}.${key}` : key;

        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          result.push(...flattenVariables(value as VariableData, path));
        } else {
          result.push(path);
        }
      }

      return result;
    };

    const allPaths = flattenVariables(variables);
    const filtered = query
      ? allPaths.filter((path) =>
          path.toLowerCase().includes(query.toLowerCase()),
        )
      : allPaths;

    setSuggestions(filtered.slice(0, 10));
    setSelectedIndex(0);
  }, [query, variables]);

  const handleSelect = useCallback(
    (variable: string) => {
      onSelect(variable);
      onClose();
    },
    [onSelect, onClose],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (suggestions.length === 0) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSelect(suggestions[selectedIndex]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, suggestions, selectedIndex, handleSelect]);

  const getPreviewValue = (path: string): string => {
    const keys = path.split(".");
    let value: any = variables;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return "";
    }

    if (typeof value === "object" && value !== null) {
      return "[Object]";
    }

    return String(value);
  };

  if (suggestions.length === 0) return null;

  return (
    <div
      ref={ref}
      className="absolute z-50 animate-in fade-in-0 slide-in-from-bottom-2"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
    >
      <div className="max-h-80 w-64 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-lg">
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion}
            type="button"
            className={`w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${
              index === selectedIndex ? "bg-accent" : "hover:bg-accent/50"
            }`}
            onClick={() => handleSelect(suggestion)}
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="flex flex-col gap-0.5">
              <code className="text-xs font-medium">{`{{${suggestion}}}`}</code>
              <span className="text-xs text-muted-foreground truncate">
                {getPreviewValue(suggestion)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

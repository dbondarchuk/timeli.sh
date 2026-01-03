"use client";

import { colors, colorsLabels } from "@timelish/types";
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Input,
  ScrollArea,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  useDebounceCallback,
} from "@timelish/ui";
import {
  ArrowDownToLine,
  Bold,
  CaseSensitive,
  Eraser,
  Highlighter,
  Italic,
  Minus,
  MoreHorizontal,
  Palette,
  Plus,
  Redo2,
  Space,
  Strikethrough,
  Subscript,
  Superscript,
  Type,
  TypeOutline,
  Underline,
  Undo2,
} from "lucide-react";
import type React from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { TextMark } from "../lib/rich-text-types";
import { ColorPickerButton } from "./toolbar/color-picker";

interface FloatingToolbarProps {
  position: { top: number; left: number };
  activeMarks: Partial<TextMark>;
  hasMixed: Set<keyof TextMark>;
  onFormat: (
    type: keyof TextMark,
    value?: string | number | boolean | "inherit",
  ) => void;
  onFontSizeChange?: (size: number | "inherit") => void;
  onFontSizeAdjust?: (delta: number) => void;
  disabledFeatures?: (keyof TextMark | "clearFormat" | "undo" | "redo")[];
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  registerPopoverRef?: (element: HTMLElement | null) => () => void;
  onClearFormat?: () => void;
  documentElement?: Document;
}

const COMMON_FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72];

const FONT_FAMILIES = [
  { label: "Inherit", value: "inherit" },
  { label: "Sans Serif", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "Serif", value: "ui-serif, Georgia, serif" },
  { label: "Mono", value: "ui-monospace, monospace" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
];

const FONT_WEIGHTS = [
  { label: "Inherit", value: "inherit", preview: "" },
  { label: "Thin", value: 100, preview: "100" },
  { label: "Extra Light", value: 200, preview: "200" },
  { label: "Light", value: 300, preview: "300" },
  { label: "Regular", value: 400, preview: "400" },
  { label: "Medium", value: 500, preview: "500" },
  { label: "Semi Bold", value: 600, preview: "600" },
  { label: "Bold", value: 700, preview: "700" },
  { label: "Extra Bold", value: 800, preview: "800" },
  { label: "Black", value: 900, preview: "900" },
];

const LETTER_SPACINGS = [
  { label: "Inherit", value: "inherit" },
  { label: "Tight", value: "tight" },
  { label: "Normal", value: "normal" },
  { label: "Wide", value: "wide" },
];

const TEXT_TRANSFORMS = [
  { label: "Inherit", value: "inherit" },
  { label: "None", value: "none" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
];

const LINE_HEIGHTS = [
  { label: "Inherit", value: "inherit", preview: "" },
  { label: "Tight", value: 1, preview: "1" },
  { label: "Snug", value: 1.25, preview: "1.25" },
  { label: "Normal", value: 1.5, preview: "1.5" },
  { label: "Relaxed", value: 1.75, preview: "1.75" },
  { label: "Loose", value: 2, preview: "2" },
];

export const COLOR_NAMES = colors;

export const COLORS: Record<
  (typeof COLOR_NAMES)[number],
  { label: string; value: string }
> = COLOR_NAMES.reduce(
  (map, color) => ({
    ...map,
    [color]: {
      label: colorsLabels[color],
      value: `hsl(var(--value-${color}-color))`,
    },
  }),
  {} as Record<(typeof COLOR_NAMES)[number], { label: string; value: string }>,
);

export const FloatingToolbar = forwardRef<HTMLDivElement, FloatingToolbarProps>(
  (
    {
      position,
      activeMarks,
      hasMixed,
      onFormat,
      onFontSizeChange,
      onFontSizeAdjust,
      disabledFeatures = [],
      onUndo,
      onRedo,
      canUndo,
      canRedo,
      registerPopoverRef,
      onClearFormat,
      documentElement = document,
    },
    ref,
  ) => {
    const [adjustedPosition, setAdjustedPosition] = useState(position);
    const toolbarRef = useRef<HTMLDivElement>(null);

    const [fontSizeInput, setFontSizeInput] = useState<string>("");
    const [openPopover, setOpenPopover] = useState<string | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const shouldNotClosePopoverRef = useRef(false);

    useEffect(() => {
      if (!toolbarRef.current) return;

      const toolbar = toolbarRef.current;
      const rect = toolbar.getBoundingClientRect();
      const viewportWidth =
        documentElement.defaultView?.innerWidth ?? window.innerWidth;
      const viewportHeight =
        documentElement.defaultView?.innerHeight ?? window.innerHeight;

      let x = position.left - rect.width / 2;
      let y = position.top;

      // Keep within viewport bounds
      if (x < 10) x = 10;
      if (x + rect.width > viewportWidth - 10)
        x = viewportWidth - rect.width - 10;

      // If toolbar would be above viewport, show it below
      if (y < 10) y = position.top + 60;

      setAdjustedPosition({ top: y, left: x });
    }, [position]);

    useEffect(() => {
      if (hasMixed.has("fontSize")) {
        setFontSizeInput("");
      } else if (activeMarks.fontSize && activeMarks.fontSize !== "inherit") {
        setFontSizeInput(activeMarks.fontSize.toString());
      } else {
        setFontSizeInput("");
      }
    }, [activeMarks.fontSize, hasMixed]);

    const handleFontSizeInputOnChange = useDebounceCallback(
      (value: number) => {
        onFontSizeChange?.(value);
      },
      [onFontSizeChange],
      500,
    );

    const handleFontSizeInputChange = (value: string) => {
      setFontSizeInput(value);
      const parsed = Number.parseInt(value);
      if (!Number.isNaN(parsed) && parsed > 0) {
        shouldNotClosePopoverRef.current = true;
        handleFontSizeInputOnChange(parsed);
      }
    };

    const handleFontSizeInputKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onFontSizeAdjust?.(1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onFontSizeAdjust?.(-1);
      }
    };

    const currentFontWeight = useMemo(() => {
      if (activeMarks.fontWeight) return activeMarks.fontWeight;
      if (activeMarks.bold) return 700;
      return "inherit";
    }, [activeMarks.fontWeight, activeMarks.bold]);

    const isBoldActive =
      activeMarks.bold ||
      activeMarks.fontWeight === 700 ||
      hasMixed.has("bold");

    const handleKeyDown = (
      e: React.KeyboardEvent,
      items: any[],
      onSelect: (item: any) => void,
    ) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        onSelect(items[selectedIndex]);
        setOpenPopover(null);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpenPopover(null);
      }
    };

    const isDisabled = (
      feature: keyof TextMark | "clearFormat" | "undo" | "redo",
    ) => disabledFeatures.includes(feature as any);

    const handlePopoverContentRef = useCallback(
      (element: HTMLElement | null) => {
        if (registerPopoverRef) {
          return registerPopoverRef(element);
        }
      },
      [registerPopoverRef],
    );

    return (
      <Toolbar
        ref={ref}
        className="absolute z-[15] animate-in fade-in-0 zoom-in-95"
        style={{
          left: `${adjustedPosition.left}px`,
          top: `${adjustedPosition.top}px`,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg">
          <ToolbarGroup>
            {!isDisabled("undo") && onUndo && (
              <ToolbarButton
                size="sm"
                className="h-7 w-7 p-0"
                tooltip="Undo (⌘Z)"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo2 className="h-3.5 w-3.5" />
              </ToolbarButton>
            )}

            {!isDisabled("redo") && onRedo && (
              <ToolbarButton
                size="sm"
                className="h-7 w-7 p-0"
                onClick={onRedo}
                disabled={!canRedo}
                tooltip="Redo (⌘⇧Z)"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </ToolbarButton>
            )}
          </ToolbarGroup>
          <ToolbarGroup>
            {!isDisabled("fontSize") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ToolbarButton
                    size="sm"
                    className="h-7 px-2 text-xs font-mono"
                    tooltip="Font Size"
                  >
                    {hasMixed.has("fontSize") || !fontSizeInput ? (
                      <span className="text-muted-foreground">Size</span>
                    ) : (
                      `${fontSizeInput}px`
                    )}
                  </ToolbarButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <div className="mb-2 flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="xs"
                      className="h-5 w-5 p-0 bg-transparent"
                      onClick={(e) => {
                        onFontSizeAdjust?.(-1);
                        e.preventDefault();
                        e.stopPropagation();
                        shouldNotClosePopoverRef.current = true;
                      }}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min={8}
                      max={72}
                      step={1}
                      h="sm"
                      value={fontSizeInput}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleFontSizeInputChange(e.target.value);
                      }}
                      onKeyDown={handleFontSizeInputKeyDown}
                      // onMouseDown={(e) => e.stopPropagation()}
                      // onClick={(e) => e.stopPropagation()}
                      // onFocus={(e) => {
                      //   e.stopPropagation();
                      // }}
                      placeholder={hasMixed.has("fontSize") ? "Mixed" : "Size"}
                      className="h-7 w-16 flex-1 text-center text-xs"
                    />
                    <Button
                      variant="outline"
                      size="xs"
                      className="h-5 w-5 p-0 bg-transparent"
                      onClick={(e) => {
                        onFontSizeAdjust?.(1);
                        e.preventDefault();
                        e.stopPropagation();
                        shouldNotClosePopoverRef.current = true;
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-56">
                    <DropdownMenuItem
                      onClick={() => onFontSizeChange?.("inherit")}
                    >
                      Inherit
                    </DropdownMenuItem>
                    {COMMON_FONT_SIZES.map((size) => (
                      <DropdownMenuItem
                        key={size}
                        onClick={() => onFontSizeChange?.(size)}
                      >
                        {size}px
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!isDisabled("fontFamily") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ToolbarButton
                    size="sm"
                    className="h-7 w-7 p-0"
                    tooltip="Font Family"
                    pressed={
                      !!activeMarks.fontFamily &&
                      activeMarks.fontFamily !== "inherit"
                    }
                  >
                    <Type className="h-3.5 w-3.5" />
                  </ToolbarButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {FONT_FAMILIES.map((font) => (
                    <DropdownMenuCheckboxItem
                      key={font.value}
                      checked={
                        activeMarks.fontFamily === font.value ||
                        (!activeMarks.fontFamily && font.value === "inherit")
                      }
                      onCheckedChange={() => onFormat("fontFamily", font.value)}
                      style={
                        font.value !== "inherit"
                          ? { fontFamily: font.value }
                          : {}
                      }
                    >
                      {font.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!isDisabled("fontWeight") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ToolbarButton
                    size="sm"
                    className="h-7 w-7 p-0"
                    tooltip="Font Weight"
                    pressed={currentFontWeight !== "inherit"}
                  >
                    <TypeOutline className="h-3.5 w-3.5" />{" "}
                  </ToolbarButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {FONT_WEIGHTS.map((weight) => (
                    <DropdownMenuCheckboxItem
                      key={weight.value}
                      checked={currentFontWeight === weight.value}
                      onCheckedChange={() =>
                        onFormat("fontWeight", weight.value)
                      }
                    >
                      <span>
                        {weight.label}
                        {weight.preview && (
                          <span className="ml-1 text-muted-foreground text-xs">
                            ({weight.preview})
                          </span>
                        )}
                      </span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </ToolbarGroup>

          <ToolbarGroup>
            {!isDisabled("color") && (
              <ColorPickerButton
                mark="color"
                active={activeMarks.color !== undefined}
                onChange={(color) => {
                  onFormat("color", color);
                  setOpenPopover(null);
                }}
                open={openPopover === "color"}
                onClose={() => setOpenPopover(null)}
                onOpenChange={(open) => setOpenPopover(open ? "color" : null)}
                icon={Palette}
                tooltip="Text Color"
                contentRef={handlePopoverContentRef}
                color={activeMarks.color}
              />
            )}

            {!isDisabled("backgroundColor") && (
              <ColorPickerButton
                mark="backgroundColor"
                active={activeMarks.backgroundColor !== undefined}
                onChange={(color) => {
                  onFormat("backgroundColor", color);
                  setOpenPopover(null);
                }}
                open={openPopover === "backgroundColor"}
                onOpenChange={(open) =>
                  setOpenPopover(open ? "backgroundColor" : null)
                }
                onClose={() => setOpenPopover(null)}
                icon={Highlighter}
                tooltip="Highlight Color"
                contentRef={handlePopoverContentRef}
                color={activeMarks.backgroundColor}
              />
            )}
          </ToolbarGroup>

          <ToolbarGroup>
            {!isDisabled("bold") && (
              <ToolbarButton
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => {
                  onFormat("fontWeight", isBoldActive ? "inherit" : 700);
                }}
                pressed={isBoldActive}
                tooltip="Bold (⌘B)"
              >
                <Bold className="h-3.5 w-3.5" />
              </ToolbarButton>
            )}

            {!isDisabled("italic") && (
              <ToolbarButton
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onFormat("italic")}
                pressed={activeMarks.italic !== undefined}
                tooltip="Italic (⌘I)"
              >
                <Italic className="h-3.5 w-3.5" />
              </ToolbarButton>
            )}

            {!isDisabled("underline") && (
              <ToolbarButton
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onFormat("underline")}
                pressed={activeMarks.underline !== undefined}
                tooltip="Underline (⌘U)"
              >
                <Underline className="h-3.5 w-3.5" />
              </ToolbarButton>
            )}
          </ToolbarGroup>
          <ToolbarGroup>
            <DropdownMenu
              modal={false}
              open={openPopover === "more"}
              onOpenChange={(open) => setOpenPopover(open ? "more" : null)}
            >
              <DropdownMenuTrigger asChild>
                <ToolbarButton
                  size="sm"
                  className="h-7 w-7 p-0"
                  tooltip="More Options"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </ToolbarButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {!isDisabled("strikethrough") && (
                  <DropdownMenuCheckboxItem
                    checked={
                      activeMarks.strikethrough || hasMixed.has("strikethrough")
                    }
                    onCheckedChange={() => onFormat("strikethrough")}
                  >
                    <Strikethrough className="mr-2 h-3.5 w-3.5" />
                    Strikethrough
                  </DropdownMenuCheckboxItem>
                )}
                {!isDisabled("superscript") && (
                  <DropdownMenuCheckboxItem
                    checked={
                      activeMarks.superscript || hasMixed.has("superscript")
                    }
                    onCheckedChange={() => onFormat("superscript")}
                  >
                    <Superscript className="mr-2 h-3.5 w-3.5" />
                    Superscript
                  </DropdownMenuCheckboxItem>
                )}
                {!isDisabled("subscript") && (
                  <DropdownMenuCheckboxItem
                    checked={activeMarks.subscript || hasMixed.has("subscript")}
                    onCheckedChange={() => onFormat("subscript")}
                  >
                    <Subscript className="mr-2 h-3.5 w-3.5" />
                    Subscript
                  </DropdownMenuCheckboxItem>
                )}
                <DropdownMenuSeparator />
                {!isDisabled("letterSpacing") && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Space className="mr-2 h-3.5 w-3.5" />
                      Letter Spacing
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        value={activeMarks.letterSpacing}
                        onValueChange={(value) =>
                          onFormat("letterSpacing", value)
                        }
                      >
                        {LETTER_SPACINGS.map((spacing) => (
                          <DropdownMenuRadioItem
                            key={spacing.value}
                            value={spacing.value}
                          >
                            {spacing.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
                {!isDisabled("textTransform") && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <CaseSensitive className="mr-2 h-3.5 w-3.5" />
                      Text Transform
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        value={activeMarks.textTransform}
                        onValueChange={(value) =>
                          onFormat("textTransform", value)
                        }
                      >
                        {TEXT_TRANSFORMS.map((transform) => (
                          <DropdownMenuRadioItem
                            key={transform.value}
                            value={transform.value}
                          >
                            {transform.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
                {!isDisabled("lineHeight") && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ArrowDownToLine className="mr-2 h-3.5 w-3.5" />
                      Line Height
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        value={activeMarks.lineHeight?.toString()}
                        onValueChange={(value) => onFormat("lineHeight", value)}
                      >
                        {LINE_HEIGHTS.map((lineHeight) => (
                          <DropdownMenuRadioItem
                            key={lineHeight.value}
                            value={lineHeight.value?.toString()}
                          >
                            {lineHeight.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
                <DropdownMenuSeparator />
                {!isDisabled("clearFormat") && onClearFormat && (
                  <DropdownMenuItem onClick={() => onClearFormat()}>
                    <Eraser className="mr-2 h-3.5 w-3.5" />
                    Clear Formatting
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </ToolbarGroup>
        </div>
      </Toolbar>
    );
  },
);

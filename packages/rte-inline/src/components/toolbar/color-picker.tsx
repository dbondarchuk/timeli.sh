import { BuilderKeys, useI18n } from "@timelish/i18n";
import { colors } from "@timelish/types";
import {
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ToolbarButton,
  TooltipResponsive,
  TooltipResponsiveContent,
  TooltipResponsiveTrigger,
} from "@timelish/ui";
import { Sketch } from "@uiw/react-color";

export const COLOR_NAMES = colors;

export const COLORS: Record<
  (typeof COLOR_NAMES)[number],
  { label: BuilderKeys; value: string }
> = COLOR_NAMES.reduce(
  (map, color) => ({
    ...map,
    [color]: {
      label: `rte.colors.options.${color}` satisfies BuilderKeys,
      value: `hsl(var(--value-${color}-color))`,
    },
  }),
  {} as Record<
    (typeof COLOR_NAMES)[number],
    { label: BuilderKeys; value: string }
  >,
);

export interface ColorPickerButtonProps {
  mark: string;
  active?: boolean;
  onChange: (color: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose: () => void;
  icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  contentRef: (element: HTMLDivElement | null) => void;
  color: string | undefined;
}

export const ColorPickerButton = ({
  mark,
  active,
  onChange,
  open,
  onOpenChange,
  onClose,
  icon: Icon,
  tooltip,
  contentRef,
  color: currentColor,
}: ColorPickerButtonProps) => {
  const t = useI18n("builder");
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <ToolbarButton
          size="sm"
          className="h-7 w-7 p-0"
          tooltip={tooltip}
          pressed={active}
        >
          <Icon className="h-3.5 w-3.5" />
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent
        ref={contentRef}
        className="border-none w-min p-0 flex flex-col gap-2"
        align="start"
      >
        <Sketch
          color={currentColor || undefined}
          disableAlpha
          onChange={(c) => {
            const color = c.hex;
            onChange(color);
            onClose();
          }}
          presetColors={false}
          className="!shadow-none"
        />
        <div className="p-1 bg-card rounded-sm flex flex-col gap-2">
          <div className="flex flex-wrap gap-0.5 items-center justify-center">
            {Object.values(COLORS).map(({ value: color, label }) => (
              <TooltipResponsive>
                <TooltipResponsiveTrigger>
                  <button
                    key={color}
                    className={cn(
                      "size-6 rounded border border-border transition-transform hover:scale-110",
                      color === currentColor && "scale-105",
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onChange(color);
                      onClose();
                    }}
                    type="button"
                  />
                </TooltipResponsiveTrigger>
                <TooltipResponsiveContent>{t(label)}</TooltipResponsiveContent>
              </TooltipResponsive>
            ))}
          </div>
          <Button
            variant="outline"
            size="xs"
            className="w-full text-xs"
            onClick={() => {
              onChange("inherit");
              onClose();
            }}
          >
            {t("rte.common.inherit")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

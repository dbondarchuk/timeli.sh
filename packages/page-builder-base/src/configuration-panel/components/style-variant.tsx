import { BuilderKeys, useI18n } from "@vivid/i18n";
import { Button, Label } from "@vivid/ui";
import { Trash } from "lucide-react";
import { z } from "zod";
import {
  BaseStyleDictionary,
  StyleDefinition,
  StyleVariant,
} from "../../style/types";
import {
  isParentTarget,
  isSelectorTarget,
  isSelfTarget,
  parentLevelKeys,
  StateWithTarget,
} from "../../style/zod";
import { BreakpointSelector } from "./breakpoint-selector";
import { StateSelector } from "./state-selector";

interface StyleVariantProps<T extends BaseStyleDictionary> {
  variant: StyleVariant<T[keyof T]>;
  variantIndex: number;
  style: StyleDefinition<T[keyof T]>;
  styleName: keyof T;
  onUpdateVariant: (
    styleName: keyof T,
    variantIndex: number,
    updates: Partial<StyleVariant<T[keyof T]>>,
  ) => void;
  onUpdateStyle: (
    styleName: keyof T,
    variantIndex: number,
    value: z.infer<T[keyof T]>,
  ) => void;
  onDeleteVariant: (styleName: keyof T, variantIndex: number) => void;
}

export const StyleVariantComponent = <T extends BaseStyleDictionary>({
  variant,
  variantIndex,
  style,
  styleName,
  onUpdateVariant,
  onUpdateStyle,
  onDeleteVariant,
}: StyleVariantProps<T>) => {
  const t = useI18n("builder");

  const getVariantLabel = (variant: StyleVariant<T[keyof T]>) => {
    const parts = [];
    if (variant.breakpoint?.length) {
      const breakpointLabels = variant.breakpoint.map((bp) =>
        t(`pageBuilder.styles.breakpoints.${bp}`),
      );
      parts.push(
        breakpointLabels.join(t("pageBuilder.styles.breakpoints.and")),
      );
    }
    if (variant.state?.length) {
      const stateLabels = (variant.state as StateWithTarget[]).map(
        (stateWithParent) => {
          const stateLabel = (
            stateWithParent.state === "default"
              ? ""
              : `:${t(`pageBuilder.styles.states.${stateWithParent.state}` as BuilderKeys)}`
          ).toLocaleLowerCase();

          if (isSelfTarget(stateWithParent)) {
            return stateWithParent.state === "default"
              ? t("pageBuilder.styles.states.default")
              : stateLabel;
          }

          if (isParentTarget(stateWithParent)) {
            const level = stateWithParent.target?.data
              ?.level as (typeof parentLevelKeys)[number];
            const parentLabel = t(
              `pageBuilder.styles.states.parentLevels.${level}`,
            );

            return `${parentLabel}${stateLabel}`;
          }

          if (isSelectorTarget(stateWithParent)) {
            const selector = stateWithParent.target?.data?.selector;
            const stateType = stateWithParent.target?.data?.stateType;
            return stateType === "block"
              ? `${stateLabel} ${selector}`
              : `${selector}${stateLabel}`;
          }

          return stateLabel;
        },
      );
      parts.push(stateLabels.join(", "));
    }
    return parts.length > 0 ? parts.join(" - ") : t("pageBuilder.styles.base");
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Variant header with breakpoint and state controls */}
      <div className="flex flex-col justify-between gap-2">
        <div className="flex items-center gap-1 justify-between">
          <span className="text-xs text-muted-foreground">
            {getVariantLabel(variant)}
          </span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onDeleteVariant(styleName, variantIndex)}
          >
            <Trash />
          </Button>
        </div>
        <div className="flex items-center gap-1 justify-between">
          {/* Breakpoint selector */}
          <BreakpointSelector
            breakpoints={variant.breakpoint || []}
            onBreakpointsChange={(breakpoints) =>
              onUpdateVariant(styleName, variantIndex, {
                breakpoint: breakpoints,
              })
            }
            styleName={style.name}
            variantIndex={variantIndex}
          />

          {/* State selector */}
          <StateSelector
            states={(variant.state || []) as StateWithTarget[]}
            onStatesChange={(states) =>
              onUpdateVariant(styleName, variantIndex, { state: states })
            }
            styleName={style.name}
            variantIndex={variantIndex}
          />
        </div>
      </div>

      {/* Style component */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-medium">
          {t.has(`pageBuilder.styles.properties.${style.name}` as BuilderKeys)
            ? t(`pageBuilder.styles.properties.${style.name}` as BuilderKeys)
            : t(style.label)}
        </Label>
        <style.component
          value={variant.value}
          onChange={(value) => onUpdateStyle(styleName, variantIndex, value)}
        />
      </div>
    </div>
  );
};

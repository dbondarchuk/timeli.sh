"use client";

import { useI18n } from "@timelish/i18n";
import {
  Button,
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@timelish/ui";
import { ChevronRight, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as z from "zod";
import {
  BaseStyleDictionary,
  StyleDefinition,
  StyleVariant,
} from "../../style/types";
import { StyleVariantComponent } from "./style-variant";

interface StyleCategoryStyleProps<T extends BaseStyleDictionary> {
  style: StyleDefinition<T[keyof T]>;
  styleVariants: StyleVariant<T[keyof T]>[];
  searchTerm?: string;
  onAddVariant: (styleName: keyof T) => void;
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

export const StyleCategoryStyle = <T extends BaseStyleDictionary>({
  style,
  styleVariants,
  searchTerm,
  onAddVariant,
  onUpdateVariant,
  onUpdateStyle,
  onDeleteVariant,
}: StyleCategoryStyleProps<T>) => {
  const t = useI18n();
  const [isStyleOpen, setIsStyleOpen] = useState(searchTerm ? true : false);
  const previousVariantsCountRef = useRef(styleVariants.length);

  // Auto-expand when searching
  useEffect(() => {
    if (searchTerm) {
      setIsStyleOpen(true);
    } else {
      setIsStyleOpen(false);
    }
  }, [searchTerm]);

  // Auto-expand style when new variants are added
  useEffect(() => {
    const previousCount = previousVariantsCountRef.current;
    if (styleVariants.length > previousCount) {
      setIsStyleOpen(true);
    }
    previousVariantsCountRef.current = styleVariants.length;
  }, [styleVariants.length]);

  return (
    <Collapsible open={isStyleOpen} onOpenChange={setIsStyleOpen}>
      <div className="flex flex-row gap-2 justify-between w-full">
        <CollapsibleTrigger className="flex items-center justify-between w-full gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <div className="flex items-center gap-2">
            <ChevronRight
              className={cn(
                "size-3 transition-transform",
                isStyleOpen && "rotate-90",
              )}
            />
            <style.icon className="size-4" />
            <span className="text-left">{t(style.label)}</span>
            {/* {!isStyleOpen && styleVariants.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({formatStyleValue(styleVariants[0].value)})
            </span>
          )} */}
          </div>
        </CollapsibleTrigger>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onAddVariant(style.name as keyof T);
            }}
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>

      <CollapsibleContent className="space-y-2 pt-2 pl-2">
        {/* Style variants */}
        {styleVariants.map((variant, variantIndex) => (
          <StyleVariantComponent
            key={variantIndex}
            variant={variant}
            variantIndex={variantIndex}
            style={style}
            styleName={style.name as keyof T}
            onUpdateVariant={onUpdateVariant}
            onUpdateStyle={onUpdateStyle}
            onDeleteVariant={onDeleteVariant}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

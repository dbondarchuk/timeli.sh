import { BuilderKeys, useI18n } from "@vivid/i18n";
import { Button, cn, Input, ScrollArea, useDebounce } from "@vivid/ui";
import { Search, X } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useBlockChildrenIds,
  useBlockSchema,
  useIsSelectedBlock,
  useRootBlockId,
  useSetSelectedBlockId,
} from "../../../documents/editor/context";

type DocumentOutlineItemProps = {
  blockId: string;
  depth: number;
  searchQuery?: string;
};

const DocumentOutlineItem: React.FC<DocumentOutlineItemProps> = memo(
  ({ blockId, depth, searchQuery }) => {
    const tBuilder = useI18n("builder");
    const t = useI18n();

    const setSelectedBlockId = useSetSelectedBlockId();
    const block = useBlockSchema(blockId);
    const isSelected = useIsSelectedBlock(blockId);
    const outlineItemRef = useRef<HTMLDivElement>(null);

    const children = useBlockChildrenIds(blockId);
    const childrenIds = useMemo(
      () => Object.values(children || {}).flat(),
      [children],
    );

    // Auto-scroll to outline item when it becomes selected
    useEffect(() => {
      if (isSelected && outlineItemRef.current) {
        // Use a small delay to ensure the selection state is fully applied
        const timeoutId = setTimeout(() => {
          outlineItemRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }, 100);

        return () => clearTimeout(timeoutId);
      }
    }, [isSelected]);

    const handleOutlineItemClick = useCallback(() => {
      setSelectedBlockId(blockId);
    }, [setSelectedBlockId, blockId]);

    const isVisible = useMemo(() => {
      if (!searchQuery) return true;
      if (!block) return false;
      return (
        t(block.schema.displayName as BuilderKeys)
          .toLocaleLowerCase()
          .includes(searchQuery.toLocaleLowerCase()) ||
        block.type.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())
      );
    }, [block, searchQuery, tBuilder]);

    return !block ? null : (
      <>
        <div
          ref={outlineItemRef}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground",
            isSelected ? "bg-accent text-accent-foreground" : "text-foreground",
            !isVisible && "hidden",
          )}
          style={{
            marginLeft: !searchQuery ? `${depth * 8}px` : undefined,
          }}
          onClick={handleOutlineItemClick}
        >
          <div className="flex-shrink-0 text-muted-foreground">
            {block.schema.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {t(block.schema.displayName)}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {t(block.schema.category)}
            </div>
          </div>
        </div>
        {childrenIds.length > 0 && (
          <>
            {childrenIds.map((childId) => (
              <DocumentOutlineItem
                key={childId}
                blockId={childId}
                depth={depth + 1}
                searchQuery={searchQuery}
              />
            ))}
          </>
        )}
      </>
    );
  },
);

export const OutlinePanel = () => {
  const rootBlockId = useRootBlockId();
  const t = useI18n("builder");
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  return (
    <>
      <p className="text-xs text-muted-foreground mb-3">
        {t("baseBuilder.blocks.outline.subtitle")}
      </p>
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("baseBuilder.blocks.search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 transform -translate-y-1/2"
          onClick={() => setSearchQuery("")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="py-2 pr-2 h-[calc(100vh-400px)] min-h-0">
        <div className="space-y-1">
          <DocumentOutlineItem
            key={rootBlockId}
            blockId={rootBlockId}
            depth={0}
            searchQuery={debouncedSearchQuery}
          />
        </div>
      </ScrollArea>
    </>
  );
};

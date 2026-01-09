import {
  EditorArgsContext,
  EditorChildren,
  evaluate,
  useBlockEditor,
  useCurrentBlock,
  useEditorArgs,
} from "@timelish/builder";
import { useI18n } from "@timelish/i18n";
import { BlockStyle, useClassName } from "@timelish/page-builder-base";
import { useMemo } from "react";
import { ForeachContainerProps, styles } from "./schema";

export const ForeachContainerEditor = ({ props }: ForeachContainerProps) => {
  const t = useI18n("builder");
  const currentBlock = useCurrentBlock<ForeachContainerProps>();
  const overlayProps = useBlockEditor(currentBlock.id);
  const value = currentBlock.data?.props?.value || "";

  const itemName = currentBlock.data?.props?.itemName || "_item";
  const className = useClassName();
  const base = currentBlock.base;

  const args = useEditorArgs();

  const extendedArgs = useMemo(() => {
    let array: any[] = [];
    try {
      array = evaluate(value, args);
    } catch (e) {
      console.error("Error evaluating value", e);
      array = [];
    }

    return {
      ...args,
      [itemName]: array?.[0],
    };
  }, [args, itemName, value]);

  return (
    <>
      <BlockStyle
        name={className}
        styleDefinitions={styles}
        styles={currentBlock.data?.style}
      />
      <div className={className} id={base?.id} {...overlayProps}>
        <div className="mb-2 text-muted-foreground text-xs w-full">
          {t.rich(
            "pageBuilder.blocks.foreachContainer.forEachItemInValueFormat",
            {
              item: () => <em>{itemName}</em>,
              value: () => <em>{value || "value"}</em>,
            },
          )}
        </div>
        <EditorArgsContext.Provider value={extendedArgs}>
          <EditorChildren blockId={currentBlock.id} property="props" />
        </EditorArgsContext.Provider>
      </div>
    </>
  );
};

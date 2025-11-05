import {
  EditorChildren,
  useBlockEditor,
  useCurrentBlock,
} from "@timelish/builder";
import { useI18n } from "@timelish/i18n";
import { ForeachContainerProps } from "./schema";

export const ForeachContainerEditor = ({ props }: ForeachContainerProps) => {
  const t = useI18n("builder");
  const currentBlock = useCurrentBlock<ForeachContainerProps>();
  const overlayProps = useBlockEditor(currentBlock.id);
  const value = currentBlock.data?.props?.value || "";

  return (
    <div className="w-full" {...overlayProps}>
      <div className="mb-2 text-muted-foreground text-xs w-full">
        {t.rich(
          "pageBuilder.blocks.foreachContainer.forEachItemInValueFormat",
          {
            item: () => <em>_item</em>,
            value: () => <em>{value || "value"}</em>,
          },
        )}
      </div>
      <div className="w-full">
        <EditorChildren blockId={currentBlock.id} property="props" />
      </div>
    </div>
  );
};

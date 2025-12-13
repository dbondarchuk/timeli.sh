import { useI18n } from "@timelish/i18n";
import { useCallback, useMemo } from "react";
import {
  useBlocks,
  useDispatchAction,
  useSelectedBlock,
} from "../../../documents/editor/context";
import { BaseBlockProps } from "../../../documents/types";
import { BaseSidebarPanel } from "./input-panels/helpers/base-sidebar-panel";

function renderMessage(val: string) {
  return (
    <div className="m-3 p-1 border-dashed border border-secondary">
      <div className="text-secondary-foreground">{val}</div>
    </div>
  );
}

export const ConfigurationPanelTab = "block-configuration";

export const ConfigurationPanel: React.FC = () => {
  const selectedBlock = useSelectedBlock();

  const selectedBlockId = selectedBlock?.id;
  const selectedBlockType = selectedBlock?.type;

  const dispatchAction = useDispatchAction();

  const blocks = useBlocks();
  const tBuilder = useI18n("builder");
  const t = useI18n();

  const setBlock = useCallback(
    (data: any) => {
      if (!selectedBlockId) return;
      dispatchAction({
        type: "set-block-data",
        value: { blockId: selectedBlockId, data },
      });
    },
    [dispatchAction, selectedBlockId],
  );

  const setBase = useCallback(
    (base: BaseBlockProps) => {
      if (!selectedBlockId) return;
      dispatchAction({
        type: "set-block-base",
        value: { blockId: selectedBlockId, base },
      });
    },
    [dispatchAction, selectedBlockId],
  );

  const Panel = useMemo(
    () => (selectedBlockType ? blocks[selectedBlockType]?.Configuration : null),
    [blocks, selectedBlockType],
  );

  if (!selectedBlockId || !Panel) {
    return renderMessage(
      tBuilder(
        "baseBuilder.inspector.configurationPanel.clickOnBlockToInspect",
      ),
    );
  }

  const { data, id, base } = selectedBlock;

  return (
    <BaseSidebarPanel title={t(blocks[selectedBlock.type].displayName)}>
      <Panel
        data={data}
        setData={setBlock}
        key={id}
        base={base}
        onBaseChange={setBase}
      />
    </BaseSidebarPanel>
  );
};

"use client";

import { ToolbarGroup } from "@vivid/ui";
import { useCallback, useMemo } from "react";
import {
  useBlocks,
  useDispatchAction,
  useRootBlock,
  useRootBlockId,
  useRootBlockType,
  useSelectedBlock,
} from "../../../documents/editor/context";

export const ToolbarBlockToolbarGroup = () => {
  const _selectedBlock = useSelectedBlock();
  const rootBlockId = useRootBlockId();
  const rootBlock = useRootBlock();
  const selectedBlock = _selectedBlock ?? rootBlock;
  const dispatchAction = useDispatchAction();
  const rootBlockType = useRootBlockType();
  const blocks = useBlocks();

  const blockType = selectedBlock.type || rootBlockType;
  const blockId = selectedBlock?.id || rootBlockId;

  const BlockToolbar = useMemo(
    () => blocks[blockType].Toolbar,
    [blocks, blockType],
  );

  const setBlockData = useCallback(
    (data: any) => {
      dispatchAction({
        type: "set-block-data",
        value: { blockId, data },
      });
    },
    [dispatchAction, blockId],
  );

  const blockData = selectedBlock?.data ?? {};
  return (
    <ToolbarGroup>
      {BlockToolbar && (
        <BlockToolbar
          data={blockData}
          setData={setBlockData}
          base={selectedBlock?.base}
          onBaseChange={(base) => {
            dispatchAction({
              type: "set-block-base",
              value: { blockId: selectedBlock!.id, base },
            });
          }}
        />
      )}
    </ToolbarGroup>
  );
};

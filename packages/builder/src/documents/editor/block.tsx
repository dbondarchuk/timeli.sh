"use client";

import {
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { useBlock, useSetBlockDisableOptions } from "./context";
import { BlockDisableOptions, TEditorBlock } from "./core";
import { CoreEditorBlock } from "./core.block";

const EditorBlockContext = createContext<{
  blockId: string;
  isOverlay: boolean;
  allowedTypes?: string[];
  disable: BlockDisableOptions;
}>({
  blockId: "",
  isOverlay: false,
  allowedTypes: [],
  disable: {
    move: false,
    delete: false,
    clone: false,
    drag: false,
  },
});

export const useCurrentBlockId = () => useContext(EditorBlockContext).blockId;
export const useIsCurrentBlockOverlay = () =>
  useContext(EditorBlockContext).isOverlay;
export const useCurrentBlockAllowedTypes = () =>
  useContext(EditorBlockContext).allowedTypes;
export const useCurrentBlockDisableOptions = () =>
  useContext(EditorBlockContext).disable;

export const useCurrentBlock = <T,>() => {
  // return useBlock(useCurrentBlockId()) as TEditorBlock<T>;

  const currentBlockId = useCurrentBlockId();
  const block = useBlock(currentBlockId);

  return block! as TEditorBlock<T>;
};

type EditorBlockProps = {
  blockId: string;
  isOverlay?: boolean;
  disableMove?: boolean;
  disableDelete?: boolean;
  disableClone?: boolean;
  disableDrag?: boolean;
  additionalProps?: Record<string, any>;
  index: number;
  parentBlockId: string;
  parentProperty: string;
  allowedTypes?: string | string[];
};

export const EditorBlock = memo(
  ({
    blockId,
    isOverlay,
    disableMove,
    disableDelete,
    disableClone,
    disableDrag,
    additionalProps,
    index,
    parentBlockId,
    parentProperty,
    allowedTypes,
  }: EditorBlockProps) => {
    const setBlockDisableOptions = useSetBlockDisableOptions();
    const isCurrentOverlay = useIsCurrentBlockOverlay();
    const ref = useRef<HTMLElement>(null);

    const isOvelayBlock = !!isOverlay || !!isCurrentOverlay;

    const disable = useMemo(() => {
      return {
        move: disableMove,
        delete: disableDelete,
        clone: disableClone,
        drag: disableDrag,
      };
    }, [disableMove, disableDelete, disableClone, disableDrag]);

    useEffect(() => {
      if (isOvelayBlock) return;
      setBlockDisableOptions(blockId, disable);
    }, [blockId, disable, setBlockDisableOptions]);

    const blockContext = useMemo(
      () => ({
        blockId,
        isOverlay: isOvelayBlock,
        disable,
        allowedTypes:
          Array.isArray(allowedTypes) || typeof allowedTypes === "undefined"
            ? allowedTypes
            : [allowedTypes],
        ref,
      }),
      [blockId, isOvelayBlock, allowedTypes, disable],
    );

    return (
      <EditorBlockContext.Provider value={blockContext}>
        <CoreEditorBlock
          blockId={blockId}
          additionalProps={additionalProps}
          index={index}
          parentBlockId={parentBlockId}
          parentProperty={parentProperty}
        />
      </EditorBlockContext.Provider>
    );
  },
);

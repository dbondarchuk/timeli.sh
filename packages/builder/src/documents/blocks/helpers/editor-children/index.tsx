"use client";

import { Fragment, memo, useEffect, useMemo } from "react";

import { EditorBlock, useIsCurrentBlockOverlay } from "../../../editor/block";
import { TEditorBlock } from "../../../editor/core";

import { useDroppable } from "@dnd-kit/react";
import { cn, deepMemo } from "@vivid/ui";
import { DndContext } from "../../../../types/dndContext";
import {
  useBlockChildrenBlockIds,
  useBlockDepth,
  useBlockTypes,
  useHasActiveDragBlock,
  useSetAllowedBlockTypes,
} from "../../../editor/context";
import { BaseZodDictionary } from "../../../types";
import { OverlayBlock } from "./overlay-block";

export type EditorChildrenChange = {
  blockId: string;
  block: TEditorBlock;
  children: TEditorBlock[];
};

const Placeholder = ({
  blockId,
  property,
  index,
  depth,
  allowOnly,
}: {
  blockId: string;
  property: string;
  index: number;
  depth: number;
  allowOnly: string[];
}) => {
  const hasActiveDragBlock = useHasActiveDragBlock();
  const isOverlay = useIsCurrentBlockOverlay();
  const { ref } = useDroppable({
    id: `${blockId}/${property}/${index}-placeholder`,
    collisionPriority: depth,
    accept: allowOnly,
    disabled: isOverlay,
    data: {
      context: {
        parentBlockId: blockId,
        parentProperty: property,
        index,
        type: "",
      } satisfies DndContext,
    },
  });

  return (
    <div
      ref={ref}
      className={cn(
        "w-full min-h-10 min-w-10 border-2 border-dashed border-blue-400 bg-blue-400/20",
        hasActiveDragBlock && "bg-blue-400/60",
      )}
    >
      <OverlayBlock blockId={blockId} property={property} index={index} />
      <OverlayBlock blockId={blockId} property={property} index={index + 1} />
    </div>
  );
};

export type EditorChildrenProps<T extends BaseZodDictionary = any> = {
  blockId: string;
  property: string;
  allowOnly?: keyof T | (keyof T)[];
  style?: React.CSSProperties;
  childWrapper?: (props: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    ref?: React.Ref<HTMLDivElement>;
    id?: string;
  }) => React.ReactNode;
  additionalProps?: Record<string, any>;
};

export const EditorChildren = memo(
  <T extends BaseZodDictionary = any>({
    property,
    blockId: currentBlockId,
    allowOnly: propAllowOnly,
    childWrapper,
    additionalProps,
  }: EditorChildrenProps<T>) => {
    const depth = useBlockDepth(currentBlockId) ?? 0;
    const knownBlockTypes = useBlockTypes();

    const allowOnly = useMemo(
      () =>
        propAllowOnly
          ? Array.isArray(propAllowOnly)
            ? propAllowOnly
            : [propAllowOnly]
          : knownBlockTypes,
      [propAllowOnly, knownBlockTypes],
    );

    const childrenIds = useBlockChildrenBlockIds(currentBlockId, property);

    return (
      <EditorChildrenRender
        childrenIds={childrenIds}
        childWrapper={childWrapper}
        additionalProps={additionalProps}
        currentBlockId={currentBlockId}
        property={property}
        depth={depth}
        allowOnly={allowOnly as string[]}
      />
    );
  },
);

const EditorChildrenRender = deepMemo(
  ({
    childrenIds,
    childWrapper,
    additionalProps,
    currentBlockId,
    property,
    depth,
    allowOnly,
  }: {
    childrenIds?: string[];
    childWrapper?: React.ElementType;
    additionalProps?: Record<string, any>;
    currentBlockId: string;
    property: string;
    depth: number;
    allowOnly: string[];
  }) => {
    const ChildWrapper = useMemo(
      () => (childWrapper ?? Fragment) as React.ElementType,
      [childWrapper],
    );

    const setAllowedBlockTypes = useSetAllowedBlockTypes();
    const isCurrentOverlay = useIsCurrentBlockOverlay();

    useEffect(() => {
      if (isCurrentOverlay) return;
      setAllowedBlockTypes(currentBlockId, property, allowOnly);
    }, [
      allowOnly,
      currentBlockId,
      property,
      setAllowedBlockTypes,
      isCurrentOverlay,
    ]);

    return (
      <>
        {childrenIds
          ?.filter((blockId) => !!blockId)
          .map((childId, i) => (
            <Fragment key={childId}>
              <OverlayBlock
                blockId={currentBlockId}
                property={property}
                index={i}
              />
              <ChildWrapper>
                <EditorBlock
                  blockId={childId}
                  index={i}
                  parentBlockId={currentBlockId}
                  parentProperty={property}
                  additionalProps={additionalProps}
                  allowedTypes={allowOnly}
                />
              </ChildWrapper>
            </Fragment>
          ))}
        {!childrenIds?.length ? (
          <Placeholder
            blockId={currentBlockId}
            property={property}
            index={0}
            depth={depth + 1}
            allowOnly={allowOnly}
          />
        ) : (
          <OverlayBlock
            blockId={currentBlockId}
            property={property}
            index={childrenIds.length}
          />
        )}
      </>
    );
  },
);

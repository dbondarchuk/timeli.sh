import {
  cloneBlockInLevel,
  deleteBlockInLevel,
  findBlock,
  findBlockHierarchy,
  findParentBlock,
  insertBlockInLevel,
  moveBlockInLevel,
  moveBlockToIndexInLevel,
  swapBlockInLevel,
} from "../helpers/blocks";
import { TEditorConfiguration } from "./core";
import { EditorHistoryEntry } from "./history";

/**
 * Deep merge function that preserves nested structures
 * Handles arrays and objects recursively while preserving children
 */
function deepMerge(target: any, source: any): any {
  if (!source || typeof source !== "object") {
    return target;
  }

  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (sourceValue === undefined) {
        // Remove property if source explicitly sets it to undefined
        delete result[key];
        continue;
      }

      if (sourceValue === null) {
        result[key] = null;
      } else if (Array.isArray(sourceValue)) {
        // For arrays, we need to be careful with children
        if (key === "children" && targetValue && Array.isArray(targetValue)) {
          // Preserve children array structure
          result[key] = targetValue;
        } else {
          // For other arrays, merge or replace based on context
          result[key] = sourceValue;
        }
      } else if (
        typeof sourceValue === "object" &&
        typeof targetValue === "object"
      ) {
        // Recursively merge nested objects
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        // Replace primitive values
        result[key] = sourceValue;
      }
    }
  }

  return result;
}

export const editorHistoryReducer = (
  originalDocument: TEditorConfiguration,
  selectedBlockId: string | null,
  { type, value }: EditorHistoryEntry,
) => {
  let newSelectedBlockId: string | null = selectedBlockId;

  switch (type) {
    case "document":
      return {
        document: JSON.parse(JSON.stringify(value.document)),
        selectedBlockId,
      };

    case "delete-block": {
      // const parent = indexes[indexes[value.blockId]?.parentBlockId!];
      const parent = findParentBlock(originalDocument, value.blockId);
      if (parent) {
        // const previousBlockId = findPreviousBlockId(
        //   parent.block,
        //   value.blockId,
        // );
        const result = deleteBlockInLevel(parent.block, value.blockId);
        if (selectedBlockId === value.blockId) {
          newSelectedBlockId = result?.previousBlockId ?? null;
        }
      } else {
        return null;
      }

      break;
    }

    case "clone-block": {
      // const parent = indexes[indexes[value.blockId]?.parentBlockId!];
      const parent = findParentBlock(originalDocument, value.blockId);
      if (parent) {
        const newBlock = cloneBlockInLevel(parent.block, value.blockId);
        if (newBlock) {
          newSelectedBlockId = newBlock.id;
        } else {
          return null;
        }
      } else {
        return null;
      }

      break;
    }

    case "add-block": {
      // const parent = indexes[value.parentBlockId];
      const parent = findBlock(originalDocument, value.parentBlockId);
      if (parent) {
        insertBlockInLevel(
          parent,
          value.block,
          value.parentBlockProperty,
          value.index ?? "last",
        );

        newSelectedBlockId = value.block.id;
      } else {
        return null;
      }

      break;
    }

    case "move-block-up": {
      // const parent = indexes[indexes[value.blockId]?.parentBlockId!];
      const parent = findParentBlock(originalDocument, value.blockId);
      if (parent) {
        moveBlockInLevel(parent.block, value.blockId, "up");
      } else {
        return null;
      }

      break;
    }

    case "move-block-down": {
      // const parent = indexes[indexes[value.blockId]?.parentBlockId!];
      const parent = findParentBlock(originalDocument, value.blockId);
      if (parent) {
        moveBlockInLevel(parent.block, value.blockId, "down");
      } else {
        return null;
      }

      break;
    }

    case "swap-block": {
      // const parent = indexes[indexes[value.blockId1]?.parentBlockId!];
      const parent = findParentBlock(originalDocument, value.blockId1);
      if (parent) {
        swapBlockInLevel(parent.block, value.blockId1, value.blockId2);
      } else {
        return null;
      }

      break;
    }

    case "move-block": {
      // const hierarchy = getBlockHierarchy(value.parentBlockId, indexes);
      const hierarchy = findBlockHierarchy(
        originalDocument,
        value.parentBlockId,
      );

      if (hierarchy && hierarchy.find((block) => block.id === value.blockId)) {
        console.log("cannot move block inside itself");
        return null;
      }

      // const parent = indexes[indexes[value.blockId]?.parentBlockId!];
      const parent = findParentBlock(originalDocument, value.blockId);
      // const newParent = indexes[value.parentBlockId];
      const newParent = findBlock(originalDocument, value.parentBlockId);
      const block = findBlock(originalDocument, value.blockId);

      if (!parent || !newParent || !block) {
        return null;
      }

      if (
        parent.block.id === value.parentBlockId &&
        parent.property === value.parentBlockProperty
      ) {
        moveBlockToIndexInLevel(parent.block, value.blockId, value.index || 0);
      } else {
        insertBlockInLevel(
          newParent,
          block,
          value.parentBlockProperty,
          value.index || 0,
        );

        deleteBlockInLevel(parent.block, value.blockId, parent.property);
      }

      break;
    }

    case "set-block-data": {
      // const block = indexes[value.blockId];
      const block = findBlock(originalDocument, value.blockId);
      if (block) {
        // Deep merge new data with existing data to preserve deeply nested children
        // The new data comes from UI state which has children stripped out
        block.data = deepMerge(block.data, value.data);
      } else {
        return null;
      }

      break;
    }

    case "set-block-base": {
      // const block = indexes[value.blockId];
      const block = findBlock(originalDocument, value.blockId);
      if (block) {
        block.base = value.base;
      } else {
        return null;
      }

      break;
    }
  }

  const document = JSON.parse(JSON.stringify(originalDocument));
  return { document, selectedBlockId: newSelectedBlockId };
};

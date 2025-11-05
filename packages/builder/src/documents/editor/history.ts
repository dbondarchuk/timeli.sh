import { BaseBlockProps } from "../types";
import { TEditorBlock } from "./core";

export type EditorHistoryEntry =
  | {
      type: "document";
      value: {
        document: any;
      };
    }
  | {
      type: "delete-block";
      value: {
        blockId: string;
      };
    }
  | {
      type: "clone-block";
      value: {
        blockId: string;
      };
    }
  | {
      type: "add-block";
      value: {
        block: TEditorBlock;
        parentBlockId: string;
        parentBlockProperty?: string;
        index?: number | "last";
      };
    }
  | {
      type: "move-block-up";
      value: {
        blockId: string;
      };
    }
  | {
      type: "move-block-down";
      value: {
        blockId: string;
      };
    }
  | {
      type: "swap-block";
      value: {
        blockId1: string;
        blockId2: string;
      };
    }
  | {
      type: "move-block";
      value: {
        blockId: string;
        parentBlockId: string;
        parentBlockProperty?: string;
        index?: number | "last";
      };
    }
  | {
      type: "set-block-data";
      value: {
        blockId: string;
        data: any;
      };
    }
  | {
      type: "set-block-base";
      value: {
        blockId: string;
        base: BaseBlockProps;
      };
    };

export type EditorHistoryEntryType = Pick<EditorHistoryEntry, "type">["type"];

export type EditorHistory = {
  entries: EditorHistoryEntry[];
  index: number;
};

import { BaseBlockProps } from "../types";

export type BlockDisableOptions = {
  drag?: boolean;
  delete?: boolean;
  move?: boolean;
  clone?: boolean;
};

export type TEditorBlock<T = any> = {
  type: string;
  data: T;
  id: string;
  base?: BaseBlockProps;
};

export type TEditorConfiguration = TEditorBlock;

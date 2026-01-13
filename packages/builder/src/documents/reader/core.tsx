import * as z from "zod";
import { BaseBlockProps, BaseZodDictionary, BuilderSchema } from "../types";

export type TReaderBlock = {
  type: string;
  data: any;
  id: string;
  base?: BaseBlockProps;
  metadata?: Record<string, any>;
};

export type TReaderDocument = TReaderBlock;

export type BaseReaderBlockProps<T extends BuilderSchema> = {
  document: TReaderBlock; // TReaderDocument
  blocks: ReaderDocumentBlocksDictionary<T>;
  args: Record<string, any>;
  block: TReaderBlock;
  isEditor?: boolean;
};

export type ReaderProps<T> = T & {
  document: TReaderBlock;
  args: Record<string, any>;
  block: TReaderBlock;
  isEditor?: boolean;
};

export type ReaderDocumentBlocksDictionary<T extends BuilderSchema = any> = {
  [K in keyof T]: {
    Reader: React.ComponentType<
      ReaderProps<
        z.infer<T[K]> & {
          blocks: ReaderDocumentBlocksDictionary<T>;
        }
      >
    >;
  };
};

export function buildReaderBlockConfigurationDictionary<
  T extends BaseZodDictionary,
>(blocks: ReaderDocumentBlocksDictionary<T>) {
  return blocks;
}

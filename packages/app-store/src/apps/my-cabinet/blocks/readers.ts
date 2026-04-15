import { ReaderDocumentBlocksDictionary } from "@timelish/builder";
import { MyCabinetBlockReader } from "./my-cabinet";
import { MyCabinetBlocksSchema } from "./schema";

export const MyCabinetReaders: ReaderDocumentBlocksDictionary<
  typeof MyCabinetBlocksSchema
> = {
  MyCabinet: {
    Reader: MyCabinetBlockReader,
  },
};

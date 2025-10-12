import { ReaderDocumentBlocksDictionary } from "@vivid/builder";
import { WaitlistBlocksSchema } from "./schema";
import { WaitlistReader } from "./waitlist/reader";

export const WaitlistReaders: ReaderDocumentBlocksDictionary<
  typeof WaitlistBlocksSchema
> = {
  Waitlist: {
    Reader: WaitlistReader,
  },
};

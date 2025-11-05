import { ReaderDocumentBlocksDictionary } from "@timelish/builder";
import { WaitlistReaders } from "../apps/waitlist/blocks/readers";
import { WAITLIST_APP_NAME } from "../apps/waitlist/const";

export const AppsBlocksReaders: Record<
  string,
  ReaderDocumentBlocksDictionary<any>
> = {
  [WAITLIST_APP_NAME]: WaitlistReaders,
};

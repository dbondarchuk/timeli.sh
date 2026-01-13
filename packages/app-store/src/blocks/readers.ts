import { ReaderDocumentBlocksDictionary } from "@timelish/builder";
import { BlogReaders } from "../apps/blog/blocks/readers";
import { BLOG_APP_NAME } from "../apps/blog/const";
import { WaitlistReaders } from "../apps/waitlist/blocks/readers";
import { WAITLIST_APP_NAME } from "../apps/waitlist/const";

export const AppsBlocksReaders: Record<
  string,
  ReaderDocumentBlocksDictionary<any>
> = {
  [BLOG_APP_NAME]: BlogReaders,
  [WAITLIST_APP_NAME]: WaitlistReaders,
};

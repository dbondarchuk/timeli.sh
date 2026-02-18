import { ReaderDocumentBlocksDictionary } from "@timelish/builder";
import { BlogReaders } from "../apps/blog/blocks/readers";
import { BLOG_APP_NAME } from "../apps/blog/const";
import { FormsReaders } from "../apps/forms/blocks/readers";
import { FORMS_APP_NAME } from "../apps/forms/const";
import { WaitlistReaders } from "../apps/waitlist/blocks/readers";
import { WAITLIST_APP_NAME } from "../apps/waitlist/const";

export const AppsBlocksReaders: Record<
  string,
  ReaderDocumentBlocksDictionary<any>
> = {
  [BLOG_APP_NAME]: BlogReaders,
  [FORMS_APP_NAME]: FormsReaders,
  [WAITLIST_APP_NAME]: WaitlistReaders,
};

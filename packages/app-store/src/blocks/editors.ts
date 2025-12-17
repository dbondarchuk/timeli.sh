import {
  BaseZodDictionary,
  EditorDocumentBlocksDictionary,
} from "@timelish/builder";
import { BlogBlocks } from "../apps/blog/blocks/schema";
import { BLOG_APP_NAME } from "../apps/blog/const";
import { WaitlistBlocks } from "../apps/waitlist/blocks/schema";
import { WAITLIST_APP_NAME } from "../apps/waitlist/const";

export const AppsBlocksEditors: Record<
  string,
  {
    [name: string]: {
      schema: BaseZodDictionary[keyof BaseZodDictionary];
      editor: EditorDocumentBlocksDictionary[keyof BaseZodDictionary];
      allowedInFooter: boolean;
    };
  }
> = {
  [BLOG_APP_NAME]: BlogBlocks,
  [WAITLIST_APP_NAME]: WaitlistBlocks,
};

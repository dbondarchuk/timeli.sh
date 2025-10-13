import {
  BaseZodDictionary,
  EditorDocumentBlocksDictionary,
} from "@vivid/builder";
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
  [WAITLIST_APP_NAME]: WaitlistBlocks,
};

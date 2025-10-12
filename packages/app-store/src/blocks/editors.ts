import {
  BaseZodDictionary,
  EditorDocumentBlocksDictionary,
} from "@vivid/builder";
import { WaitlistEditors } from "../apps/waitlist/blocks/editors";
import { WaitlistBlocksSchema } from "../apps/waitlist/blocks/schema";
import { WAITLIST_APP_NAME } from "../apps/waitlist/const";

export const AppsBlocksSchemas: Record<string, BaseZodDictionary> = {
  [WAITLIST_APP_NAME]: WaitlistBlocksSchema,
};

export const AppsBlocksEditors: Record<
  string,
  EditorDocumentBlocksDictionary<any>
> = {
  [WAITLIST_APP_NAME]: WaitlistEditors,
};

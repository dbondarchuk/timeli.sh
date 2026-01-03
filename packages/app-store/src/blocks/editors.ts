import {
  BaseZodDictionary,
  EditorDocumentBlocksDictionary,
  TemplateDefinition,
} from "@timelish/builder";
import { BlogBlocks } from "../apps/blog/blocks/schema";
import { BlogTemplates } from "../apps/blog/blocks/templates";
import { BLOG_APP_NAME } from "../apps/blog/const";
import { WaitlistBlocks } from "../apps/waitlist/blocks/schema";
import { WAITLIST_APP_NAME } from "../apps/waitlist/const";

export const AppsBlocksEditors: Record<
  string,
  {
    [name: string]: {
      schema: BaseZodDictionary[keyof BaseZodDictionary];
      editor: EditorDocumentBlocksDictionary[keyof BaseZodDictionary];
      defaultMetadata?: (appName: string, appId: string) => Record<string, any>;
      allowedInFooter: boolean;
    };
  }
> = {
  [BLOG_APP_NAME]: BlogBlocks,
  [WAITLIST_APP_NAME]: WaitlistBlocks,
};

export const AppsBlocksTemplates: Record<
  string,
  (
    appName: string,
    appId: string,
  ) => {
    [name: string]: {
      configuration: TemplateDefinition;
      allowedInFooter: boolean;
    };
  }
> = {
  [BLOG_APP_NAME]: (appName: string, appId: string) =>
    Object.fromEntries(
      Object.entries(BlogTemplates(appName, appId)).map(([name, template]) => [
        name,
        {
          configuration: template,
          allowedInFooter: false,
        },
      ]),
    ),
};

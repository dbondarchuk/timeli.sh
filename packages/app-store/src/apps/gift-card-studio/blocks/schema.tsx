import { EditorDocumentBlocksDictionary } from "@timelish/builder";
import { AllKeys } from "@timelish/i18n";
import { Gift } from "lucide-react";
import {
  GiftCardPurchaseBlockConfiguration,
  GiftCardPurchaseBlockEditor,
  GiftCardPurchaseBlockPropsDefaults,
  GiftCardPurchaseBlockPropsSchema,
  GiftCardPurchaseBlockReader,
} from "./gift-card-purchase";
import {
  GiftCardStudioAdminKeys,
  GiftCardStudioAdminNamespace,
  giftCardStudioAdminNamespace,
} from "../translations/types";

export const GiftCardStudioBlocksSchema = {
  GiftCardPurchase: GiftCardPurchaseBlockPropsSchema,
};

export const GiftCardStudioBlocksAllowedInFooter = {
  GiftCardPurchase: false,
};

export const GiftCardStudioBlocksDefaultMetadata = (
  _appName: string,
  appId: string,
): Record<string, unknown> => ({
  giftCardStudioAppId: appId,
});

export const GiftCardStudioEditors: EditorDocumentBlocksDictionary<
  typeof GiftCardStudioBlocksSchema
> = {
  GiftCardPurchase: {
    displayName: "Gift Card Purchase" as AllKeys<
      GiftCardStudioAdminNamespace,
      GiftCardStudioAdminKeys
    >,
    icon: <Gift />,
    Configuration: GiftCardPurchaseBlockConfiguration,
    Editor: GiftCardPurchaseBlockEditor as any,
    defaultValue: GiftCardPurchaseBlockPropsDefaults,
    category: "Gift Card Studio" as AllKeys<
      GiftCardStudioAdminNamespace,
      GiftCardStudioAdminKeys
    >,
    capabilities: ["block"],
    tags: ["gift-card"],
  },
};

type GiftCardStudioBlocksType = {
  [K in keyof typeof GiftCardStudioBlocksSchema]: {
    schema: (typeof GiftCardStudioBlocksSchema)[K];
    editor: (typeof GiftCardStudioEditors)[K];
    allowedInFooter: (typeof GiftCardStudioBlocksAllowedInFooter)[K];
    defaultMetadata: (
      appName: string,
      appId: string,
    ) => Record<string, unknown>;
  };
};

export const GiftCardStudioBlocks = Object.fromEntries(
  Object.entries(GiftCardStudioBlocksSchema).map(([key, schema]) => [
    key,
    {
      schema,
      editor: GiftCardStudioEditors[key as keyof typeof GiftCardStudioBlocksSchema],
      allowedInFooter:
        GiftCardStudioBlocksAllowedInFooter[
          key as keyof typeof GiftCardStudioBlocksSchema
        ],
      defaultMetadata: GiftCardStudioBlocksDefaultMetadata,
    },
  ]),
) as GiftCardStudioBlocksType;

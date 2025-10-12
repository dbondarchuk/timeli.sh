import { Image } from "lucide-react";
import { AllStylesSchemas } from "../../style";
import { ShortcutWithAssetSelector } from "../types";

export const backgroundImageShortcut: ShortcutWithAssetSelector<
  Pick<
    AllStylesSchemas,
    | "backgroundImage"
    | "backgroundSize"
    | "backgroundPosition"
    | "backgroundRepeat"
  >
> = {
  label: "pageBuilder.shortcuts.backgroundImage",
  icon: Image,
  inputType: "asset-selector",
  targetStyle: "backgroundImage",
  styleValue: {
    get: (style: any) => {
      if (style && typeof style === "object" && style?.type === "url") {
        return style.value || null;
      }

      return null;
    },
    set: {
      backgroundImage: (value) => {
        return { type: "url", value };
      },
      backgroundSize: () => {
        return "cover";
      },
      backgroundPosition: () => {
        return "center";
      },
      backgroundRepeat: () => {
        return "no-repeat";
      },
    },
  },
  assetSelectorConfig: {
    accept: "image/*",
    fullUrl: false,
    placeholder: "Select an image...",
  },
} satisfies ShortcutWithAssetSelector<AllStylesSchemas, "backgroundImage">;

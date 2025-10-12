import { Paintbrush } from "lucide-react";
import { AllStylesSchemas } from "../../style";
import { ShortcutWithColor } from "../types";

export const colorShortcut: ShortcutWithColor<Pick<AllStylesSchemas, "color">> =
  {
    label: "pageBuilder.shortcuts.color",
    icon: Paintbrush,
    inputType: "color",
    targetStyle: "color",
  };

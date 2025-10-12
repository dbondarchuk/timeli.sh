import { PaintBucket } from "lucide-react";
import { AllStylesSchemas } from "../../style";
import { ShortcutWithColor } from "../types";

export const backgroundColorShortcut: ShortcutWithColor<
  Pick<AllStylesSchemas, "backgroundColor">
> = {
  label: "pageBuilder.shortcuts.backgroundColor",
  icon: PaintBucket,
  inputType: "color",
  targetStyle: "backgroundColor",
};

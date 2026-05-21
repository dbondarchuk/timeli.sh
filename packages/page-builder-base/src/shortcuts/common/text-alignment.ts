import { AlignLeft } from "lucide-react";
import { AllStylesSchemas } from "../../style";
import { Shortcut } from "../types";

export const textAlignmentShortcut: Shortcut<
  Pick<AllStylesSchemas, "textAlign">
> = {
  label: "builder.pageBuilder.blocks.text.shortcuts.alignment",
  icon: AlignLeft,
  options: [
    {
      label: "builder.pageBuilder.blocks.text.alignments.left",
      value: "left",
      targetStyles: {
        textAlign: "left",
      },
    },
    {
      label: "builder.pageBuilder.blocks.text.alignments.center",
      value: "center",
      targetStyles: {
        textAlign: "center",
      },
    },
    {
      label: "builder.pageBuilder.blocks.text.alignments.right",
      value: "right",
      targetStyles: {
        textAlign: "right",
      },
    },
    {
      label: "builder.pageBuilder.blocks.text.alignments.justify",
      value: "justify",
      targetStyles: {
        textAlign: "justify",
      },
    },
  ],
};

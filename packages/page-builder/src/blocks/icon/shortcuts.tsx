import { colorShortcut, Shortcut } from "@timelish/page-builder-base";
import { AllStylesSchemas } from "@timelish/page-builder-base/style";
import { MoveDiagonal2 } from "lucide-react";

export const iconShortcuts: Shortcut<AllStylesSchemas>[] = [
  {
    label: "builder.pageBuilder.blocks.icon.size",
    icon: ({ className }) => <MoveDiagonal2 className={className} />,
    inputType: "combobox",
    options: [
      {
        label: "builder.pageBuilder.blocks.icon.sizes.small",
        value: "small",
        targetStyles: {
          width: { value: 1, unit: "rem" },
          height: { value: 1, unit: "rem" },
        },
      },
      {
        label: "builder.pageBuilder.blocks.icon.sizes.medium",
        value: "medium",
        targetStyles: {
          width: { value: 1.5, unit: "rem" },
          height: { value: 1.5, unit: "rem" },
        },
      },
      {
        label: "builder.pageBuilder.blocks.icon.sizes.large",
        value: "large",
        targetStyles: {
          width: { value: 2, unit: "rem" },
          height: { value: 2, unit: "rem" },
        },
      },
      {
        label: "builder.pageBuilder.blocks.icon.sizes.xlarge",
        value: "xlarge",
        targetStyles: {
          width: { value: 3, unit: "rem" },
          height: { value: 3, unit: "rem" },
        },
      },
      {
        label: "builder.pageBuilder.blocks.icon.sizes.xxlarge",
        value: "xxlarge",
        targetStyles: {
          width: { value: 4, unit: "rem" },
          height: { value: 4, unit: "rem" },
        },
      },
    ],
  },
  colorShortcut,
];

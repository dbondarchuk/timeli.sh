import { AllKeys } from "@vivid/i18n";

export interface CSSValueOption<T extends string> {
  value: T;
  label: AllKeys;
  isKeyword?: boolean;
}

export const widthOrHeightOptions = [
  {
    value: "max-content",
    label: "builder.pageBuilder.styles.keywords.maxContent",
    isKeyword: true,
  },
  {
    value: "min-content",
    label: "builder.pageBuilder.styles.keywords.minContent",
    isKeyword: true,
  },
  {
    value: "fit-content",
    label: "builder.pageBuilder.styles.keywords.fitContent",
    isKeyword: true,
  },
  {
    value: "fill",
    label: "builder.pageBuilder.styles.keywords.fill",
    isKeyword: true,
  },
  {
    value: "content",
    label: "builder.pageBuilder.styles.keywords.content",
    isKeyword: true,
  },
] as const satisfies CSSValueOption<string>[];

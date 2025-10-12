import { BuilderKeys } from "@vivid/i18n";

export interface CSSValueOption<T extends string> {
  value: T;
  label: BuilderKeys;
  isKeyword?: boolean;
}

export const widthOrHeightOptions = [
  {
    value: "max-content",
    label: "pageBuilder.styles.keywords.maxContent",
    isKeyword: true,
  },
  {
    value: "min-content",
    label: "pageBuilder.styles.keywords.minContent",
    isKeyword: true,
  },
  {
    value: "fit-content",
    label: "pageBuilder.styles.keywords.fitContent",
    isKeyword: true,
  },
  { value: "fill", label: "pageBuilder.styles.keywords.fill", isKeyword: true },
  {
    value: "content",
    label: "pageBuilder.styles.keywords.content",
    isKeyword: true,
  },
] as const satisfies CSSValueOption<string>[];

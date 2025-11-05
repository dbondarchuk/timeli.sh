import { AllKeys } from "@timelish/i18n";
import * as z from "zod";

export type BaseZodDictionary = {
  [name: string]: z.ZodTypeAny;
};

export type ConfigurationProps<T> = {
  data: T;
  setData: (data: T) => void;
  base: BaseBlockProps | undefined;
  onBaseChange: (base: BaseBlockProps) => void;
};

export type BaseBlockProps = {
  id?: string;
  className?: string;
};

export type EditorProps<T> = T;

export type BuilderSchema = BaseZodDictionary;

export type BlockEditorDisableOptions = {
  keyboardShortcuts?: {
    moveUp?: boolean;
    moveDown?: boolean;
    delete?: boolean;
    pasteImage?: boolean;
    undoRedo?: boolean;
  };
};

export type EditorDocumentBlocksDictionary<T extends BuilderSchema = any> = {
  [K in keyof T]: {
    displayName: AllKeys;
    icon: React.ReactNode;
    Editor: React.ComponentType<EditorProps<z.infer<T[K]>>>;
    Configuration: React.ComponentType<ConfigurationProps<z.infer<T[K]>>>;
    Toolbar?: React.ComponentType<ConfigurationProps<z.infer<T[K]>>>;
    defaultValue: z.infer<T[K]> | (() => z.infer<T[K]>);
    category: AllKeys;
    allowedIn?: (keyof T)[];
    disable?: BlockEditorDisableOptions;
    staticProps?: Record<string, any>;
  };
};

export type BlockConfiguration<T extends BuilderSchema> = {
  [TType in keyof T]: {
    type: TType;
    data: z.infer<T[TType]>;
  };
}[keyof T];

// export function buildBlockConfigurationSchema<T extends BuilderSchema>(
//   blocks: BuilderSchema
// ) {
//   const blockObjects = Object.keys(blocks).map((type: keyof T) =>
//     z.object({
//       type: z.literal(type),
//       data: blocks[type],
//     })
//   );

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   return z
//     .discriminatedUnion("type", blockObjects as any)
//     .transform((v) => v as BlockConfiguration<T>);
// }

export function buildBlockConfigurationDictionary<T extends BaseZodDictionary>(
  blocks: EditorDocumentBlocksDictionary<T>,
) {
  return blocks;
}

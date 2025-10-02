"use client";

import {
  Builder,
  EditorDocumentBlocksDictionary,
  generateId,
  SidebarTab,
  TEditorConfiguration,
} from "@vivid/builder";
import { PageHeader, UploadedFile } from "@vivid/types";
import { deepMemo } from "@vivid/ui";
import { useMemo } from "react";
import { EditorBlocks, RootBlock } from "./blocks";
import { ImagePropsDefaults } from "./blocks/image";
import { ReaderBlocks } from "./blocks/reader";
import { EditorBlocksSchema } from "./blocks/schema";
import { Header } from "./header";
export { Styling } from "./helpers/styling";

type PageBuilderProps = {
  value?: TEditorConfiguration;
  onChange?: (value: TEditorConfiguration) => void;
  onIsValidChange?: (isValid: boolean) => void;
  args?: Record<string, any>;
  extraTabs?: SidebarTab[];
  header?: {
    config: PageHeader;
    name: string;
    logo?: string;
  };
  footer?: React.ReactNode;
  notAllowedBlocks?: (keyof typeof EditorBlocks)[];
};

const getImageBlock = (file: UploadedFile) => {
  return {
    type: "Image",
    id: generateId(),
    data: {
      ...ImagePropsDefaults,
      props: {
        ...ImagePropsDefaults.props,
        src: `/assets/${file.filename}`,
        alt: file.description,
      },
    },
  };
};

export const PageBuilder = deepMemo(
  ({
    args,
    value,
    onChange,
    onIsValidChange,
    extraTabs,
    header,
    footer,
    notAllowedBlocks,
  }: PageBuilderProps) => {
    const headerComponent = useMemo(
      () =>
        header ? (
          <Header
            name={header.name}
            logo={header.logo}
            config={header.config}
            className="-top-8"
          />
        ) : null,
      [header],
    );

    const editorBlocks = useMemo(() => {
      if (notAllowedBlocks) {
        return Object.fromEntries(
          Object.entries(EditorBlocks).filter(
            ([key]) =>
              !notAllowedBlocks.includes(key as keyof typeof EditorBlocks),
          ),
        );
      }
      return EditorBlocks;
    }, [notAllowedBlocks]);

    return (
      <Builder
        defaultValue={value}
        onChange={onChange}
        onIsValidChange={onIsValidChange}
        args={args}
        schemas={EditorBlocksSchema}
        editorBlocks={
          editorBlocks as EditorDocumentBlocksDictionary<
            typeof EditorBlocksSchema
          >
        }
        readerBlocks={ReaderBlocks}
        rootBlock={RootBlock}
        extraTabs={extraTabs}
        sidebarWidth={28}
        header={headerComponent}
        footer={footer}
        getImageBlock={getImageBlock}
      />
    );
  },
);

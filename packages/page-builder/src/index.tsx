"use client";

import {
  Builder,
  EditorDocumentBlocksDictionary,
  generateId,
  SidebarTab,
  TEditorConfiguration,
} from "@timelish/builder";
import { Header } from "@timelish/page-builder-base";
import { PageHeader, UploadedFile } from "@timelish/types";
import { deepMemo } from "@timelish/ui";
import { useMemo } from "react";
import {
  BlockProviderRegistry,
  resolveProviders,
} from "./block-providers/editor";
import { EditorBlocks, RootBlock } from "./blocks";
import { ImagePropsDefaults } from "./blocks/image";
import { ReaderBlocks } from "./blocks/reader";
import { EditorBlocksSchema } from "./blocks/schema";

export * from "./block-providers/editor";

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
  notAllowedBlocks?: (keyof typeof EditorBlocks | string)[];
  blockRegistry?: BlockProviderRegistry<typeof EditorBlocksSchema>;
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
    blockRegistry,
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

    const resolvedBlocks = useMemo(() => {
      return resolveProviders(blockRegistry || { providers: [] });
    }, [blockRegistry]);

    return (
      <Builder
        defaultValue={value}
        onChange={onChange}
        onIsValidChange={onIsValidChange}
        args={args}
        templates={resolvedBlocks.templates}
        schemas={{ ...EditorBlocksSchema, ...resolvedBlocks.schemas }}
        editorBlocks={
          {
            ...editorBlocks,
            ...resolvedBlocks.editors,
          } as EditorDocumentBlocksDictionary<typeof EditorBlocksSchema>
        }
        readerBlocks={{ ...ReaderBlocks, ...resolvedBlocks.readers }}
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

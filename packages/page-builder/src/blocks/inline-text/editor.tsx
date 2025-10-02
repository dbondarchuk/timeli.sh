"use client";

import { useCallback, useRef } from "react";
import sanitizeHtml from "sanitize-html";

import {
  useBlockEditor,
  useCurrentBlock,
  useDispatchAction,
  useEditorArgs,
  useIsSelectedBlock,
  usePortalContext,
  useSetSelectedBlockId,
} from "@vivid/builder";
import { useI18n } from "@vivid/i18n";
import { ArgumentsAutocomplete, cn, useDebounceCallback } from "@vivid/ui";
import { BlockStyle } from "../../helpers/styling";
import { useClassName } from "../../helpers/use-class-name";
import { useResizeBlockStyles } from "../../helpers/use-resize-block-styles";
import { InlineTextProps } from "./schema";
import { getDefaults, styles } from "./styles";

export function InlineTextEditor({ props, style }: InlineTextProps) {
  const t = useI18n("builder");
  const ref = useRef<HTMLInputElement>(null);
  const args = useEditorArgs();
  const currentBlock = useCurrentBlock<InlineTextProps>();
  const value = currentBlock?.data?.props?.text;
  const dispatchAction = useDispatchAction();
  const setSelectedBlockId = useSetSelectedBlockId();
  const onResize = useResizeBlockStyles();
  // const setRef = useSetCurrentBlockRef();
  const overlayProps = useBlockEditor(currentBlock.id, onResize);

  const { document } = usePortalContext();

  const isSelected = useIsSelectedBlock(currentBlock?.id);

  const sanitizeConf = {
    allowedTags: [],
    allowedAttributes: {},
  };

  const onChange = useDebounceCallback(
    (value: string) => {
      dispatchAction({
        type: "set-block-data",
        value: {
          blockId: currentBlock.id,
          data: {
            ...currentBlock.data,
            props: {
              ...currentBlock.data?.props,
              text: sanitizeHtml(value, sanitizeConf),
            },
          },
        },
      });
    },
    [currentBlock, dispatchAction],
    300,
  );

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    const { key } = e;
    if (key === "Enter") {
      e.preventDefault();
      ref?.current?.blur();
      setSelectedBlockId(null);
    }
  }, []);

  const className = useClassName();
  const defaults = getDefaults({ props, style }, true);
  const base = currentBlock.base;

  return (
    <>
      <BlockStyle
        name={className}
        styleDefinitions={styles}
        styles={style}
        defaults={defaults}
        isEditor
      />
      <ArgumentsAutocomplete
        ref={(el) => {
          ref.current = el as HTMLInputElement;
          overlayProps.ref(el as HTMLElement);
        }}
        args={args}
        className={cn(
          "w-fit bg-transparent border-0 focus-visible:ring-0 rounded-none h-auto p-0 border-none leading-normal cursor-text",
          isSelected && "px-1",
          className,
          base?.className,
        )}
        value={value ?? "Simple text"}
        onChange={onChange}
        onKeyDown={handleKeyPress}
        asContentEditable
        element={"span"}
        placeholder={t("pageBuilder.blocks.inlineText.placeholder")}
        documentElement={document}
        style={
          {
            //// @ts-expect-error - TODO: remove this once we have a proper solution for this
            // fieldSizing: "content",
          }
        }
        id={base?.id}
        onClick={overlayProps.onClick}
      />
    </>
  );
}

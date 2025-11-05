import type { VariantProps } from "class-variance-authority";
import React from "react";

import { cn } from "@timelish/ui";
import { withProps } from "@udecode/cn";
import {
  BaseParagraphPlugin,
  createSlateEditor,
  PlateStatic,
  SlateEditor,
  SlateLeaf,
  Value,
} from "@udecode/plate";
import { BaseAlignPlugin } from "@udecode/plate-alignment";
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from "@udecode/plate-basic-marks";
import { BaseBlockquotePlugin } from "@udecode/plate-block-quote";
import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from "@udecode/plate-code-block";
import { BaseCommentsPlugin } from "@udecode/plate-comments";
import { BaseDatePlugin } from "@udecode/plate-date";
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontSizePlugin,
  BaseFontWeightPlugin,
} from "@udecode/plate-font";
import {
  BaseHeadingPlugin,
  BaseTocPlugin,
  HEADING_KEYS,
  HEADING_LEVELS,
} from "@udecode/plate-heading";
import { BaseHighlightPlugin } from "@udecode/plate-highlight";
import { BaseHorizontalRulePlugin } from "@udecode/plate-horizontal-rule";
import { BaseIndentPlugin } from "@udecode/plate-indent";
import { BaseIndentListPlugin } from "@udecode/plate-indent-list";
import { BaseKbdPlugin } from "@udecode/plate-kbd";
import { BaseColumnItemPlugin, BaseColumnPlugin } from "@udecode/plate-layout";
import { BaseLineHeightPlugin } from "@udecode/plate-line-height";
import { BaseLinkPlugin } from "@udecode/plate-link";
import { MarkdownPlugin } from "@udecode/plate-markdown";
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
} from "@udecode/plate-math";
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from "@udecode/plate-media";
import { BaseMentionPlugin } from "@udecode/plate-mention";
import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from "@udecode/plate-table";
import { BaseTogglePlugin } from "@udecode/plate-toggle";
import Prism from "prismjs";
import { BlockquoteElementStatic } from "../plate-ui/blockquote-element-static";
import { CodeBlockElementStatic } from "../plate-ui/code-block-element-static";
import { CodeLeafStatic } from "../plate-ui/code-leaf-static";
import { CodeLineElementStatic } from "../plate-ui/code-line-element-static";
import { CodeSyntaxLeafStatic } from "../plate-ui/code-syntax-leaf-static";
import { ColumnElementStatic } from "../plate-ui/column-element-static";
import { ColumnGroupElementStatic } from "../plate-ui/column-group-element-static";
import { CommentLeafStatic } from "../plate-ui/comment-leaf-static";
import { DateElementStatic } from "../plate-ui/date-element-static";
import { editorVariants } from "../plate-ui/editor-static";
import { EquationElementStatic } from "../plate-ui/equation-element-static";
import { HeadingElementStatic } from "../plate-ui/heading-element-static";
import { HighlightLeafStatic } from "../plate-ui/highlight-leaf-static";
import { HrElementStatic } from "../plate-ui/hr-element-static";
import { ImageElementStatic } from "../plate-ui/image-element-static";
import { FireLiComponent, FireMarker } from "../plate-ui/indent-fire-marker";
import {
  TodoLiStatic,
  TodoMarkerStatic,
} from "../plate-ui/indent-todo-marker-static";
import { InlineEquationElementStatic } from "../plate-ui/inline-equation-element-static";
import { KbdLeafStatic } from "../plate-ui/kbd-leaf-static";
import { LinkElementStatic } from "../plate-ui/link-element-static";
import { MediaAudioElementStatic } from "../plate-ui/media-audio-element-static";
import { MediaFileElementStatic } from "../plate-ui/media-file-element-static";
import { MediaVideoElementStatic } from "../plate-ui/media-video-element-static";
import { MentionElementStatic } from "../plate-ui/mention-element-static";
import { ParagraphElementStatic } from "../plate-ui/paragraph-element-static";
import {
  TableCellElementStatic,
  TableCellHeaderStaticElement,
} from "../plate-ui/table-cell-element-static";
import { TableElementStatic } from "../plate-ui/table-element-static";
import { TableRowElementStatic } from "../plate-ui/table-row-element-static";
import { TocElementStatic } from "../plate-ui/toc-element-static";
import { ToggleElementStatic } from "../plate-ui/toggle-element-static";

export type PlateStaticEditorProps = {
  value?: Value;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  onClick?: () => void;
  ref?: React.Ref<HTMLDivElement>;
} & VariantProps<typeof editorVariants>;

export const createPlateStaticEditor = (
  value?: string | Value | ((editor: SlateEditor) => Value) | undefined,
  options?: {
    includeMarkdown?: boolean;
  },
) =>
  createSlateEditor({
    plugins: [
      BaseColumnPlugin,
      BaseColumnItemPlugin,
      BaseTocPlugin,
      BaseVideoPlugin,
      BaseAudioPlugin,
      BaseParagraphPlugin,
      BaseHeadingPlugin,
      BaseMediaEmbedPlugin,
      BaseBoldPlugin,
      BaseFontWeightPlugin,
      BaseCodePlugin,
      BaseItalicPlugin,
      BaseStrikethroughPlugin,
      BaseSubscriptPlugin,
      BaseSuperscriptPlugin,
      BaseUnderlinePlugin,
      BaseBlockquotePlugin,
      BaseDatePlugin,
      BaseEquationPlugin,
      BaseInlineEquationPlugin,
      BaseCodeBlockPlugin.configure({
        options: {
          prism: Prism,
        },
      }),
      BaseIndentPlugin.extend({
        inject: {
          targetPlugins: [
            BaseParagraphPlugin.key,
            BaseBlockquotePlugin.key,
            BaseCodeBlockPlugin.key,
          ],
        },
      }),
      BaseIndentListPlugin.extend({
        inject: {
          targetPlugins: [
            BaseParagraphPlugin.key,
            ...HEADING_LEVELS,
            BaseBlockquotePlugin.key,
            BaseCodeBlockPlugin.key,
            BaseTogglePlugin.key,
          ],
        },
        options: {
          listStyleTypes: {
            fire: {
              liComponent: FireLiComponent,
              markerComponent: FireMarker,
              type: "fire",
            },
            todo: {
              liComponent: TodoLiStatic,
              markerComponent: TodoMarkerStatic,
              type: "todo",
            },
          },
        },
      }),
      BaseLinkPlugin.extend({
        options: {
          forceSubmit: true,
          dangerouslySkipSanitization: true,
        },
      }),
      BaseTableRowPlugin,
      BaseTablePlugin,
      BaseTableCellPlugin,
      BaseHorizontalRulePlugin,
      BaseFontColorPlugin,
      BaseFontBackgroundColorPlugin,
      BaseFontSizePlugin,
      BaseKbdPlugin,
      BaseAlignPlugin.extend({
        inject: {
          targetPlugins: [
            BaseParagraphPlugin.key,
            BaseMediaEmbedPlugin.key,
            ...HEADING_LEVELS,
            BaseImagePlugin.key,
          ],
        },
      }),
      BaseLineHeightPlugin,
      BaseHighlightPlugin,
      BaseFilePlugin,
      BaseImagePlugin,
      BaseMentionPlugin,
      BaseCommentsPlugin,
      BaseTogglePlugin,
      ...(options?.includeMarkdown
        ? [
            MarkdownPlugin.configure({
              options: {
                indentList: true,
              },
            }),
          ]
        : []),
    ],
    value: value,
  });

export const PlateStaticEditor: React.FC<PlateStaticEditorProps> = ({
  value,
  style,
  className,
  id,
  variant,
  ...rest
}) => {
  const editorStatic = createPlateStaticEditor(value);

  const components = {
    [BaseAudioPlugin.key]: MediaAudioElementStatic,
    [BaseBlockquotePlugin.key]: BlockquoteElementStatic,
    [BaseBoldPlugin.key]: withProps(SlateLeaf, { as: "strong" }),
    [BaseCodeBlockPlugin.key]: CodeBlockElementStatic,
    [BaseCodeLinePlugin.key]: CodeLineElementStatic,
    [BaseCodePlugin.key]: CodeLeafStatic,
    [BaseCodeSyntaxPlugin.key]: CodeSyntaxLeafStatic,
    [BaseColumnItemPlugin.key]: ColumnElementStatic,
    [BaseColumnPlugin.key]: ColumnGroupElementStatic,
    [BaseCommentsPlugin.key]: CommentLeafStatic,
    [BaseDatePlugin.key]: DateElementStatic,
    [BaseEquationPlugin.key]: EquationElementStatic,
    [BaseFilePlugin.key]: MediaFileElementStatic,
    [BaseHighlightPlugin.key]: HighlightLeafStatic,
    [BaseHorizontalRulePlugin.key]: HrElementStatic,
    [BaseImagePlugin.key]: ImageElementStatic,
    [BaseInlineEquationPlugin.key]: InlineEquationElementStatic,
    [BaseItalicPlugin.key]: withProps(SlateLeaf, { as: "em" }),
    [BaseKbdPlugin.key]: KbdLeafStatic,
    [BaseLinkPlugin.key]: LinkElementStatic,
    // [BaseMediaEmbedPlugin.key]: MediaEmbedElementStatic,
    [BaseMentionPlugin.key]: MentionElementStatic,
    [BaseParagraphPlugin.key]: ParagraphElementStatic,
    [BaseStrikethroughPlugin.key]: withProps(SlateLeaf, { as: "del" }),
    [BaseSubscriptPlugin.key]: withProps(SlateLeaf, { as: "sub" }),
    [BaseSuperscriptPlugin.key]: withProps(SlateLeaf, { as: "sup" }),
    [BaseTableCellHeaderPlugin.key]: TableCellHeaderStaticElement,
    [BaseTableCellPlugin.key]: TableCellElementStatic,
    [BaseTablePlugin.key]: TableElementStatic,
    [BaseTableRowPlugin.key]: TableRowElementStatic,
    [BaseTocPlugin.key]: TocElementStatic,
    [BaseTogglePlugin.key]: ToggleElementStatic,
    [BaseUnderlinePlugin.key]: withProps(SlateLeaf, { as: "u" }),
    [BaseVideoPlugin.key]: MediaVideoElementStatic,
    [HEADING_KEYS.h1]: withProps(HeadingElementStatic, { variant: "h1" }),
    [HEADING_KEYS.h2]: withProps(HeadingElementStatic, { variant: "h2" }),
    [HEADING_KEYS.h3]: withProps(HeadingElementStatic, { variant: "h3" }),
    [HEADING_KEYS.h4]: withProps(HeadingElementStatic, { variant: "h4" }),
    [HEADING_KEYS.h5]: withProps(HeadingElementStatic, { variant: "h5" }),
    [HEADING_KEYS.h6]: withProps(HeadingElementStatic, { variant: "h6" }),
  };

  return (
    <PlateStatic
      editor={editorStatic}
      components={components}
      style={style}
      className={cn(editorVariants({ variant }), className)}
      id={id}
      {...rest}
    />
  );
};

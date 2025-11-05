"use client";

import { Fragment } from "react";

import {
  EditorChildren,
  useBlockEditor,
  useCurrentBlock,
  useSetSelectedBlockId,
} from "@timelish/builder";
import { getFontFamily } from "../../style-inputs/helpers/styles";
import { EmailLayoutProps } from "./schema";

export const EmailLayoutEditor = (props: EmailLayoutProps) => {
  const currentBlock = useCurrentBlock<EmailLayoutProps>();
  const setSelectedBlockId = useSetSelectedBlockId();
  const overlayProps = useBlockEditor(currentBlock.id);
  return (
    <Fragment>
      {props.previewText && (
        <div style={{ display: "none", maxHeight: "0px", overflow: "hidden" }}>
          {props.previewText}
          &nbsp;&#8204;&nbsp;&#204;&nbsp;&#8204;&nbsp;
        </div>
      )}
      <div
        {...overlayProps}
        onClick={() => {
          setSelectedBlockId(null);
        }}
        style={{
          backgroundColor: props.backdropColor ?? "#F5F5F5",
          color: props.textColor ?? "#262626",
          fontFamily: getFontFamily(props.fontFamily),
          fontSize: "16px",
          fontWeight: "400",
          letterSpacing: "0.15008px",
          lineHeight: "1.5",
          margin: "0",
          padding: "32px 0",
          width: "100%",
          minHeight: "100%",
        }}
      >
        <table
          align="center"
          width="100%"
          style={{
            margin: "0 auto",
            maxWidth: "80%",
            backgroundColor: props.canvasColor ?? "#FFFFFF",
            borderRadius: props.borderRadius ?? undefined,
            border: (() => {
              const v = props.borderColor;
              if (!v) {
                return undefined;
              }
              return `1px solid ${v}`;
            })(),
          }}
          role="presentation"
          cellSpacing="0"
          cellPadding="0"
          border={0}
        >
          <tbody>
            <tr style={{ width: "100%" }}>
              <td>
                <EditorChildren blockId={currentBlock.id} property="" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Fragment>
  );
};

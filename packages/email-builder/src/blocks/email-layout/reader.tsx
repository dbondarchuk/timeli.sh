import { ReaderBlock, ReaderProps } from "@timelish/builder";
import { getFontFamily } from "../../style-inputs/helpers/styles";
import { EmailLayoutProps, EmailLayoutReaderProps } from "./schema";

function getBorder({ borderColor }: EmailLayoutProps) {
  if (!borderColor) {
    return undefined;
  }
  return `1px solid ${borderColor}`;
}

export const EmailLayoutReader = ({
  args,
  document,
  ...props
}: ReaderProps<EmailLayoutReaderProps>) => {
  const children = props.children ?? [];
  return (
    <>
      {props.previewText && (
        <div style={{ display: "none", maxHeight: "0px", overflow: "hidden" }}>
          {props.previewText}
          &nbsp;&#8204;&nbsp;&#124;&nbsp;&#8204;&nbsp;
        </div>
      )}
      <div
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
          minHeight: "100%",
          width: "100%",
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
            border: getBorder(props),
          }}
          role="presentation"
          cellSpacing="0"
          cellPadding="0"
          border={0}
        >
          <tbody>
            <tr style={{ width: "100%" }}>
              <td>
                {children.map((child) => (
                  <ReaderBlock
                    blocks={props.blocks}
                    key={child.id}
                    block={child}
                    args={args}
                    document={document}
                    isEditor={props.isEditor}
                  />
                ))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

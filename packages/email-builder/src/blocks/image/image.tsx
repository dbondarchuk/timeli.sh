import { forwardRef } from "react";
import { ImageProps } from "./schema";
import { getImageStyles, getWrapperStyles } from "./styles";

export const Image = forwardRef<
  HTMLImageElement,
  ImageProps & { onClick?: (e: React.MouseEvent<HTMLImageElement>) => void }
>(({ style, props, onClick }, ref) => {
  const sectionStyle = getWrapperStyles({ style });
  const imageStyle = getImageStyles({ props });

  const linkHref = props?.linkHref ?? null;
  const width = props?.width ?? undefined;
  const height = props?.height ?? undefined;

  const imageElement = (
    <img
      alt={props?.alt ?? ""}
      src={props?.url ?? ""}
      width={width}
      height={height}
      style={{
        width,
        height,
        ...imageStyle,
      }}
    />
  );

  return (
    <div style={sectionStyle} ref={ref} onClick={onClick}>
      {linkHref ? (
        <a href={linkHref} style={{ textDecoration: "none" }} target="_blank">
          {imageElement}
        </a>
      ) : (
        imageElement
      )}
    </div>
  );
});

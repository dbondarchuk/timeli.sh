import { BlockStyle, generateClassName } from "@vivid/page-builder-base/reader";
import { cn } from "@vivid/ui";
import { forwardRef } from "react";
import { ImageLightbox } from "./image-lightbox";
import { ImageReaderProps } from "./schema";
import { getDefaults, styles } from "./styles";

export const Image = forwardRef<
  HTMLImageElement | HTMLAnchorElement,
  Pick<ImageReaderProps, "style" | "props" | "block"> & {
    onClick?: (e: React.MouseEvent) => void;
  }
>(({ style, props, block, onClick }, ref) => {
  const linkHref = props?.linkHref;

  const className = generateClassName();
  const base = block.base;
  const imageElement = (
    <ImageLightbox
      alt={props?.alt ?? ""}
      src={props?.src ?? ""}
      className={cn(className, base?.className)}
      id={base?.id}
      ref={!linkHref ? (ref as any) : undefined}
      onClick={onClick}
    />
  );

  const element = !linkHref ? (
    imageElement
  ) : (
    <a
      href={linkHref}
      style={{ textDecoration: "none", display: "block" }}
      ref={ref as any}
    >
      {imageElement}
    </a>
  );

  const defaults = getDefaults({ props, style }, false);

  return (
    <>
      <BlockStyle
        name={className}
        styleDefinitions={styles}
        styles={style}
        defaults={defaults}
        isEditor={false}
      />
      {element}
    </>
  );
});

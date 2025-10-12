"use client";

import { useBlockEditor, useCurrentBlock } from "@vivid/builder";
import {
  BlockStyle,
  ReplaceOriginalColors,
  useClassName,
} from "@vivid/page-builder-base";
import { cn } from "@vivid/ui";
import { Booking } from "./components/booking";
import { BookingProps } from "./schema";
import { styles } from "./styles";

export const BookingEditor = ({ props, style }: BookingProps) => {
  const currentBlock = useCurrentBlock<BookingProps>();
  const overlayProps = useBlockEditor(currentBlock.id);

  const className = useClassName();
  const base = currentBlock.base;

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      <ReplaceOriginalColors />
      <Booking
        className={cn(className, base?.className)}
        id={base?.id}
        successPage={props.confirmationPage}
        isEditor
        {...overlayProps}
      />
    </>
  );
};

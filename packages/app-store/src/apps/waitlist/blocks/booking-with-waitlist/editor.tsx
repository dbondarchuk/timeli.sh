"use client";

import { useBlockEditor, useCurrentBlock } from "@vivid/builder";
import {
  BlockStyle,
  ReplaceOriginalColors,
  useClassName,
} from "@vivid/page-builder-base";
import { cn } from "@vivid/ui";
import { BookingWithWaitlist } from "./components/booking";
import { BookingWithWaitlistProps } from "./schema";
import { styles } from "./styles";

export const BookingWithWaitlistEditor = ({
  props,
  style,
  appId,
}: BookingWithWaitlistProps & { appId?: string }) => {
  const currentBlock = useCurrentBlock<BookingWithWaitlistProps>();
  const overlayProps = useBlockEditor(currentBlock.id);

  const className = useClassName();
  const base = currentBlock.base;

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      <ReplaceOriginalColors />
      <BookingWithWaitlist
        className={cn(className, base?.className)}
        id={base?.id}
        successPage={props.confirmationPage}
        isEditor
        isOnlyWaitlist={false}
        appId={appId}
        {...overlayProps}
      />
    </>
  );
};

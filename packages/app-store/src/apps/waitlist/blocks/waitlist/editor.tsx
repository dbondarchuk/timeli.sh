"use client";

import { useBlockEditor, useCurrentBlock } from "@vivid/builder";
import {
  BlockStyle,
  ReplaceOriginalColors,
  useClassName,
} from "@vivid/page-builder-base";
import { cn } from "@vivid/ui";
import { BookingWithWaitlist } from "../booking-with-waitlist/components/booking";
import { WaitlistProps } from "./schema";
import { styles } from "./styles";

export const WaitlistEditor = ({
  props,
  style,
  appId,
}: WaitlistProps & { appId?: string }) => {
  const currentBlock = useCurrentBlock<WaitlistProps>();
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
        isEditor
        appId={appId}
        isOnlyWaitlist={true}
        {...overlayProps}
      />
    </>
  );
};

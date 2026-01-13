"use client";

import { useBlockEditor, useCurrentBlock } from "@timelish/builder";
import {
  BlockStyle,
  ReplaceOriginalColors,
  useClassName,
} from "@timelish/page-builder-base";
import { cn } from "@timelish/ui";
import { BookingWithWaitlist } from "../booking-with-waitlist/components/booking";
import { WaitlistProps } from "./schema";
import { styles } from "./styles";

export const WaitlistEditor = ({ props, style }: WaitlistProps) => {
  const currentBlock = useCurrentBlock<WaitlistProps>();

  const metadata = currentBlock?.metadata;
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
        appId={metadata?.waitlistAppId}
        isOnlyWaitlist={true}
        scrollToTop={props.scrollToTop}
        hideTitle={props.hideTitle}
        hideSteps={props.hideSteps}
        {...overlayProps}
      />
    </>
  );
};

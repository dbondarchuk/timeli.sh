"use client";

import { useBlockEditor, useCurrentBlock, useEditorArgs } from "@vivid/builder";
import { Appointment } from "@vivid/types";
import { cn } from "@vivid/ui";
import { useMemo } from "react";
import { ReplaceOriginalColors } from "../../helpers/replace-original-colors";
import { BlockStyle } from "../../helpers/styling";
import { useClassName } from "../../helpers/use-class-name";
import { ConfirmationCard } from "./confirmation-card";
import { BookingConfirmationProps } from "./schema";
import { styles } from "./styles";

const useAppointment = () => {
  const args = useEditorArgs();

  const appointment = useMemo(
    () => args.appointment as Appointment,
    [JSON.stringify(args.appointment)],
  );

  return appointment;
};

export const BookingConfirmationEditor = ({
  props,
  style,
}: BookingConfirmationProps) => {
  const currentBlock = useCurrentBlock<BookingConfirmationProps>();
  const overlayProps = useBlockEditor(currentBlock.id);
  const appointment = useAppointment();

  const className = useClassName();
  const base = currentBlock.base;

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      <ReplaceOriginalColors />
      <ConfirmationCard
        className={cn(className, base?.className)}
        id={base?.id}
        appointment={appointment}
        {...overlayProps}
      />
    </>
  );
};

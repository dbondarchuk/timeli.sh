"use client";

import { useBlockEditor, useCurrentBlock } from "@vivid/builder";
import { cn } from "@vivid/ui";
import { ReplaceOriginalColors } from "../../helpers/replace-original-colors";
import { BlockStyle } from "../../helpers/styling";
import { useClassName } from "../../helpers/use-class-name";
import { ModifyAppointmentForm } from "./components/modify-appointment-form";
import { ModifyAppointmentFormProps } from "./schema";
import { styles } from "./styles";

export const ModifyAppointmentFormEditor = ({
  props,
  style,
}: ModifyAppointmentFormProps) => {
  const currentBlock = useCurrentBlock<ModifyAppointmentFormProps>();
  const overlayProps = useBlockEditor(currentBlock.id);

  const className = useClassName();
  const base = currentBlock.base;

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      <ReplaceOriginalColors />
      <ModifyAppointmentForm
        className={cn(className, base?.className)}
        id={base?.id}
        isEditor
        {...overlayProps}
      />
    </>
  );
};

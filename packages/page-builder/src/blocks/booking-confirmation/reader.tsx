import { Appointment } from "@vivid/types";
import { cn } from "@vivid/ui";
import { redirect } from "next/navigation";
import { generateClassName } from "../../helpers/class-name-generator";
import { ReplaceOriginalColors } from "../../helpers/replace-original-colors";
import { BlockStyle } from "../../helpers/styling";
import { ConfirmationCard } from "./confirmation-card";
import { BookingConfirmationReaderProps } from "./schema";
import { styles } from "./styles";

export const BookingConfirmationReader = ({
  props,
  style,
  args,
  isEditor,
  ...rest
}: BookingConfirmationReaderProps) => {
  const className = generateClassName();
  const base = rest.block.base;

  const appointment = args?.appointment as Appointment;
  if (!appointment && !isEditor) {
    return redirect("/");
  }

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      {isEditor && <ReplaceOriginalColors />}
      <ConfirmationCard
        className={cn(className, base?.className)}
        appointment={appointment}
        id={base?.id}
      />
    </>
  );
};

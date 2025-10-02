import { cn } from "@vivid/ui";
import { generateClassName } from "../../helpers/class-name-generator";
import { ReplaceOriginalColors } from "../../helpers/replace-original-colors";
import { BlockStyle } from "../../helpers/styling";
import { ModifyAppointmentForm } from "./components/modify-appointment-form";
import { ModifyAppointmentFormReaderProps } from "./schema";
import { styles } from "./styles";

export const ModifyAppointmentFormReader = ({
  props,
  style,
  args,
  isEditor,
  ...rest
}: ModifyAppointmentFormReaderProps) => {
  const className = generateClassName();
  const base = rest.block.base;

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      {isEditor && <ReplaceOriginalColors />}
      <ModifyAppointmentForm
        className={cn(className, base?.className)}
        id={base?.id}
      />
    </>
  );
};

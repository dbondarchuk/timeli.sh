import InputMask from "@mona-health/react-input-mask";
import React from "react";
import { Input, InputProps } from "./input";
export type Mask = Array<string | RegExp> | string;
export type MaskedInputProps = InputProps & {
  mask?: React.ComponentProps<typeof InputMask>["mask"];
  maskPlaceholder?: string;
  ref?: React.Ref<HTMLInputElement> | undefined;
};

export const MaskedInput: React.FC<MaskedInputProps> = ({
  mask,
  value,
  disabled = false,
  onChange,
  onBlur,
  maskPlaceholder = "_",
  ...props
}) => {
  return mask ? (
    <InputMask
      mask={mask}
      value={value}
      maskPlaceholder={maskPlaceholder}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
    >
      <Input {...props} />
    </InputMask>
  ) : (
    <Input {...props} />
  );
};

import { FormControl, FormField, FormItem } from "../form";
import { Input } from "../input";

import { FieldValues } from "react-hook-form";
import { getFieldName, IFormFieldProps } from "./form-fiel.types";
import { FormFieldDescription } from "./form-field-description";
import { FormFieldErrorMessage } from "./form-field-error-message";
import { FormFieldLabel } from "./form-field-label";

export const NameField: <T extends FieldValues>(
  p: IFormFieldProps<T>,
) => React.ReactElement<IFormFieldProps<T>> = (props) => (
  <FormField
    control={props.control}
    name={getFieldName(props)}
    render={({ field }) => (
      <FormItem>
        <FormFieldLabel
          label={props.data?.label || "form_name_label"}
          required={props.required}
        />
        <FormControl>
          <Input {...field} disabled={field.disabled || props.disabled} />
        </FormControl>
        <FormFieldDescription description={props.data?.description} />
        <FormFieldErrorMessage />
      </FormItem>
    )}
  />
);

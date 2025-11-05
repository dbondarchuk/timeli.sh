import { FormControl, FormField, FormItem } from "../form";
import { Input } from "../input";

import { WithLabelFieldData } from "@timelish/types";
import { FieldValues } from "react-hook-form";
import { getFieldName, IFormFieldProps } from "./form-fiel.types";
import { FormFieldDescription } from "./form-field-description";
import { FormFieldErrorMessage } from "./form-field-error-message";
import { FormFieldLabel } from "./form-field-label";

export const OneLineField: <T extends FieldValues>(
  p: IFormFieldProps<T, WithLabelFieldData>,
) => React.ReactElement<IFormFieldProps<T, WithLabelFieldData>> = (props) => (
  <FormField
    control={props.control}
    name={getFieldName(props)}
    render={({ field }) => (
      <FormItem>
        <FormFieldLabel label={props.data.label} required={props.required} />
        <FormControl>
          <Input
            {...field}
            placeholder="Type your response here"
            disabled={field.disabled || props.disabled}
          />
        </FormControl>
        <FormFieldDescription description={props.data?.description} />
        <FormFieldErrorMessage />
      </FormItem>
    )}
  />
);

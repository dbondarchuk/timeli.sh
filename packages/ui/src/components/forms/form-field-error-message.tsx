import { TranslationKeys, useI18n } from "@timelish/i18n";
import React from "react";
import { cn } from "../../utils";
import { useFormField } from "../form";

export const FormFieldErrorMessage = React.forwardRef<
  HTMLParagraphElement,
  Exclude<React.HTMLAttributes<HTMLParagraphElement>, "children">
>(({ className, ...props }, ref) => {
  const i18n = useI18n("translation");
  const { error, formMessageId } = useFormField();
  const body = error?.message;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {i18n(body as TranslationKeys)}
    </p>
  );
});

FormFieldErrorMessage.displayName = "FormFieldErrorMessage";

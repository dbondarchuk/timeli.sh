import { BookingConfiguration } from "@vivid/types";
import { UseFormReturn } from "react-hook-form";

export type TabProps = {
  form: UseFormReturn<BookingConfiguration>;
  disabled?: boolean;
};

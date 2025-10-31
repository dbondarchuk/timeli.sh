import { BaseReaderBlockProps } from "@vivid/builder";
import * as z from "zod";
import { zStyles } from "./styles";

export const BookingWithWaitlistPropsSchema = z.object({
  style: zStyles,
  props: z.object({
    confirmationPage: z.string().optional().nullable(),
  }),
});

export type BookingWithWaitlistProps = z.infer<
  typeof BookingWithWaitlistPropsSchema
>;
export type BookingWithWaitlistReaderProps = BaseReaderBlockProps<any> &
  BookingWithWaitlistProps & { appId?: string };

export const BookingWithWaitlistPropsDefaults = {
  style: {
    display: [
      {
        value: "grid",
      },
    ],
    gridTemplateColumns: [
      {
        value: "1fr",
      },
      {
        value: "repeat(2, 1fr)",
        breakpoint: ["md"],
      },
      {
        value: "repeat(3, 1fr)",
        breakpoint: ["lg"],
      },
    ],
    alignItems: [
      {
        value: "stretch",
      },
    ],
    justifyContent: [
      {
        value: "center",
      },
    ],
    gap: [
      {
        value: {
          value: 2.5,
          unit: "rem",
        },
      },
    ],
  },
  props: {},
} as const satisfies BookingWithWaitlistProps;

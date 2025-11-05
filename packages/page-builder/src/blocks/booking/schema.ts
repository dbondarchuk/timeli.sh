import { BaseReaderBlockProps } from "@timelish/builder";
import * as z from "zod";
import { zStyles } from "./styles";

export const BookingPropsSchema = z.object({
  style: zStyles,
  props: z.object({
    confirmationPage: z.string().optional().nullable(),
  }),
});

export type BookingProps = z.infer<typeof BookingPropsSchema>;
export type BookingReaderProps = BaseReaderBlockProps<any> & BookingProps;

export const BookingPropsDefaults = {
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
} as const satisfies BookingProps;

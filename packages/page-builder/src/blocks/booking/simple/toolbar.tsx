import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { BookingProps } from "./schema";
import { bookingShortcuts } from "./shortcuts";

export const BookingToolbar = (props: ConfigurationProps<BookingProps>) => (
  <ShortcutsToolbar
    shortcuts={bookingShortcuts}
    data={props.data}
    setData={props.setData}
  />
);

import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { BookingWithWaitlistProps } from "./schema";
import { bookingWithWaitlistShortcuts } from "./shortcuts";

export const BookingWithWaitlistToolbar = (
  props: ConfigurationProps<BookingWithWaitlistProps>,
) => (
  <ShortcutsToolbar
    shortcuts={bookingWithWaitlistShortcuts}
    data={props.data}
    setData={props.setData}
  />
);

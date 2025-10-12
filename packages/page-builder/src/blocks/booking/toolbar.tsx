import { ConfigurationProps } from "@vivid/builder";
import { ShortcutsToolbar } from "@vivid/page-builder-base";
import { BookingProps } from "./schema";
import { bookingShortcuts } from "./shortcuts";

export const BookingToolbar = (props: ConfigurationProps<BookingProps>) => (
  <ShortcutsToolbar
    shortcuts={bookingShortcuts}
    data={props.data}
    setData={props.setData}
  />
);

import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { CarouselProps } from "./schema";
import { carouselShortcuts } from "./shortcuts";

export const CarouselToolbar = (props: ConfigurationProps<CarouselProps>) => (
  <ShortcutsToolbar
    shortcuts={carouselShortcuts}
    data={props.data}
    setData={props.setData}
  />
);

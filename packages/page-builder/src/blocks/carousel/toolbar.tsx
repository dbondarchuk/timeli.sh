import { ConfigurationProps } from "@vivid/builder";
import { ShortcutsToolbar } from "@vivid/page-builder-base";
import { CarouselProps } from "./schema";
import { carouselShortcuts } from "./shortcuts";

export const CarouselToolbar = (props: ConfigurationProps<CarouselProps>) => (
  <ShortcutsToolbar
    shortcuts={carouselShortcuts}
    data={props.data}
    setData={props.setData}
  />
);

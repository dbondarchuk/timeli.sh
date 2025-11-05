import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { GridContainerProps } from "./schema";
import { gridContainerShortcuts } from "./shortcuts";

export const GridContainerToolbar = (
  props: ConfigurationProps<GridContainerProps>,
) => (
  <>
    <ShortcutsToolbar
      shortcuts={gridContainerShortcuts}
      data={props.data}
      setData={props.setData}
    />
  </>
);

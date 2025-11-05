import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { ContainerProps } from "./schema";
import { containerShortcuts } from "./shortcuts";

export const ContainerToolbar = (props: ConfigurationProps<ContainerProps>) => (
  <ShortcutsToolbar
    shortcuts={containerShortcuts}
    data={props.data}
    setData={props.setData}
  />
);

import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { IconProps } from "./schema";
import { iconShortcuts } from "./shortcuts";

export const IconToolbar = (props: ConfigurationProps<IconProps>) => {
  return (
    <ShortcutsToolbar
      shortcuts={iconShortcuts}
      data={props.data}
      setData={props.setData}
    />
  );
};

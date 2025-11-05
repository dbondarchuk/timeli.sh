import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { ButtonProps } from "./schema";
import { buttonShortcuts } from "./shortcuts";

export const ButtonToolbar = (props: ConfigurationProps<ButtonProps>) => {
  return (
    <ShortcutsToolbar
      shortcuts={buttonShortcuts}
      data={props.data}
      setData={props.setData}
    />
  );
};

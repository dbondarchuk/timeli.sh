import { ConfigurationProps } from "@vivid/builder";
import { ShortcutsToolbar } from "@vivid/page-builder-base";
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

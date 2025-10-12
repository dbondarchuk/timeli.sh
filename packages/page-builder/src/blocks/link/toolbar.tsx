import { ConfigurationProps } from "@vivid/builder";
import { useI18n } from "@vivid/i18n";
import { ShortcutsToolbar } from "@vivid/page-builder-base";
import { LinkProps } from "./schema";
import { linkShortcuts } from "./shortcuts";

export const LinkToolbar = (props: ConfigurationProps<LinkProps>) => {
  const t = useI18n("builder");

  return (
    <>
      <ShortcutsToolbar
        shortcuts={linkShortcuts}
        data={props.data}
        setData={props.setData}
      />
    </>
  );
};

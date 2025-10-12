"use client";

import { ConfigurationProps, PageInput } from "@vivid/builder";
import { useI18n } from "@vivid/i18n";
import { StylesConfigurationPanel } from "@vivid/page-builder-base";
import { deepMemo } from "@vivid/ui";
import { useCallback } from "react";
import { BookingProps } from "./schema";
import { bookingShortcuts } from "./shortcuts";
import { styles } from "./styles";

export const BookingConfiguration = deepMemo(
  ({ data, setData, base, onBaseChange }: ConfigurationProps<BookingProps>) => {
    const updateProps = useCallback(
      (p: unknown) => setData({ ...data, props: p as BookingProps["props"] }),
      [setData, data],
    );
    const t = useI18n("builder");
    const updateStyle = useCallback(
      (s: unknown) => setData({ ...data, style: s as BookingProps["style"] }),
      [setData, data],
    );

    return (
      <StylesConfigurationPanel
        styles={data.style ?? {}}
        onStylesChange={updateStyle}
        availableStyles={styles}
        shortcuts={bookingShortcuts}
        base={base}
        onBaseChange={onBaseChange}
      >
        <PageInput
          label={t("pageBuilder.blocks.booking.confirmationPage")}
          defaultValue={data.props.confirmationPage ?? null}
          nullable
          onChange={(value) =>
            updateProps({ ...data.props, confirmationPage: value })
          }
        />
      </StylesConfigurationPanel>
    );
  },
);

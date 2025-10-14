"use client";

import { ConfigurationProps, PageInput } from "@vivid/builder";
import { useI18n } from "@vivid/i18n";
import { StylesConfigurationPanel } from "@vivid/page-builder-base";
import { deepMemo } from "@vivid/ui";
import { useCallback } from "react";
import { BookingWithWaitlistProps } from "./schema";
import { bookingWithWaitlistShortcuts } from "./shortcuts";
import { styles } from "./styles";

export const BookingWithWaitlistConfiguration = deepMemo(
  ({
    data,
    setData,
    base,
    onBaseChange,
  }: ConfigurationProps<BookingWithWaitlistProps>) => {
    const updateProps = useCallback(
      (p: unknown) =>
        setData({ ...data, props: p as BookingWithWaitlistProps["props"] }),
      [setData, data],
    );
    const t = useI18n("builder");
    const updateStyle = useCallback(
      (s: unknown) =>
        setData({ ...data, style: s as BookingWithWaitlistProps["style"] }),
      [setData, data],
    );

    return (
      <StylesConfigurationPanel
        styles={data.style ?? {}}
        onStylesChange={updateStyle}
        availableStyles={styles}
        shortcuts={bookingWithWaitlistShortcuts}
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

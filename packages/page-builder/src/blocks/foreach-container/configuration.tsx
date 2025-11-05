"use client";

import { ConfigurationProps, TextInput } from "@timelish/builder";
import { useI18n } from "@timelish/i18n";
import { deepMemo } from "@timelish/ui";
import { useCallback } from "react";
import { ForeachContainerProps } from "./schema";

export const ForeachContainerConfiguration = deepMemo(
  ({ data, setData }: ConfigurationProps<ForeachContainerProps>) => {
    const updateProps = useCallback(
      (p: unknown) =>
        setData({ ...data, props: p as ForeachContainerProps["props"] }),
      [setData, data],
    );
    const t = useI18n("builder");
    return (
      <>
        <TextInput
          label={t("pageBuilder.blocks.foreachContainer.value")}
          defaultValue={data.props?.value ?? ""}
          onChange={(value) => updateProps({ ...data.props, value })}
        />
      </>
    );
  },
);

"use client";

import { ConfigurationProps, TextInput } from "@timelish/builder";
import { useI18n } from "@timelish/i18n";
import { ForeachContainerProps } from "./schema";

export const ForeachContainerConfiguration = ({
  data,
  setData,
}: ConfigurationProps<ForeachContainerProps>) => {
  const t = useI18n("builder");
  const updateData = (d: unknown) => setData(d as ForeachContainerProps);

  return (
    <>
      <TextInput
        label={t("emailBuilder.blocks.foreachContainer.value")}
        defaultValue={data.props?.value ?? ""}
        onChange={(value) =>
          updateData({ ...data, props: { ...data.props, value } })
        }
      />
    </>
  );
};

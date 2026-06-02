"use client";

import { ConfigurationProps } from "@timelish/builder";
import { StylesConfigurationPanel } from "@timelish/page-builder-base";
import { deepMemo } from "@timelish/ui";
import { useCallback } from "react";
import { containerShortcuts } from "../shortcuts";
import { BlogCommentContainerProps, styles } from "./schema";

export const BlogCommentContainerConfiguration = deepMemo(
  ({
    data,
    setData,
    base,
    onBaseChange,
  }: ConfigurationProps<BlogCommentContainerProps>) => {
    const updateStyle = useCallback(
      (s: unknown) =>
        setData({ ...data, style: s as BlogCommentContainerProps["style"] }),
      [setData, data],
    );

    return (
      <StylesConfigurationPanel
        styles={data.style ?? {}}
        onStylesChange={updateStyle}
        availableStyles={styles}
        shortcuts={containerShortcuts}
        base={base}
        onBaseChange={onBaseChange}
      />
    );
  },
);

"use client";

import { ConfigurationProps } from "@timelish/builder";
import { StylesConfigurationPanel } from "@timelish/page-builder-base";
import { deepMemo } from "@timelish/ui";
import { useCallback } from "react";
import { BlogPostsListProps } from "./schema";
import { styles } from "./styles";

export const BlogPostsListConfiguration = deepMemo(
  ({
    data,
    setData,
    base,
    onBaseChange,
  }: ConfigurationProps<BlogPostsListProps>) => {
    const updateStyle = useCallback(
      (s: unknown) =>
        setData({ ...data, style: s as BlogPostsListProps["style"] }),
      [setData, data],
    );

    return (
      <StylesConfigurationPanel
        styles={data.style ?? {}}
        onStylesChange={updateStyle}
        availableStyles={styles}
        base={base}
        onBaseChange={onBaseChange}
      />
    );
  },
);

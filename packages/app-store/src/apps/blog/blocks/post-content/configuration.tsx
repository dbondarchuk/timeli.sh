"use client";

import { BooleanInput, ConfigurationProps } from "@timelish/builder";
import { StylesConfigurationPanel } from "@timelish/page-builder-base";
import { deepMemo } from "@timelish/ui";
import { useCallback } from "react";
import {
  BlogPostContentProps,
  BlogPostContentPropsDefaults,
  styles,
} from "./schema";

export const BlogPostContentConfiguration = deepMemo(
  ({
    data,
    setData,
    base,
    onBaseChange,
  }: ConfigurationProps<BlogPostContentProps>) => {
    const updateStyle = useCallback(
      (s: unknown) =>
        setData({ ...data, style: s as BlogPostContentProps["style"] }),
      [setData, data],
    );

    const updateProps = useCallback(
      (p: unknown) =>
        setData({ ...data, props: p as BlogPostContentProps["props"] }),
      [setData, data],
    );

    const showShort =
      data.props?.showShort ?? BlogPostContentPropsDefaults.props.showShort;

    return (
      <StylesConfigurationPanel
        styles={data.style ?? {}}
        onStylesChange={updateStyle}
        availableStyles={styles}
        base={base}
        onBaseChange={onBaseChange}
      >
        <BooleanInput
          label="Show Short Content"
          defaultValue={showShort}
          onChange={(value) => updateProps({ ...data.props, showShort: value })}
        />
      </StylesConfigurationPanel>
    );
  },
);

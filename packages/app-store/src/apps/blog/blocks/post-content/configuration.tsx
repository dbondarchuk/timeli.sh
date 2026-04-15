"use client";

import { BooleanInput, ConfigurationProps } from "@timelish/builder";
import { useI18n } from "@timelish/i18n";
import { StylesConfigurationPanel } from "@timelish/page-builder-base";
import { deepMemo } from "@timelish/ui";
import { useCallback } from "react";
import {
  BlogAdminKeys,
  BlogAdminNamespace,
  blogAdminNamespace,
} from "../../translations/types";
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
    const t = useI18n<BlogAdminNamespace, BlogAdminKeys>(blogAdminNamespace);
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
          label={t("block.postContent.showShort.label")}
          defaultValue={showShort}
          onChange={(value) => updateProps({ ...data.props, showShort: value })}
        />
      </StylesConfigurationPanel>
    );
  },
);

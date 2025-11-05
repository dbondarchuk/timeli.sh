"use client";

import { ConfigurationProps } from "@timelish/builder";
import { useI18n } from "@timelish/i18n";
import { deepMemo, Label, Textarea } from "@timelish/ui";
import { useCallback } from "react";
import { CustomHTMLProps } from "./schema";

export const CustomHTMLConfiguration = deepMemo(
  ({ data, setData }: ConfigurationProps<CustomHTMLProps>) => {
    const t = useI18n("builder");
    const updateProps = useCallback(
      (p: unknown) =>
        setData({ ...data, props: p as CustomHTMLProps["props"] }),
      [setData, data],
    );

    return (
      <>
        <div className="flex flex-col gap-2">
          <Label htmlFor="html">
            {t("emailBuilder.blocks.customHtml.html")}
          </Label>
          <Textarea
            id="html"
            value={data.props?.html ?? ""}
            className="w-full text-xs"
            onChange={(e) =>
              updateProps({ ...data.props, html: e.target.value })
            }
          />
        </div>
      </>
    );
  },
);

import { useI18n } from "@vivid/i18n";
import {
  Link,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vivid/ui";
import { CodeSquare } from "lucide-react";
import React from "react";

export type SupportsMarkdownTooltipProps = {
  supportsMdx?: boolean;
};

export const SupportsMarkdownTooltip: React.FC<
  SupportsMarkdownTooltipProps
> = ({ supportsMdx }) => {
  const t = useI18n("ui");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="align-top ml-1" type="button">
          <CodeSquare className="w-3 h-3" />
        </TooltipTrigger>
        <TooltipContent className="pt-2">
          <p>
            {t("markdownTooltip.supports", {
              type: supportsMdx ? "MDX" : "Markdown",
            })}
          </p>
          <p>
            <Link
              variant="dashed"
              target="_blank"
              href={
                supportsMdx
                  ? "https://mdxjs.com/docs/what-is-mdx/"
                  : "https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
              }
            >
              {t("markdownTooltip.learnMore")}
            </Link>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

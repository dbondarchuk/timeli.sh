import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { cn } from "../utils/cn";

export type MarkdownProps = {
  markdown: string;
  className?: string;
  prose?: "prose" | "none" | "simple";
};

export const Markdown: React.FC<MarkdownProps> = ({
  markdown,
  className,
  prose = "prose",
}) => {
  return (
    <div
      className={cn(
        "text-foreground text-[var(--value-foreground-color)]",
        prose === "prose" &&
          "[&_p]:py-4 [&_li]:li[st-inside [&_li]:pl-8 [&_ul_li]:list-disc prose prose-slate",
        prose === "simple" && "[&_p]:my-2 prose prose-slate",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkBreaks]}>{markdown}</ReactMarkdown>
    </div>
  );
};

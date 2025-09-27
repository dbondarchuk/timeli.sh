"use client";

import { useI18n } from "@vivid/i18n";
import { forwardRef } from "react";

export const EditorRedirect = forwardRef<
  HTMLDivElement,
  { url: string; onClick?: (e: React.MouseEvent<HTMLDivElement>) => void }
>(({ url, onClick }, ref) => {
  const t = useI18n("builder");

  return (
    <div
      ref={ref}
      onClick={onClick}
      className="w-full italic text-muted-foreground"
    >
      {t("pageBuilder.blocks.redirect.editorRedirectText", { url })}
    </div>
  );
});

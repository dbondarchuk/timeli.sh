import { ScrollArea } from "@vivid/ui";
import React from "react";

export default function PageContainer({
  children,
  scrollable = false,
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  return (
    <>
      {scrollable ? (
        <ScrollArea className="h-[calc(100dvh-52px)] w-full [&>div>div[style]]:!block [&>div>div[style]]:h-full">
          <div className="flex flex-1 p-4 md:px-6 h-full">{children}</div>
          {/* <ScrollBar orientation="horizontal" /> */}
        </ScrollArea>
      ) : (
        <div className="flex flex-1 p-4 md:px-6">{children}</div>
      )}
    </>
  );
}

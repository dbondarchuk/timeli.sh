"use client";

import { ComplexAppPageProps } from "@timelish/types";
import { DesignsTable } from "../table/table";
import { DesignsTableAction } from "../table/table-action";

export function DesignsMainPage({ appId }: ComplexAppPageProps) {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <DesignsTableAction appId={appId} />
      <DesignsTable appId={appId} />
    </div>
  );
}

"use client";

import { ComplexAppPageProps } from "@timelish/types";
import { FormsTable } from "../table/table";
import { FormsTableAction } from "../table/table-action";

export function FormsMainPage({ appId }: ComplexAppPageProps) {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <FormsTableAction appId={appId} />
      <FormsTable appId={appId} />
    </div>
  );
}

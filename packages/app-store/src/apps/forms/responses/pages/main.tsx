"use client";

import { ComplexAppPageProps } from "@timelish/types";
import { ResponsesTable } from "../table/table";
import { ResponsesTableAction } from "../table/table-action";

export function FormsResponsesPage({ appId }: ComplexAppPageProps) {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <ResponsesTableAction appId={appId} />
      <ResponsesTable appId={appId} />
    </div>
  );
}

"use client";

import { FormsTable } from "../table/table";
import { FormsTableAction } from "../table/table-action";

export function FormsMainPage({ appId }: { appId: string }) {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <FormsTableAction appId={appId} />
      <FormsTable appId={appId} />
    </div>
  );
}

"use client";

import { RemindersTable } from "./table/table";
import { RemindersTableAction } from "./table/table-action";

export const RemindersPage: React.FC<{ appId: string }> = ({ appId }) => {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <RemindersTableAction appId={appId} />
      <RemindersTable appId={appId} />
    </div>
  );
};

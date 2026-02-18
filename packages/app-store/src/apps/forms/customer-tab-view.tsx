import React from "react";
import { ResponsesTable } from "./responses/table/table";
import { ResponsesTableAction } from "./responses/table/table-action";

export const FormsCustomerTab: React.FC<{
  appId: string;
  customerId: string;
  props: unknown;
  searchParams: { [key: string]: string | string[] | undefined };
}> = ({ appId, customerId }) => {
  const returnUrl = `/dashboard/customers/${customerId}/forms`;

  return (
    <div className="flex flex-col flex-1 gap-8">
      <ResponsesTableAction
        appId={appId}
        customerIdLock={customerId}
        returnUrl={returnUrl}
      />
      <ResponsesTable appId={appId} customerIdLock={customerId} />
    </div>
  );
};

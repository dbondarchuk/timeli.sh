"use client";
import { ComplexAppPageProps } from "@vivid/types";
import { FollowUpsTable } from "./table/table";
import { FollowUpsTableAction } from "./table/table-action";

export const FollowUpsPage: React.FC<ComplexAppPageProps> = ({ appId }) => {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <FollowUpsTableAction appId={appId} />
      <FollowUpsTable appId={appId} />
    </div>
  );
};

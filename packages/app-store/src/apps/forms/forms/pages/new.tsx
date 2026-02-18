"use client";

import { FormEditForm } from "../components/form";

export const FormsNewPage = ({ appId }: { appId: string }) => {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <FormEditForm appId={appId} />
    </div>
  );
};

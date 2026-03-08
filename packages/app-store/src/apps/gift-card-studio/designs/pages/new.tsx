"use client";

import { DesignForm } from "../components/design-form";

export const DesignNewPage = ({ appId }: { appId: string }) => {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <DesignForm appId={appId} />
    </div>
  );
};

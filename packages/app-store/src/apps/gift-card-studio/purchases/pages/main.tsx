"use client";

import { ComplexAppPageProps } from "@timelish/types";
import { useReload } from "@timelish/ui-admin";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ManualPurchaseDialog } from "../components/manual-purchase-form";
import { PurchasesTable } from "../table/table";
import { PurchasesTableAction } from "../table/table-action";

export function PurchasesMainPage({ appId }: ComplexAppPageProps) {
  const searchParams = useSearchParams();
  const [manualPurchaseOpen, setManualPurchaseOpen] = useState(false);

  const { reload } = useReload();

  useEffect(() => {
    if (searchParams.get("openManual") === "1") {
      setManualPurchaseOpen(true);
    }
  }, [searchParams]);

  const handleManualPurchaseSuccess = useCallback(() => {
    reload();
  }, []);

  return (
    <div className="flex flex-col flex-1 gap-8">
      <PurchasesTableAction
        appId={appId}
        onOpenManualPurchase={() => setManualPurchaseOpen(true)}
      />
      <PurchasesTable appId={appId} />
      <ManualPurchaseDialog
        appId={appId}
        open={manualPurchaseOpen}
        onOpenChange={setManualPurchaseOpen}
        onSuccess={handleManualPurchaseSuccess}
      />
    </div>
  );
}

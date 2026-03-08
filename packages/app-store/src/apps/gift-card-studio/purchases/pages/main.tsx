"use client";

import { ComplexAppPageProps } from "@timelish/types";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { ManualPurchaseDialog } from "../components/manual-purchase-form";
import { PurchasesTable } from "../table/table";
import { PurchasesTableAction } from "../table/table-action";

export function PurchasesMainPage({ appId }: ComplexAppPageProps) {
  const searchParams = useSearchParams();
  const [manualPurchaseOpen, setManualPurchaseOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (searchParams.get("openManual") === "1") {
      setManualPurchaseOpen(true);
    }
  }, [searchParams]);

  const handleManualPurchaseSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="flex flex-col flex-1 gap-8">
      <PurchasesTableAction
        appId={appId}
        onOpenManualPurchase={() => setManualPurchaseOpen(true)}
      />
      <PurchasesTable appId={appId} refreshKey={refreshKey} />
      <ManualPurchaseDialog
        appId={appId}
        open={manualPurchaseOpen}
        onOpenChange={setManualPurchaseOpen}
        onSuccess={handleManualPurchaseSuccess}
      />
    </div>
  );
}

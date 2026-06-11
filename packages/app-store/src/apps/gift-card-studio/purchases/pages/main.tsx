"use client";

import { dispatchDashboardBadge, useReload } from "@timelish/ui-admin";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { markGiftCardStudioPurchasesRead } from "../../actions";
import { GIFT_CARD_STUDIO_UNREAD_PURCHASES_BADGE_KEY } from "../../const";
import { ManualPurchaseDialog } from "../components/manual-purchase-form";
import { PurchasesTable } from "../table/table";
import { PurchasesTableAction } from "../table/table-action";

export function PurchasesMainPage({ appId }: { appId: string }) {
  const searchParams = useSearchParams();
  const [manualPurchaseOpen, setManualPurchaseOpen] = useState(false);

  const { reload } = useReload();

  useEffect(() => {
    void markGiftCardStudioPurchasesRead(appId).then(() => {
      dispatchDashboardBadge({
        key: GIFT_CARD_STUDIO_UNREAD_PURCHASES_BADGE_KEY,
        count: 0,
      });
    });
  }, [appId]);

  useEffect(() => {
    if (searchParams.get("openManual") === "1") {
      setManualPurchaseOpen(true);
    }
  }, [searchParams]);

  const handleManualPurchaseSuccess = useCallback(() => {
    reload();
  }, [reload]);

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

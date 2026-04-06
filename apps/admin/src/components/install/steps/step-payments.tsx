"use client";

import { AddOrUpdateAppButton } from "@/components/admin/apps/add-or-update-app-dialog";
import { DeleteAppButton } from "@/components/admin/apps/delete-app-button";
import { saveInstallPreferences } from "@/components/install/actions";
import { useInstallWizard } from "@/components/install/install-wizard-context";
import { PAYPAL_APP_NAME } from "@timelish/app-store";
import { useI18n } from "@timelish/i18n";
import type { ConnectedApp } from "@timelish/types";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  Label,
  Slider,
  Switch,
  toast,
} from "@timelish/ui";
import { ConnectedAppNameAndLogo } from "@timelish/ui-admin";
import { Unplug } from "lucide-react";
import { useMemo } from "react";

function pickPaypalApp(apps: ConnectedApp[]): ConnectedApp | undefined {
  const matches = apps.filter((a) => a.name === PAYPAL_APP_NAME);
  if (!matches.length) return undefined;
  return (
    matches.find((a) => a.status === "connected") ??
    matches.find((a) => a.status === "pending") ??
    matches[0]
  );
}

export function StepPayments() {
  const t = useI18n("install");
  const tApps = useI18n("apps");
  const { p, setP, setStep, paymentApps } = useInstallWizard();
  const paypalApp = useMemo(() => pickPaypalApp(paymentApps), [paymentApps]);
  const paypalConnected = paypalApp?.status === "connected";
  const canContinue = !p.acceptPayments || paypalConnected;

  const onContinue = async () => {
    if (!canContinue) {
      toast.error(t("wizard.payments.paymentAppRequired"));
      return;
    }
    const r = await saveInstallPreferences({
      inviteMode: p.inviteMode,
      inviteCalendarWriterAppId: p.inviteCalendarWriterAppId,
      optCustomerEmailNotifications: p.optCustomerEmailNotifications,
      optCustomerTextMessageNotifications:
        p.optCustomerTextMessageNotifications,
      optAppointmentNotifications: p.optAppointmentNotifications,
      optWaitlist: p.optWaitlist,
      optWaitlistNotifications: p.optWaitlistNotifications,
      optBlog: p.optBlog,
      optForms: p.optForms,
      optGiftCardStudio: p.optGiftCardStudio,
      allowCancelReschedule: p.allowCancelReschedule,
      acceptPayments: p.acceptPayments,
      depositEnabled: p.depositEnabled,
      depositPercent: p.depositPercent,
    });
    if (!r.ok) {
      toast.error(t("wizard.integrations.saveError"));
      return;
    }
    setStep(6);
    setP((prev) => ({ ...prev, step: 6 }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t("wizard.payments.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("wizard.payments.subtitle")}
        </p>
      </div>
      <label className="flex cursor-pointer items-center justify-between rounded-lg border p-4">
        <div>
          <span className="font-medium">
            {t("wizard.payments.acceptPayments")}
          </span>
          <p className="text-xs text-muted-foreground">
            {t("wizard.payments.acceptPaymentsHint")}
          </p>
        </div>
        <Switch
          checked={p.acceptPayments}
          onCheckedChange={(c) =>
            setP((prev) => ({ ...prev, acceptPayments: Boolean(c) }))
          }
        />
      </label>
      {p.acceptPayments ? (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <ConnectedAppNameAndLogo
                appName={PAYPAL_APP_NAME}
                nameClassName="text-base font-semibold"
                logoClassName="size-9 shrink-0"
              />
              <CardDescription>
                {t("wizard.payments.paypalDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm">
                  {paypalConnected
                    ? t("wizard.integrations.connected")
                    : t("wizard.integrations.notConnected")}
                </span>
                {paypalApp ? (
                  <div className="flex items-center gap-2">
                    <AddOrUpdateAppButton app={paypalApp} refreshOnClose>
                      <Button size="sm" variant="secondary">
                        {tApps("common.updateApp")}
                      </Button>
                    </AddOrUpdateAppButton>
                    {(paypalApp.status === "connected" ||
                      paypalApp.status === "pending") && (
                      <DeleteAppButton appId={paypalApp._id}>
                        <Button size="sm" variant="outline-destructive">
                          <Unplug />
                          {tApps("common.disconnect")}
                        </Button>
                      </DeleteAppButton>
                    )}
                  </div>
                ) : (
                  <AddOrUpdateAppButton
                    appType={PAYPAL_APP_NAME}
                    refreshOnClose
                  >
                    <Button size="sm">
                      {t("wizard.integrations.connect")}
                    </Button>
                  </AddOrUpdateAppButton>
                )}
              </div>
            </CardContent>
          </Card>
          <div>
            <label className="flex cursor-pointer items-center justify-between rounded-lg border p-4">
              <span className="font-medium">
                {t("wizard.payments.deposit")}
              </span>
              <Switch
                checked={p.depositEnabled}
                onCheckedChange={(c) =>
                  setP((prev) => ({
                    ...prev,
                    depositEnabled: Boolean(c),
                  }))
                }
              />
            </label>
            {p.depositEnabled ? (
              <div className="mt-3 space-y-2">
                <Label>
                  {t("wizard.payments.depositPercent")} {p.depositPercent}%
                </Label>
                <Slider
                  min={10}
                  max={100}
                  step={1}
                  value={[Number.parseInt(p.depositPercent || "25", 10) || 25]}
                  onValueChange={(v) =>
                    setP((prev) => ({
                      ...prev,
                      depositPercent: String(v[0] ?? 25),
                    }))
                  }
                ></Slider>
                <p className="text-xs text-muted-foreground">
                  {t("wizard.payments.depositHelp")}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <label className="flex cursor-pointer items-center justify-between rounded-lg border p-4">
        <div>
          <span className="font-medium">
            {t("wizard.payments.cancelPolicy")}
          </span>
          <p className="text-xs text-muted-foreground">
            {t("wizard.payments.cancelHelp")}
          </p>
        </div>
        <Switch
          checked={p.allowCancelReschedule}
          onCheckedChange={(c) =>
            setP((prev) => ({
              ...prev,
              allowCancelReschedule: Boolean(c),
            }))
          }
        />
      </label>
      <p className="text-xs text-muted-foreground">
        {t("wizard.payments.flex")}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setStep(4);
            setP((prev) => ({ ...prev, step: 4 }));
          }}
        >
          {t("wizard.common.back")}
        </Button>
        <Button onClick={onContinue} disabled={!canContinue}>
          {t("wizard.common.finish")}
        </Button>
      </div>
    </div>
  );
}

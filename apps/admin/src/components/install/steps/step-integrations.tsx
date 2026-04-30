"use client";

import { AddOrUpdateAppButton } from "@/components/admin/apps/add-or-update-app-dialog";
import { DeleteAppButton } from "@/components/admin/apps/delete-app-button";
import { saveInstallPreferences } from "@/components/install/actions";
import { useInstallWizard } from "@/components/install/install-wizard-context";
import {
  AvailableApps,
  CALDAV_APP_NAME,
  GOOGLE_CALENDAR_APP_NAME,
  ICS_APP_NAME,
  OUTLOOK_APP_NAME,
} from "@timelish/app-store";
import { useI18n } from "@timelish/i18n";
import type { ConnectedApp } from "@timelish/types";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  toast,
} from "@timelish/ui";
import { ConnectedAppNameAndLogo } from "@timelish/ui-admin";
import { Unplug } from "lucide-react";
import { useMemo } from "react";

function pickCalendarAppRow(
  apps: ConnectedApp[],
  appName: string,
): ConnectedApp | undefined {
  const matches = apps.filter((a) => a.name === appName);
  if (!matches.length) return undefined;
  return (
    matches.find((a) => a.status === "connected") ??
    matches.find((a) => a.status === "pending") ??
    matches[0]
  );
}

type CalendarCardProps = {
  appName: string;
  description: string;
  hint: string;
  connected: ConnectedApp | undefined;
};

function CalendarIntegrationCard({
  appName,
  description,
  hint,
  connected,
}: CalendarCardProps) {
  const t = useI18n("install");
  const tApps = useI18n("apps");
  const meta = AvailableApps[appName];
  const blockNewConnect = Boolean(
    meta && "dontAllowMultiple" in meta && meta.dontAllowMultiple && connected,
  );

  const statusLabel = connected
    ? tApps(`status.${connected.status}`)
    : t("wizard.integrations.notConnected");

  const statusClass =
    connected?.status === "connected"
      ? "bg-green-500"
      : connected?.status === "pending"
        ? "bg-amber-500"
        : connected
          ? "bg-destructive"
          : "bg-muted-foreground/40";

  return (
    <Card>
      <CardHeader className="space-y-2">
        <ConnectedAppNameAndLogo
          appName={appName}
          nameClassName="text-base font-semibold"
          logoClassName="size-9 shrink-0"
        />
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{hint}</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`size-2 shrink-0 rounded-full ${statusClass}`}
              aria-hidden
            />
            <span>{statusLabel}</span>
          </div>
          {connected ? (
            <div className="flex items-center gap-2">
              <AddOrUpdateAppButton
                app={connected}
                refreshOnClose
                dontAskToSetDefault
              >
                <Button size="sm" variant="secondary">
                  {tApps("common.updateApp")}
                </Button>
              </AddOrUpdateAppButton>
              {connected.status === "connected" ||
              connected.status === "pending" ? (
                <DeleteAppButton appId={connected._id}>
                  <Button size="sm" variant="outline-destructive">
                    <Unplug />
                    {tApps("common.disconnect.label")}
                  </Button>
                </DeleteAppButton>
              ) : null}
            </div>
          ) : (
            <AddOrUpdateAppButton
              appType={appName}
              refreshOnClose
              dontAskToSetDefault
            >
              <Button size="sm" variant="default" disabled={blockNewConnect}>
                {t("wizard.integrations.connect")}
              </Button>
            </AddOrUpdateAppButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function StepIntegrations() {
  const t = useI18n("install");
  const { p, setP, setStep, calendarApps } = useInstallWizard();

  const googleApp = useMemo(
    () => pickCalendarAppRow(calendarApps, GOOGLE_CALENDAR_APP_NAME),
    [calendarApps],
  );
  const icsApp = useMemo(
    () => pickCalendarAppRow(calendarApps, ICS_APP_NAME),
    [calendarApps],
  );
  const outlookApp = useMemo(
    () => pickCalendarAppRow(calendarApps, OUTLOOK_APP_NAME),
    [calendarApps],
  );
  const caldavApp = useMemo(
    () => pickCalendarAppRow(calendarApps, CALDAV_APP_NAME),
    [calendarApps],
  );
  const writableCalendarApps = useMemo(
    () =>
      calendarApps.filter(
        (a) =>
          a.status === "connected" &&
          a.name !== ICS_APP_NAME &&
          AvailableApps[a.name]?.scope.includes("calendar-write"),
      ),
    [calendarApps],
  );
  const calendarWriterDisabled = writableCalendarApps.length === 0;

  const onContinue = async () => {
    if (
      p.inviteMode === "calendar_writer" &&
      (!p.inviteCalendarWriterAppId ||
        !writableCalendarApps.find(
          (a) =>
            a._id === p.inviteCalendarWriterAppId && a.status === "connected",
        ))
    ) {
      toast.error(t("wizard.integrations.calendarWriterSelectRequired"));
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
      optMyCabinet: p.optMyCabinet,
      autoConfirmBookings: p.autoConfirmBookings,
      allowCancelReschedule: p.allowCancelReschedule,
      acceptPayments: p.acceptPayments,
      depositEnabled: p.depositEnabled,
      depositPercent: p.depositPercent,
    });
    if (!r.ok) {
      toast.error(t("wizard.integrations.saveError"));
      return;
    }
    setStep(5);
    setP((prev) => ({ ...prev, step: 5 }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          {t("wizard.integrations.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("wizard.integrations.subtitle")}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <CalendarIntegrationCard
          appName={GOOGLE_CALENDAR_APP_NAME}
          description={t("wizard.integrations.googleDesc")}
          hint={t("wizard.integrations.googleLimit")}
          connected={googleApp}
        />
        <CalendarIntegrationCard
          appName={ICS_APP_NAME}
          description={t("wizard.integrations.appleDesc")}
          hint={t("wizard.integrations.appleLimit")}
          connected={icsApp}
        />
        <CalendarIntegrationCard
          appName={OUTLOOK_APP_NAME}
          description={t("wizard.integrations.outlookDesc")}
          hint={t("wizard.integrations.outlookLimit")}
          connected={outlookApp}
        />
        <CalendarIntegrationCard
          appName={CALDAV_APP_NAME}
          description={t("wizard.integrations.caldavDesc")}
          hint={t("wizard.integrations.caldavLimit")}
          connected={caldavApp}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("wizard.integrations.inviteHow")}</Label>
        <Select
          value={p.inviteMode}
          onValueChange={(v: "none" | "email" | "calendar_writer") =>
            setP((prev) => ({
              ...prev,
              inviteMode: v,
              ...(v !== "calendar_writer"
                ? { inviteCalendarWriterAppId: "" }
                : {}),
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              {t("wizard.integrations.inviteNone")}
            </SelectItem>
            <SelectItem value="email">
              {t("wizard.integrations.inviteEmail")}
            </SelectItem>
            <SelectItem
              value="calendar_writer"
              disabled={calendarWriterDisabled}
            >
              {t("wizard.integrations.inviteCalendarWriter")}
            </SelectItem>
          </SelectContent>
        </Select>
        {calendarWriterDisabled ? (
          <p className="text-xs text-muted-foreground">
            {t("wizard.integrations.calendarWriterDisabled")}
          </p>
        ) : null}
        {p.inviteMode === "calendar_writer" ? (
          <div className="space-y-2">
            <Label>{t("wizard.integrations.calendarWriterTarget")}</Label>
            <Select
              value={p.inviteCalendarWriterAppId}
              onValueChange={(v) =>
                setP((prev) => ({ ...prev, inviteCalendarWriterAppId: v }))
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("wizard.integrations.calendarWriterPickApp")}
                />
              </SelectTrigger>
              <SelectContent>
                {writableCalendarApps
                  .filter((a) => a.status === "connected")
                  .map((app) => (
                    <SelectItem key={app._id} value={app._id}>
                      <ConnectedAppNameAndLogo
                        appName={app.name}
                        logoClassName="size-3.5"
                        nameClassName="text-xs leading-[normal]"
                      />
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
      <div className="space-y-3">
        <Label>{t("wizard.integrations.optionalApps")}</Label>
        {[
          {
            key: "optCustomerEmailNotifications" as const,
            label: t("wizard.integrations.customerEmailNotifications"),
            desc: t("wizard.integrations.customerEmailNotificationsDesc"),
          },
          {
            key: "optCustomerTextMessageNotifications" as const,
            label: t("wizard.integrations.customerTextNotifications"),
            desc: t("wizard.integrations.customerTextNotificationsDesc"),
          },
          {
            key: "optAppointmentNotifications" as const,
            label: t("wizard.integrations.appointmentNotifications"),
            desc: t("wizard.integrations.appointmentNotificationsDesc"),
          },
          {
            key: "optWaitlist" as const,
            label: t("wizard.integrations.waitlist"),
            desc: t("wizard.integrations.waitlistDesc"),
          },
          {
            key: "optBlog" as const,
            label: t("wizard.integrations.blog"),
            desc: t("wizard.integrations.blogDesc"),
          },
          {
            key: "optForms" as const,
            label: t("wizard.integrations.forms"),
            desc: t("wizard.integrations.formsDesc"),
          },
          {
            key: "optGiftCardStudio" as const,
            label: t("wizard.integrations.giftCardStudio"),
            desc: t("wizard.integrations.giftCardStudioDesc"),
          },
          {
            key: "optMyCabinet" as const,
            label: t("wizard.integrations.myCabinet"),
            desc: t("wizard.integrations.myCabinetDesc"),
          },
        ].map((row) => (
          <label
            key={row.key}
            className="flex cursor-pointer items-start gap-3 rounded-lg border p-3"
          >
            <Switch
              checked={p[row.key]}
              onCheckedChange={(c) =>
                setP((prev) => ({ ...prev, [row.key]: Boolean(c) }))
              }
            />
            <span>
              <span className="font-medium">{row.label}</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {row.desc}
              </span>
            </span>
          </label>
        ))}
        {p.optWaitlist ? (
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
            <Switch
              checked={p.optWaitlistNotifications}
              onCheckedChange={(c) =>
                setP((prev) => ({
                  ...prev,
                  optWaitlistNotifications: Boolean(c),
                }))
              }
            />
            <span>
              <span className="font-medium">
                {t("wizard.integrations.waitlistNotifications")}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {t("wizard.integrations.waitlistNotificationsDesc")}
              </span>
            </span>
          </label>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        {t("wizard.integrations.skipHint")}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setStep(3);
            setP((prev) => ({ ...prev, step: 3 }));
          }}
        >
          {t("wizard.common.back")}
        </Button>
        <Button onClick={() => void onContinue()}>
          {t("wizard.common.continue")}
        </Button>
      </div>
    </div>
  );
}

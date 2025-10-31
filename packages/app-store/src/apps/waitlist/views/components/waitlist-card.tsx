"use client";

import { useI18n, useLocale } from "@vivid/i18n";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  cn,
  Heading,
  Link,
  Spinner,
  toastPromise,
  useTimeZone,
} from "@vivid/ui";
import { durationToTime } from "@vivid/utils";
import { Calendar, CalendarCheck, Clock, Grid2X2Plus, X } from "lucide-react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { WaitlistEntry } from "../../models";
import {
  WaitlistAdminKeys,
  waitlistAdminNamespace,
  WaitlistAdminNamespace,
} from "../../translations/types";
import { dismissWaitlistEntry } from "./actions";
import { WaitlistDate } from "./waitlist-date";

export type WaitlistCardProps = {
  entry: WaitlistEntry;
  appId: string;
};

export const WaitlistCardContent: React.FC<{ entry: WaitlistEntry }> = ({
  entry,
}) => {
  const t = useI18n<WaitlistAdminNamespace, WaitlistAdminKeys>(
    waitlistAdminNamespace,
  );

  const tAdmin = useI18n("admin");

  const locale = useLocale();
  const timeZone = useTimeZone();

  return (
    <>
      <dl className="divide-y flex-1">
        <div
          className={cn(
            "py-1 flex gap-2 @sm:py-2 @sm:gap-4",
            entry.asSoonAsPossible
              ? "flex-row flex-wrap @sm:grid @sm:grid-cols-3"
              : "flex-col",
          )}
        >
          <dt
            className={cn(
              "flex items-center gap-1",
              entry.asSoonAsPossible && "self-center",
            )}
          >
            <Calendar className="size-4" /> {t("view.dateTimeTitle")}
          </dt>
          <dd
            className={cn(
              "flex flex-wrap gap-1",
              entry.asSoonAsPossible ? "col-span-2" : "w-full",
            )}
          >
            <WaitlistDate entry={entry} />
          </dd>
        </div>
        {!!entry.duration && (
          <div className="py-1 flex flex-row gap-2 flex-wrap @sm:py-2 @sm:grid @sm:grid-cols-3 @sm:gap-4">
            <dt className="flex self-center items-center gap-1">
              <Clock className="size-4" /> {t("view.duration")}
            </dt>
            <dd className="col-span-2">
              {tAdmin("common.timeDuration", durationToTime(entry.duration))}
            </dd>
          </div>
        )}
        {entry.addons && entry.addons.length > 0 && (
          <div className="py-1 flex flex-row gap-2 flex-wrap @sm:py-2 @sm:grid @sm:grid-cols-3 @sm:gap-4">
            <dt className="flex self-center items-center gap-1">
              <Grid2X2Plus className="h-4 w-4" />
              {t("view.addons")}
            </dt>
            <dd className="col-span-2 flex flex-wrap gap-1">
              {entry.addons.map((addon) => (
                <Badge key={addon._id} variant="secondary" className="text-xs">
                  {addon?.name ?? t("view.unknown")}
                </Badge>
              ))}
            </dd>
          </div>
        )}
      </dl>

      {/* Metadata */}
      <div className="pt-2 border-t text-xs text-muted-foreground">
        {t("view.submitted", {
          date: DateTime.fromJSDate(entry.createdAt, {
            zone: timeZone,
          })
            .setLocale(locale)
            .toLocaleString(DateTime.DATETIME_FULL),
        })}
      </div>
    </>
  );
};

export const WaitlistCard: React.FC<WaitlistCardProps> = ({ entry, appId }) => {
  const t = useI18n<WaitlistAdminNamespace, WaitlistAdminKeys>(
    waitlistAdminNamespace,
  );

  const tAdmin = useI18n("admin");

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const onDismiss = async () => {
    setLoading(true);
    try {
      await toastPromise(dismissWaitlistEntry(appId, entry._id), {
        success: t("view.toast.dismissed"),
        error: tAdmin("common.toasts.error"),
      });

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Heading
            title={entry.option?.name ?? t("view.unknown")}
            description={tAdmin.rich("appointments.card.by", {
              name: entry.customer?.name ?? entry.name,
              link: (chunks: any) => (
                <Link
                  href={`/dashboard/customers/${entry.customerId}`}
                  variant="underline"
                >
                  {chunks}
                </Link>
              ),
            })}
          />
        </CardTitle>
      </CardHeader>

      <CardContent className="text-sm flex flex-1 flex-col w-full @container [contain:layout]">
        <WaitlistCardContent entry={entry} />
      </CardContent>

      <CardFooter className="gap-2 justify-end">
        <Button onClick={onDismiss} variant="destructive" disabled={loading}>
          {loading ? <Spinner /> : <X />}
          {t("view.dismiss")}
        </Button>
        <Link
          href={`/dashboard/waitlist/appointment/new?id=${entry._id}`}
          button
          variant="primary"
        >
          <CalendarCheck />
          {t("view.createAppointment")}
        </Link>
      </CardFooter>
    </Card>
  );
};

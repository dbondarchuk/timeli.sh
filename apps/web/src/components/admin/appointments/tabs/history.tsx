"use client";

import { useI18n, useLocale } from "@vivid/i18n";
import { AppointmentHistoryEntry, WithTotal } from "@vivid/types";
import { useInView } from "react-intersection-observer";

import { AvailableApps } from "@vivid/app-store";
import {
  Badge,
  cn,
  Skeleton,
  toast,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useTimeZone,
} from "@vivid/ui";
import { formatAmountString } from "@vivid/utils";
import {
  Banknote,
  BanknoteX,
  CalendarCheck,
  CalendarCog,
  CalendarPlus2,
  CalendarX,
  HistoryIcon,
} from "lucide-react";
import { DateTime } from "luxon";
import React from "react";

const HistoryEntryTypeIcon: React.FC<{
  entry: AppointmentHistoryEntry;
  className?: string;
}> = ({ entry, className }) => {
  switch (entry.type) {
    case "rescheduled":
      return <HistoryIcon className={className} />;
    case "created":
      return <CalendarPlus2 className={className} />;
    case "paymentAdded":
      return <Banknote className={className} />;
    case "paymentRefunded":
      return <BanknoteX className={className} />;
    case "updated":
      return <CalendarCog className={className} />;
    case "statusChanged":
      switch (entry.data.newStatus) {
        case "confirmed":
          return <CalendarCheck className={className} />;
        case "declined":
          return <CalendarX className={className} />;
      }
    default:
      return <HistoryIcon className={className} />;
  }
};

const HistoryEntry: React.FC<{ entry: AppointmentHistoryEntry }> = ({
  entry,
}) => {
  const t = useI18n();
  const dateTime = DateTime.fromISO(entry.dateTime as any as string);
  const locale = useLocale();
  const timeZone = useTimeZone();

  return (
    <div className="flex flex-row w-full bg-card items-start space-x-4 p-4 border rounded-lg">
      <div className="flex-shrink-0 mt-1">
        <HistoryEntryTypeIcon className="size-5" entry={entry} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium">
            {t(`admin.common.labels.appointmentHistoryType.${entry.type}`)}
          </p>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm text-gray-500 underline decoration-dashed cursor-help">
                    {dateTime.setLocale(locale).toRelative()}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left">
                  {dateTime.toLocaleString(DateTime.DATETIME_MED, { locale })}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {/* <div className="inline-flex gap-1 text-sm mt-1 flex-wrap w-full">
          <span className="break-all">{entry.text.substring(0, 200)}...</span>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link-dashed" className="px-0">
                {t("communications.viewMore")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[80%] flex flex-col max-h-[100%]">
              <DialogHeader>
                <DialogTitle className="w-full flex flex-row justify-between items-center mt-2">
                  {t("communications.logContent")}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 w-full overflow-auto">
                {entry.channel === "email" && entry.html ? (
                  <IFrame className="w-full h-[80vh]">
                    <div dangerouslySetInnerHTML={{ __html: entry.html }} />
                  </IFrame>
                ) : (
                  <Markdown markdown={entry.text} className="not-prose" />
                )}
              </div>
              <DialogFooter className="flex-row !justify-between gap-2">
                <DialogClose asChild>
                  <Button variant="secondary">
                    {t("common.buttons.close")}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div> */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {entry.type === "created" && (
            <>
              <Badge
                variant="default"
                className={cn(
                  "text-xs",
                  entry.data.confirmed && "bg-green-500",
                )}
              >
                {t(
                  `admin.appointments.status.${entry.data.confirmed ? "confirmed" : "pending"}`,
                )}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {entry.data.by === "customer"
                  ? t("admin.appointments.history.byCustomer")
                  : t("admin.appointments.history.byUser")}
              </Badge>
              {!!entry.data.payment?.appName && (
                <Badge variant="outline" className="text-xs">
                  {t("admin.appointments.history.payment", {
                    amount: formatAmountString(entry.data.payment.amount),
                    appName: t(
                      `apps.${AvailableApps[entry.data.payment.appName].displayName}`,
                    ),
                  })}
                </Badge>
              )}
            </>
          )}
          {entry.type === "statusChanged" && (
            <>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  entry.data.oldStatus === "confirmed" && "bg-green-500",
                  entry.data.oldStatus === "declined" && "bg-destructive",
                )}
              >
                {t("admin.appointments.history.oldStatus", {
                  oldStatus: t(
                    `admin.appointments.status.${entry.data.oldStatus}`,
                  ),
                })}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  entry.data.newStatus === "confirmed" && "bg-green-500",
                  entry.data.newStatus === "declined" && "bg-destructive",
                )}
              >
                {t("admin.appointments.history.newStatus", {
                  newStatus: t(
                    `admin.appointments.status.${entry.data.newStatus}`,
                  ),
                })}
              </Badge>
            </>
          )}
          {entry.type === "rescheduled" && (
            <>
              <Badge variant="outline" className="text-xs">
                {t("admin.appointments.history.oldDateTime", {
                  oldDateTime: DateTime.fromISO(
                    entry.data.oldDateTime as any as string,
                  )
                    .setZone(timeZone)
                    .toLocaleString(DateTime.DATETIME_MED, { locale }),
                })}
              </Badge>
              <Badge variant="default" className="text-xs">
                {t("admin.appointments.history.newDateTime", {
                  newDateTime: DateTime.fromISO(
                    entry.data.newDateTime as any as string,
                  )
                    .setZone(timeZone)
                    .toLocaleString(DateTime.DATETIME_MED, { locale }),
                })}
              </Badge>
            </>
          )}
          {entry.type === "paymentAdded" && (
            <>
              <Badge variant="default" className="text-xs">
                ${formatAmountString(entry.data.payment.amount)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {entry.data.payment.appName
                  ? t(
                      `apps.${AvailableApps[entry.data.payment.appName].displayName}`,
                    )
                  : entry.data.payment.type === "cash"
                    ? t("admin.payment.methods.cash")
                    : t("admin.payment.methods.card")}
              </Badge>
            </>
          )}
          {entry.type === "paymentRefunded" && (
            <>
              <Badge variant="default" className="text-xs">
                {t("admin.appointments.history.refundedAmount", {
                  amount: formatAmountString(entry.data.refundedAmount),
                })}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {t("admin.appointments.history.totalRefunded", {
                  amount: formatAmountString(entry.data.totalRefunded),
                })}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {entry.data.payment.appName
                  ? t(
                      `apps.${AvailableApps[entry.data.payment.appName].displayName}`,
                    )
                  : entry.data.payment.type === "cash"
                    ? t("admin.payment.methods.cash")
                    : t("admin.payment.methods.card")}
              </Badge>
            </>
          )}
          {entry.type === "updated" && (
            <>
              <Badge variant="outline" className="text-xs">
                {t("admin.appointments.history.oldOption", {
                  oldOption: entry.data.oldOption.name,
                })}
              </Badge>
              <Badge variant="default" className="text-xs">
                {t("admin.appointments.history.newOption", {
                  newOption: entry.data.newOption.name,
                })}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {t("admin.appointments.history.oldDateTime", {
                  oldDateTime: DateTime.fromISO(
                    entry.data.oldDateTime as any as string,
                  )
                    .setZone(timeZone)
                    .toLocaleString(DateTime.DATETIME_MED, { locale }),
                })}
              </Badge>
              <Badge variant="default" className="text-xs">
                {t("admin.appointments.history.newDateTime", {
                  newDateTime: DateTime.fromISO(
                    entry.data.newDateTime as any as string,
                  )
                    .setZone(timeZone)
                    .toLocaleString(DateTime.DATETIME_MED, { locale }),
                })}
              </Badge>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const HistoryEntrySkeleton: React.FC<{ length?: number }> = ({
  length = 3,
}) => {
  return Array.from({ length }).map((_, index) => (
    <div
      key={index}
      className="flex flex-row w-full bg-card items-start space-x-4 p-4 border rounded-lg"
    >
      <div className="flex-shrink-0 mt-1">
        <Skeleton className="size-5 rounded-full" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <Skeleton className="w-28 h-6" />
          <div className="flex items-center space-x-2">
            <Skeleton className="w-16 h-6" />
          </div>
        </div>
        {/* <div className="flex flex-row gap-1 text-sm mt-1">
          <Skeleton className="w-full h-10" />
        </div> */}
        <div className="flex items-center space-x-2 mt-2 flex-wrap">
          <Skeleton className="w-14 h-6" />
          <Skeleton className="w-14 h-6" />
          <Skeleton className="w-14 h-6" />
          <Skeleton className="w-14 h-6" />
        </div>
      </div>
    </div>
  ));
};

const toLoad = 10;

export type AppointmentHistoryProps = {
  appointmentId: string;
};

export const AppointmentHistory: React.FC<AppointmentHistoryProps> = ({
  appointmentId,
}) => {
  const t = useI18n("admin");
  const [entries, setEntries] = React.useState<AppointmentHistoryEntry[]>([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [initialLoad, setInitialLoad] = React.useState(true);
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  const loadEntries = React.useCallback(
    async (page: number) => {
      let url = `/admin/api/appointments/${appointmentId}/history?page=${page}&limit=${toLoad}`;

      const response = await fetch(url, {
        method: "GET",
        cache: "default",
      });

      const res = (await response.json()) as WithTotal<AppointmentHistoryEntry>;

      return {
        items: res.items,
        hasMore: page * toLoad < res.total,
      };
    },
    [appointmentId],
  );

  React.useEffect(() => {
    setPage(1);
    setHasMore(true);
    setInitialLoad(false);
    setEntries([]);
  }, [appointmentId]);

  React.useEffect(() => {
    const loadItems = async () => {
      if (!hasMore && !initialLoad) return;

      setLoading(true);
      try {
        const result = await loadEntries(page);

        if (page === 1) {
          setEntries(result.items);
        } else {
          setEntries((prev) => [...prev, ...result.items]);
        }

        setHasMore(result.hasMore);
        setInitialLoad(false);
      } catch (error) {
        console.error("Failed to fetch items:", error);
        toast.error(t("communications.requestError"));
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [page, loadEntries, initialLoad, hasMore]);

  React.useEffect(() => {
    if (inView && !loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [inView, loading, hasMore]);

  return (
    <div className="grid grid-cols-1 gap-2 py-2">
      {loading && page === 1 && <HistoryEntrySkeleton />}
      {entries?.map((entry) => <HistoryEntry entry={entry} key={entry._id} />)}
      {hasMore && !loading && <div ref={ref} className="h-1" />}
      {loading && page > 1 && <HistoryEntrySkeleton />}
    </div>
  );
};

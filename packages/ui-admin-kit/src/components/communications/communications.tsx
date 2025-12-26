"use client";

import { adminApi } from "@timelish/api-sdk";
import { useI18n, useLocale } from "@timelish/i18n";
import {
  CommunicationChannel,
  CommunicationDirection,
  CommunicationLog,
} from "@timelish/types";
import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  IFrame,
  Markdown,
  Skeleton,
  toast,
  TooltipResponsive,
  TooltipResponsiveContent,
  TooltipResponsiveTrigger,
  useIsMobile,
} from "@timelish/ui";
import JsonView from "@uiw/react-json-view";
import { Mail, MailQuestion, MessageSquare, Send } from "lucide-react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import React from "react";
import { useInView } from "react-intersection-observer";
import { SendCommunicationDialog } from "./send-message-dialog";

const CommunicationEntry: React.FC<{ entry: CommunicationLog }> = ({
  entry,
}) => {
  const tAdmin = useI18n("admin");
  const t = useI18n();
  const dateTime = DateTime.fromJSDate(entry.dateTime);
  const locale = useLocale();
  const isMobile = useIsMobile();
  return (
    <div className="flex flex-row w-full bg-card items-start space-x-4 p-4 border rounded-lg">
      <div className="flex-shrink-0 mt-1">
        {entry.channel === "email" ? (
          <Mail className="size-5" />
        ) : entry.channel === "text-message" ? (
          <MessageSquare className="size-5" />
        ) : (
          <MailQuestion className="size-5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">
            {entry.subject ??
              t(
                typeof entry.handledBy === "string"
                  ? entry.handledBy
                  : entry.handledBy.key,
                typeof entry.handledBy === "object" && entry.handledBy.args
                  ? entry.handledBy.args
                  : undefined,
              )}
          </p>
          <div className="flex items-center space-x-2">
            <TooltipResponsive>
              <TooltipResponsiveTrigger>
                <span className="text-xs text-gray-500 underline decoration-dashed cursor-help">
                  {dateTime.setLocale(locale).toRelative()}
                </span>
              </TooltipResponsiveTrigger>
              <TooltipResponsiveContent side={isMobile ? "bottom" : "left"}>
                {dateTime.toLocaleString(DateTime.DATETIME_MED, { locale })}
              </TooltipResponsiveContent>
            </TooltipResponsive>
          </div>
        </div>
        <div className="inline-flex gap-1 text-sm mt-1 flex-wrap w-full">
          <span className="break-all text-xs">
            {entry.text.length > 200
              ? entry.text.substring(0, 200) + "..."
              : entry.text}
          </span>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link-dashed" className="px-0">
                {tAdmin("communications.viewMore")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[80%] flex flex-col max-h-[100%]">
              <DialogHeader>
                <DialogTitle className="w-full flex flex-row justify-between items-center mt-2">
                  {tAdmin("communications.logContent")}
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
                    {tAdmin("common.buttons.close")}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {tAdmin(`common.labels.channel.${entry.channel}`)}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {tAdmin(`common.labels.direction.${entry.direction}`)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {tAdmin("communications.handler", {
              handler: t(
                typeof entry.handledBy === "string"
                  ? entry.handledBy
                  : entry.handledBy.key,
                typeof entry.handledBy === "object" && entry.handledBy.args
                  ? entry.handledBy.args
                  : undefined,
              ),
            })}
          </Badge>
          {entry.data && (
            <div className="flex flex-col gap-1">
              <Dialog>
                <DialogTrigger>
                  <Badge variant="default">
                    {tAdmin("communications.data")}
                  </Badge>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[80%] flex flex-col max-h-[100%]">
                  <DialogHeader>
                    <DialogTitle className="w-full flex flex-row justify-between items-center mt-2">
                      {tAdmin("communications.logData")}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 w-full overflow-auto">
                    <JsonView value={entry.data} />
                  </div>
                  <DialogFooter className="flex-row !justify-between gap-2">
                    <DialogClose asChild>
                      <Button variant="secondary">
                        {tAdmin("common.buttons.close")}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CommunicationEntrySkeleton: React.FC<{ length?: number }> = ({
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
        <div className="flex flex-row gap-1 text-sm mt-1">
          <Skeleton className="w-full h-10" />
        </div>
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

export type CustomerOrAppointment =
  | {
      customerId: string;
    }
  | {
      appointmentId: string;
    };

export const SendCommunicationButton: React.FC<CustomerOrAppointment> = (
  props,
) => {
  const t = useI18n("admin");
  const router = useRouter();
  return (
    <SendCommunicationDialog
      {...props}
      onSuccess={() => router.replace(`?key=${new Date().getTime()}`)}
    >
      <Button variant="primary">
        <Send /> {t("communications.sendNew")}
      </Button>
    </SendCommunicationDialog>
  );
};

const toLoad = 10;

export type RecentCommunicationsProps = {
  direction?: CommunicationDirection[];
  channel?: CommunicationChannel[];
  start?: Date | null;
  end?: Date | null;
  search?: string | null;
} & CustomerOrAppointment;

export const RecentCommunications: React.FC<RecentCommunicationsProps> = ({
  direction,
  channel,
  start,
  end,
  search,
  ...rest
}) => {
  const t = useI18n("admin");
  const [logs, setLogs] = React.useState<CommunicationLog[]>([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [initialLoad, setInitialLoad] = React.useState(true);
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  const customerId = "customerId" in rest ? rest.customerId : undefined;
  const appointmentId =
    "appointmentId" in rest ? rest.appointmentId : undefined;

  const loadLogs = React.useCallback(
    async (page: number) => {
      const result = await adminApi.communicationLogs.getCommunicationLogs({
        participantType: ["customer"],
        page,
        limit: toLoad,
        customerId: customerId ? [customerId] : undefined,
        appointmentId,
        direction,
        channel,
        start,
        end,
        search,
      });

      return {
        items: result.items,
        hasMore: page * toLoad < result.total,
      };
    },
    [customerId, appointmentId, direction, channel, start, end, search],
  );

  React.useEffect(() => {
    setPage(1);
    setHasMore(true);
    setInitialLoad(false);
    setLogs([]);
  }, [customerId, channel, direction, start, end, search]);

  React.useEffect(() => {
    const loadItems = async () => {
      if (!hasMore && !initialLoad) return;

      setLoading(true);
      try {
        const result = await loadLogs(page);

        if (page === 1) {
          setLogs(result.items);
        } else {
          setLogs((prev) => [...prev, ...result.items]);
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
  }, [page, loadLogs, initialLoad, hasMore]);

  React.useEffect(() => {
    if (inView && !loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [inView, loading, hasMore]);

  return (
    <div className="grid grid-cols-1 gap-2 py-2">
      {loading && page === 1 && <CommunicationEntrySkeleton />}
      {logs?.map((log) => <CommunicationEntry entry={log} key={log._id} />)}
      {hasMore && !loading && <div ref={ref} className="h-1" />}
      {loading && page > 1 && <CommunicationEntrySkeleton />}
    </div>
  );
};

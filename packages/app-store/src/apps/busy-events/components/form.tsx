"use client";

import { useI18n } from "@timelish/i18n";
import { Schedule, ScheduleOverride, WeekIdentifier } from "@timelish/types";
import {
  Button,
  Skeleton,
  toast,
  toastPromise,
  useDebounce,
} from "@timelish/ui";
import { Scheduler, WeekSelector } from "@timelish/ui-admin";
import { getDateFromWeekIdentifier, getWeekIdentifier } from "@timelish/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  BusyEventsAdminAllKeys,
  BusyEventsAdminKeys,
  busyEventsAdminNamespace,
  BusyEventsAdminNamespace,
} from "../translations/types";
import { getWeeklyEvents, setEvents } from "./actions";

type WeeklySchedule = ScheduleOverride["schedule"];
type BusyEventsFormProps = {
  appId: string;
};

export const BusyEventsForm: React.FC<BusyEventsFormProps> = ({ appId }) => {
  const [loading, setLoading] = React.useState(true);
  const t = useI18n<BusyEventsAdminNamespace, BusyEventsAdminKeys>(
    busyEventsAdminNamespace,
  );
  const tAdmin = useI18n("admin");

  const weekStr = useSearchParams().get("week");
  const week =
    (weekStr ? parseInt(weekStr) : null) || getWeekIdentifier(new Date());

  const router = useRouter();
  const todayWeek = getWeekIdentifier(new Date());

  const [schedule, setSchedule] = useState<Schedule>();

  const [currentSchedule, setCurrentSchedule] = useState(schedule);
  const delayedSchedule = useDebounce(currentSchedule);

  const weekDate = useMemo(() => getDateFromWeekIdentifier(week), [week]);

  const loadSchedule = async () => {
    setLoading(true);

    try {
      const response = await getWeeklyEvents(appId, week);
      setSchedule(response);
      setCurrentSchedule(response);
      setLoading(false);
    } catch (e: any) {
      console.error(e);
      toast.error(t("errors.failed_to_load_schedule"));
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [appId, week]);

  const onScheduleChange = async (newSchedule: WeeklySchedule) => {
    if (week < todayWeek) return;
    if (JSON.stringify(schedule) === JSON.stringify(newSchedule)) return;

    try {
      // setLoading(true);
      await toastPromise(setEvents(appId, week, newSchedule), {
        success: tAdmin("common.toasts.saved"),
        error: tAdmin("common.toasts.error"),
      });

      setSchedule(newSchedule);
    } catch (error: any) {
      console.error(error);
    } finally {
      // setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!delayedSchedule) return;
    onScheduleChange(delayedSchedule);
  }, [delayedSchedule]);

  const onWeekChange = React.useCallback(
    (newWeek: WeekIdentifier) => {
      if (newWeek !== week) {
        router.push(`?week=${newWeek}`);
      }
    },
    [router, week],
  );

  return (
    <div className="w-full space-y-8 relative flex flex-col gap-2">
      <div className="flex flex-col lg:flex-row gap-2 justify-between">
        <Button
          variant={week === todayWeek ? "primary" : "outline"}
          disabled={week === todayWeek || loading}
          onClick={() => onWeekChange(todayWeek)}
        >
          {t("thisWeek")}
        </Button>
        <div className="flex flex-row gap-1 max-lg:w-full">
          <Button
            variant="outline"
            size="icon"
            title={t("previousWeek")}
            disabled={loading}
            onClick={() => onWeekChange(week - 1)}
          >
            <ChevronLeft />
          </Button>
          <WeekSelector
            initialWeek={week}
            disabled={loading}
            onWeekChange={onWeekChange}
            className="lg:w-[324px] flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            title={t("nextWeek")}
            disabled={loading}
            onClick={() => onWeekChange(week + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      {loading ? (
        <Skeleton className="w-full h-[70vh]" />
      ) : (
        <Scheduler
          value={schedule || []}
          onChange={setCurrentSchedule}
          disabled={week < todayWeek}
          weekDate={weekDate}
          shiftsLabel={
            "app_busy-events_admin.shifts" satisfies BusyEventsAdminAllKeys
          }
          addShiftLabel={t("addShift")}
        />
      )}
    </div>
  );
};

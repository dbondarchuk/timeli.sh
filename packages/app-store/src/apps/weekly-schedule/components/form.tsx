"use client";

import { useI18n } from "@vivid/i18n";
import { Schedule, ScheduleOverride, WeekIdentifier } from "@vivid/types";
import {
  Button,
  Separator,
  Skeleton,
  toast,
  toastPromise,
  useDebounce,
} from "@vivid/ui";
import { Scheduler, WeekSelector } from "@vivid/ui-admin";
import { getDateFromWeekIdentifier, getWeekIdentifier } from "@vivid/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  WeeklyScheduleAdminKeys,
  WeeklyScheduleAdminNamespace,
  weeklyScheduleAdminNamespace,
} from "../translations/types";
import { getWeeklySchedule, updateWeeklySchedule } from "./actions";
import { CopyScheduleDialog } from "./copy-schedule-dialog";
import { RepeatScheduleDialog } from "./repeat-schedule-dialog";
import { ResetAllDialog } from "./reset-all-dialog";
import { ResetDialog } from "./reset-dialog";

type WeeklySchedule = ScheduleOverride["schedule"];
type WeeklyScheduleFormProps = {
  appId: string;
};

export const WeeklyScheduleForm: React.FC<WeeklyScheduleFormProps> = ({
  appId,
}) => {
  const t = useI18n<WeeklyScheduleAdminNamespace, WeeklyScheduleAdminKeys>(
    weeklyScheduleAdminNamespace,
  );
  const [loading, setLoading] = React.useState(true);

  const weekStr = useSearchParams().get("week");
  const week =
    (weekStr ? parseInt(weekStr) : null) || getWeekIdentifier(new Date());

  const router = useRouter();
  const todayWeek = getWeekIdentifier(new Date());

  const [schedule, setSchedule] = useState<Schedule>();
  const [isDefault, setIsDefault] = useState(true);

  const [currentSchedule, setCurrentSchedule] = useState(schedule);
  const delayedSchedule = useDebounce(currentSchedule);

  const weekDate = useMemo(() => getDateFromWeekIdentifier(week), [week]);

  const loadSchedule = async () => {
    setLoading(true);

    try {
      const response = await getWeeklySchedule(appId, week);
      setSchedule(response.schedule);
      setCurrentSchedule(response.schedule);
      setIsDefault(response.isDefault);
      setLoading(false);
    } catch (e: any) {
      console.error(e);
      toast.error(t("statusText.failed_to_load_schedule"));
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
      await toastPromise(updateWeeklySchedule(appId, week, newSchedule), {
        success: t("statusText.saved"),
        error: t("statusText.request_error"),
      });

      setIsDefault(false);
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
          {t("form.thisWeek")}
        </Button>
        <div className="flex flex-row gap-1 max-lg:w-full">
          <Button
            variant="outline"
            size="icon"
            title={t("form.previousWeek")}
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
            title={t("form.nextWeek")}
            disabled={loading}
            onClick={() => onWeekChange(week + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
        <div className="flex flex-col lg:flex-row flex-wrap gap-2">
          <div className="flex items-center max-lg:w-full">
            <ResetDialog
              appId={appId}
              week={week}
              isDefault={isDefault}
              disabled={week < todayWeek || loading}
              onConfirm={loadSchedule}
              className="rounded-r-none flex-1"
            />
            <Separator orientation="vertical" />
            <ResetAllDialog
              appId={appId}
              week={week}
              disabled={week < todayWeek || loading}
              onConfirm={loadSchedule}
              className="rounded-l-none border-l-0 flex-1"
            />
          </div>
          <div className="flex items-center max-lg:w-full">
            <CopyScheduleDialog
              appId={appId}
              week={week}
              disabled={isDefault}
              className="rounded-r-none flex-1"
            />
            <Separator orientation="vertical" />
            <RepeatScheduleDialog
              appId={appId}
              week={week}
              disabled={isDefault}
              className="rounded-l-none border-l-0 flex-1"
            />
          </div>
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
        />
      )}
    </div>
  );
};

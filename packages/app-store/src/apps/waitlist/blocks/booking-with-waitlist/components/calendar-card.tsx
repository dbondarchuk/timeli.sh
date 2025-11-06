"use client";
import type { Time } from "@timelish/types";

import React from "react";

import { getTimeZones } from "@vvo/tzdb";

import { DayButtonProps } from "react-day-picker";

import {
  Button,
  Calendar,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useTimeZone,
} from "@timelish/ui";

import { Combobox, IComboboxItem } from "@timelish/ui";
import { Globe2Icon } from "lucide-react";
import { DateTime, HourNumbers, DateTime as Luxon, MinuteNumbers } from "luxon";

import { useI18n, useLocale } from "@timelish/i18n";
import { areTimesEqual, formatTimeLocale } from "@timelish/utils";
import * as Locales from "date-fns/locale";
import {
  WaitlistPublicKeys,
  waitlistPublicNamespace,
  WaitlistPublicNamespace,
} from "../../../translations/types";
import { useScheduleContext } from "./context";

const asJsDate = (dateTime: Luxon) =>
  new Date(dateTime.year, dateTime.month - 1, dateTime.day);

const timeZones: IComboboxItem[] = getTimeZones().map((zone) => ({
  label: `GMT${zone.currentTimeFormat}`,
  shortLabel: `${zone.alternativeName}`,
  value: zone.name,
}));

const formatDate = (date: Date): string =>
  `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;

const DayButton = (props: DayButtonProps) => {
  const { day, modifiers, ...buttonProps } = props;
  const isDisabled = modifiers.disabled;
  const t = useI18n("translation");

  return isDisabled ? (
    <TooltipProvider>
      <Tooltip>
        {/* We need to force tooltip on mobile (long tap) */}
        <TooltipTrigger>
          <span>
            <button {...buttonProps} />
          </span>
        </TooltipTrigger>
        <TooltipContent>{t("no_avaialable_time_slots")}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <button {...buttonProps} />
  );
};

export const CalendarCard: React.FC = () => {
  const i18n = useI18n("translation");
  const locale = useLocale();
  const {
    dateTime,
    setDateTime,
    setDiscount: setPromoCode,
    availability,
    setStep,
  } = useScheduleContext();

  const t = useI18n<WaitlistPublicNamespace, WaitlistPublicKeys>(
    waitlistPublicNamespace,
  );

  const defaultTimeZone = useTimeZone();

  const [date, setDate] = React.useState<Date | undefined>(dateTime?.date);
  const [time, setTime] = React.useState<Time | undefined>(dateTime?.time);

  const [timeZone, setTimeZone] = React.useState<string>(
    dateTime?.timeZone || defaultTimeZone,
  );

  const changeDate = (date: Date | undefined) => {
    setDate(date);
    setTime(undefined);
  };

  const adjustedAvailability = React.useMemo(
    () =>
      availability.map((time) =>
        Luxon.fromJSDate(time, { zone: "utc" }).setZone(timeZone),
      ),
    [availability, timeZone],
  );

  const dates = React.useMemo(
    () =>
      adjustedAvailability
        .map((dateTime) => asJsDate(dateTime))
        .sort((a, b) => a.getTime() - b.getTime()),
    [adjustedAvailability],
  );

  const isDisabledDay = React.useCallback(
    (day: Date) =>
      dates.map((date) => formatDate(date)).indexOf(formatDate(day)) < 0,
    [dates],
  );

  const times = React.useMemo(
    () =>
      Object.entries(
        adjustedAvailability.reduce(
          (prev, dateTime) => {
            const key = formatDate(asJsDate(dateTime));
            prev[key] = prev[key] || [];
            prev[key].push({
              hour: dateTime.hour as HourNumbers,
              minute: dateTime.minute as MinuteNumbers,
            });
            return prev;
          },
          {} as { [x: string]: Time[] },
        ),
      ).reduce(
        (prev, curr) => {
          prev[curr[0]] = curr[1].sort(
            (a, b) => a.hour - b.hour || a.minute - b.minute,
          );
          return prev;
        },
        {} as { [x: string]: Time[] },
      ),
    [adjustedAvailability],
  );

  React.useEffect(() => {
    setDateTime(
      !date || !time
        ? undefined
        : {
            date,
            time,
            timeZone,
          },
    );

    setPromoCode(undefined);
  }, [date, time, timeZone, setDateTime, setPromoCode]);

  const minDate = React.useMemo(() => dates[0], [dates]);
  const maxDate = React.useMemo(() => dates[dates.length - 1], [dates]);

  React.useEffect(() => {
    if (
      date &&
      (isDisabledDay(date) ||
        Luxon.fromJSDate(date) < Luxon.fromJSDate(minDate))
    )
      setDate(minDate);
  }, [minDate, dateTime, date, isDisabledDay]);

  const isTimeSelected = React.useCallback(
    (t: Time) => areTimesEqual(t, time),
    [time],
  );

  const timeZoneLabel = i18n.rich("select_timezone_label_format", {
    timeZoneCombobox: () => (
      <Combobox
        values={timeZones}
        className="mx-2"
        searchLabel={i18n("search_timezone_label")}
        customSearch={(search) =>
          timeZones.filter(
            (zone) =>
              (zone.label as string)
                .toLocaleLowerCase()
                .indexOf(search.toLocaleLowerCase()) >= 0,
          )
        }
        value={timeZone}
        onItemSelect={(value) => setTimeZone(value)}
      />
    ),
  });

  const language = locale === "en" ? "enUS" : locale;
  // @ts-ignore not correct english locale
  const calendarLocale = Locales[language];

  return (
    <div className="relative text-center">
      <div className="mb-3">
        <h2 className="text-xl">{i18n("select_date_time_label")}</h2>
      </div>
      <div className="mb-3 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 md:gap-10 not-prose">
          <div className="flex flex-col">
            <div className="mb-3">
              <Calendar
                locale={calendarLocale}
                mode="single"
                selected={date}
                showOutsideDays={false}
                // startMonth={Luxon.fromJSDate(minDate)
                //   .startOf("month")
                //   .toJSDate()}
                startMonth={new Date()}
                endMonth={Luxon.fromJSDate(maxDate).endOf("month").toJSDate()}
                onSelect={changeDate}
                className="rounded-md border"
                disabled={(day: Date) => isDisabledDay(day)}
                components={{
                  DayButton,
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {!date ? (
              <h4>{i18n("select_date_first_label")}</h4>
            ) : (
              <>
                <h4 className="">
                  {DateTime.fromJSDate(date, { zone: timeZone })
                    .setLocale(locale)
                    .toLocaleString(DateTime.DATE_HUGE)}
                </h4>
                <div className="flex flex-row gap-2 justify-start flex-wrap">
                  {(times[formatDate(date)] || []).map((t) => (
                    <div className="" key={formatTimeLocale(t, locale)}>
                      <Button
                        className="w-24"
                        variant={isTimeSelected(t) ? "default" : "outline"}
                        onClick={() =>
                          setTime(isTimeSelected(t) ? undefined : t)
                        }
                      >
                        {formatTimeLocale(t, locale)}
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div>
          {t.rich("block.calendar.waitlistLink", {
            link: (chunks: any) => (
              <Button
                variant="link-underline"
                className="px-0 text-base font-semibold inline-block"
                onClick={() => setStep("waitlist-form")}
              >
                {chunks}
              </Button>
            ),
          })}
        </div>
        <div className="text-sm text-muted-foreground leading-10">
          <Globe2Icon className="inline-block mr-1" />
          {timeZoneLabel}
        </div>
      </div>
    </div>
  );
};

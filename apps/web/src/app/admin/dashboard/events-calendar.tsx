"use client";

import { useI18n } from "@vivid/i18n";
import {
  Button,
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vivid/ui";
import { EventCalendar, EventCalendarType } from "@vivid/ui-admin-kit";
import { DateTime } from "luxon";
import React from "react";
import { useCookies } from "react-cookie";

type EventsCalendarView = Exclude<EventCalendarType, "days-around">;

const COOKIE_NAME = "events-calendar-view";
type CookieValues = {
  [COOKIE_NAME]?: EventsCalendarView;
};

export const EventsCalendar = () => {
  const [cookies, setCookies] = useCookies<typeof COOKIE_NAME, CookieValues>([
    COOKIE_NAME,
  ]);
  const t = useI18n("admin");

  const [date, setDate] = React.useState(
    DateTime.now().startOf("day") as DateTime,
  );

  const [type, setType] = React.useState<EventsCalendarView>(
    cookies[COOKIE_NAME] ?? "weekly",
  );

  const changeType = (view: EventsCalendarView) => {
    setType(view);
    setCookies(COOKIE_NAME, view, {
      expires: DateTime.now().plus({ years: 1 }).toJSDate(),
    });
  };

  return (
    <div className="grid gap-3 w-full">
      <div className="flex flex-row gap-2 justify-between">
        <Button onClick={() => setDate(DateTime.now())}>
          {t("calendar.today")}
        </Button>
        <Select
          value={type}
          onValueChange={(value) => changeType(value as typeof type)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder={t("calendar.selectView")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">{t("calendar.monthly")}</SelectItem>
            <SelectItem value="weekly">{t("calendar.weekly")}</SelectItem>
            <SelectItem value="daily">{t("calendar.daily")}</SelectItem>
            <SelectItem value="agenda">{t("calendar.agenda")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <EventCalendar
        date={date.toJSDate()}
        type={type}
        className={cn(
          "w-full",
          type !== "monthly" && type !== "agenda" && "h-[100vh]",
        )}
        onDateClick={(date) => {
          setDate(DateTime.fromJSDate(date));
          setType("daily");
        }}
      />
    </div>
  );
};

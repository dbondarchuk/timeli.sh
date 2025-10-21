import { useI18n, useLocale } from "@vivid/i18n";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
  useTimeZone,
} from "@vivid/ui";
import { durationToTime } from "@vivid/utils";
import { CalendarClock, Clock, Timer } from "lucide-react";
import { DateTime } from "luxon";
import React from "react";
import { EventVariantClasses } from "./styles";
import { CalendarEvent } from "./types";

export type EventPopoverProps = {
  event: CalendarEvent;
  children: React.ReactNode;
};

export const EventPopover: React.FC<EventPopoverProps> = ({
  event,
  children,
}) => {
  const t = useI18n("admin");
  const locale = useLocale();
  const timeZone = useTimeZone();

  const eventDate = DateTime.fromJSDate(event.start).setZone(timeZone);
  const endDate = DateTime.fromJSDate(event.end).setZone(timeZone);
  const duration = durationToTime(
    endDate.diff(eventDate, "minutes").toObject().minutes ?? 0,
  );
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div
            className={cn(
              "h-1.5 rounded-full",
              EventVariantClasses[event.variant || "primary"] ??
                EventVariantClasses.primary,
            )}
          />
          <div className="font-semibold text-lg">{event.title}</div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>
              {eventDate.toLocaleString(DateTime.DATETIME_FULL, { locale })}
            </span>
          </div>
          {duration.hours < 23 && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Timer className="mr-2 h-4 w-4" />
              <span>
                {duration.hours} {t("calendar.hour")} {duration.minutes}{" "}
                {t("calendar.minute")}
              </span>
            </div>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarClock className="mr-2 h-4 w-4" />
            <span>
              {endDate.toLocaleString(DateTime.DATETIME_FULL, { locale })}
            </span>
          </div>

          {/* {event.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-2 h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}

          {event.description && (
            <div className="pt-2 border-t text-sm">{event.description}</div>
          )} */}
        </div>
      </PopoverContent>
    </Popover>
  );
};

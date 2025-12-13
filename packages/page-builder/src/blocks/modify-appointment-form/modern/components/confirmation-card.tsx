import { useI18n, useLocale } from "@timelish/i18n";
import { timeZones } from "@timelish/types";
import { useTimeZone } from "@timelish/ui";
import { TimeZone } from "@vvo/tzdb";
import { CheckCircle2 } from "lucide-react";
import { DateTime } from "luxon";
import { useModifyAppointmentFormContext } from "./context";

export const ConfirmationCard: React.FC = () => {
  const t = useI18n("translation");
  const { appointment, type, newDateTime, dateTime } =
    useModifyAppointmentFormContext();
  const defaultTimeZone = useTimeZone();
  const locale = useLocale();

  if (!appointment) return null;

  let timeZone: TimeZone | undefined = timeZones.find((tz) => {
    const timeZoneName =
      dateTime?.timeZone || appointment.timeZone || defaultTimeZone;
    return timeZoneName === tz.name || tz.group.includes(timeZoneName);
  });

  if (!timeZone) {
    const defaultZone = DateTime.now().zoneName;
    timeZone = timeZones.find((tz) => {
      return defaultZone === tz.name || tz.group.includes(defaultZone || "");
    });
  }

  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-6 h-6 text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">
        {t(`modification.confirmation.${type}.title`)}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {t(`modification.confirmation.${type}.description`)}
      </p>
      <div className="bg-muted/50 flex flex-col gap-2 rounded-lg p-4 text-left">
        <p className="text-sm text-muted-foreground">
          {t("modification.confirmation.appointmentDetails")}
        </p>
        <p className="text-sm font-semibold text-foreground">
          {appointment.optionName}
        </p>
        <p className="text-xs text-foreground line-through">
          {DateTime.fromJSDate(appointment.dateTime)
            .setZone(appointment.timeZone)
            .toLocaleString(DateTime.DATETIME_HUGE, { locale })}
        </p>
        {type === "reschedule" && newDateTime && (
          <>
            <p className="text-xs text-foreground">
              {newDateTime.toLocaleString(DateTime.DATETIME_HUGE, { locale })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("timezone_format", {
                timezone: timeZone?.currentTimeFormat || "",
              })}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

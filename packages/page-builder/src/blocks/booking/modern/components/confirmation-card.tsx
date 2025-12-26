import { useI18n, useLocale } from "@timelish/i18n";
import { Button, useTimeZone } from "@timelish/ui";
import { durationToTime, formatAmountString } from "@timelish/utils";
import { CheckCircle2 } from "lucide-react";
import { DateTime } from "luxon";
import { useScheduleContext } from "./context";

export const ConfirmationCard: React.FC = () => {
  const i18n = useI18n("translation");

  const {
    fields,
    selectedAppointmentOption,
    dateTime,
    handleNewBooking,
    price,
    discount,
    discountAmount,
    basePrice,
    duration,
  } = useScheduleContext();

  const locale = useLocale();
  const defaultTimeZone = useTimeZone();

  if (!selectedAppointmentOption) return null;

  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-6 h-6 text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">
        {i18n("confirmation_success_title")}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {i18n("confirmation_success_message", {
          name: fields.name,
          service: selectedAppointmentOption.name,
        })}
      </p>
      <div className="bg-muted/50 flex flex-col gap-2 rounded-lg p-4 text-left">
        <p className="text-sm text-muted-foreground">
          {i18n("confirmation_success_appointment_details")}
        </p>
        <p className="text-sm font-semibold text-foreground">
          {selectedAppointmentOption.name}
        </p>
        {dateTime && (
          <>
            <p className="text-xs text-foreground">
              {DateTime.fromJSDate(dateTime.date)
                .set({ hour: dateTime.time.hour, minute: dateTime.time.minute })
                .setZone(dateTime.timeZone)
                .toLocaleString(DateTime.DATETIME_HUGE, { locale })}
            </p>
          </>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {i18n("confirmation_success_duration", {
            duration: i18n(
              "duration_hour_minutes_format",
              durationToTime(duration || 0),
            ),
          })}
        </p>
        {!!discount && (
          <>
            <p className="text-xs text-muted-foreground mt-1">
              {i18n("booking.confirmation.price.original", {
                original: formatAmountString(basePrice),
              })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {i18n("booking.confirmation.price.discount", {
                discount: formatAmountString(discountAmount),
              })}
            </p>
          </>
        )}
        {!!basePrice && (
          <p className="text-sm font-semibold text-foreground mt-1">
            {i18n("booking.confirmation.price.total", {
              total: formatAmountString(price),
            })}
          </p>
        )}
      </div>
      <div className="mt-6 confirm-new-booking-button-container">
        <Button
          onClick={handleNewBooking}
          variant="outline"
          className="confirm-new-booking-button"
        >
          {i18n("confirmation_new_booking_button")}
        </Button>
      </div>
    </div>
  );
};

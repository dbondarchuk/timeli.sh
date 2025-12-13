import { useI18n, useLocale } from "@timelish/i18n";
import { timeZones } from "@timelish/types";
import { Checkbox, cn, Markdown } from "@timelish/ui";
import { durationToTime, formatAmountString, template } from "@timelish/utils";
import { TimeZone } from "@vvo/tzdb";
import { AlertTriangle, Calendar, Clock, Globe2 } from "lucide-react";
import { DateTime } from "luxon";
import { useScheduleContext } from "./context";

export const ReviewCard: React.FC = () => {
  const {
    selectedAppointmentOption,
    selectedAddons,
    duplicateAppointmentDoNotAllowScheduling,
    closestDuplicateAppointment,
    confirmDuplicateAppointment,
    setConfirmDuplicateAppointment,
    dateTime,
    fields,
    price,
    formFields,
  } = useScheduleContext();

  const locale = useLocale();

  const t = useI18n("translation");

  if (!selectedAppointmentOption || !dateTime || !fields?.name) return null;

  let timeZone: TimeZone | undefined = timeZones.find((tz) => {
    return (
      dateTime.timeZone === tz.name || tz.group.includes(dateTime.timeZone)
    );
  });
  if (!timeZone) {
    const defaultZone = DateTime.now().zoneName;
    timeZone = timeZones.find((tz) => {
      return defaultZone === tz.name || tz.group.includes(defaultZone || "");
    });
  }

  const { name, email, phone, ...restFields } = fields;
  return (
    <div className="space-y-6 review-card card-container">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground review-card-title card-title">
          {t("booking.review.title")}
        </h2>
        <p className="text-xs text-muted-foreground review-card-description card-description">
          {t("booking.review.description")}
        </p>
      </div>

      {/* Duplicate Warning */}
      {selectedAppointmentOption.duplicateAppointmentCheck?.enabled &&
        closestDuplicateAppointment && (
          <div
            className={cn(
              "border-2 rounded-lg p-4",
              duplicateAppointmentDoNotAllowScheduling
                ? "border-destructive bg-destructive/90 dark:bg-destructive/90 text-destructive-foreground"
                : "border-amber-500 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300",
            )}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className={cn("w-5 h-5 mt-0.5 shrink-0")} />
              <div className="flex-1">
                <h4
                  className={cn(
                    "font-semibold text-sm",
                    duplicateAppointmentDoNotAllowScheduling,
                  )}
                >
                  {t("booking.review.duplicate.title")}
                </h4>
                <p
                  className={cn(
                    "text-xs text-muted-foreground",
                    duplicateAppointmentDoNotAllowScheduling
                      ? "text-destructive-foreground"
                      : "",
                  )}
                >
                  {t("booking.review.duplicate.description")}
                </p>
                <Markdown
                  markdown={template(
                    selectedAppointmentOption.duplicateAppointmentCheck.message,
                    {
                      date: closestDuplicateAppointment.toLocaleString(
                        DateTime.DATETIME_FULL,
                      ),
                      name: fields.name,
                      service: selectedAppointmentOption.name,
                      days: selectedAppointmentOption.duplicateAppointmentCheck
                        .days,
                    },
                  )}
                  prose="simple"
                  className="text-xs mt-2 [&_p]:my-0.5 [&_p]:leading-6"
                />
                {closestDuplicateAppointment && (
                  <p className="text-xs mt-2">
                    {t("booking.review.duplicate.closestAppointment")}
                    {closestDuplicateAppointment.toLocaleString(
                      DateTime.DATETIME_FULL,
                      { locale },
                    )}
                  </p>
                )}
                {!duplicateAppointmentDoNotAllowScheduling && (
                  <div className="mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={confirmDuplicateAppointment}
                        onCheckedChange={(e) =>
                          setConfirmDuplicateAppointment(!!e)
                        }
                        className={cn(
                          "w-4 h-4 rounded",
                          duplicateAppointmentDoNotAllowScheduling
                            ? "border-destructive-foreground bg-destructive-foreground/10"
                            : "border-amber-500",
                        )}
                      />
                      <span className="text-xs font-medium">
                        {t("booking.review.duplicate.confirm")}
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Service Summary */}
      <div className="border rounded-lg p-4 space-y-4 review-service-summary">
        <div className="flex items-start justify-between review-service-summary-content">
          <div>
            <h3 className="text-sm font-semibold text-foreground review-service-summary-title">
              {selectedAppointmentOption.name}
            </h3>
            <Markdown
              markdown={selectedAppointmentOption.description}
              prose="simple"
              className="text-xs text-muted-foreground [&_p]:my-0.5 [&_p]:leading-6 review-service-summary-description"
            />
          </div>
          {(!!selectedAppointmentOption.price ||
            !!selectedAppointmentOption.duration) && (
            <div className="text-right shrink-0 review-service-summary-price">
              {!!selectedAppointmentOption.price && (
                <p className="text-xs font-semibold text-foreground review-service-summary-price-amount">
                  ${formatAmountString(selectedAppointmentOption.price)}
                </p>
              )}
              {!!selectedAppointmentOption.duration && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end review-service-summary-price-duration">
                  <Clock className="w-3 h-3" />{" "}
                  {t(
                    "duration_hour_min_format",
                    durationToTime(selectedAppointmentOption.duration || 0),
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Add-ons */}
        {selectedAddons.length > 0 && (
          <div className="border-t pt-4 review-addons">
            <h4 className="text-sm font-medium text-muted-foreground mb-2 review-addons-title">
              {t("booking.review.addons.title")}
            </h4>
            {selectedAddons.map((addon) => (
              <div
                key={addon._id}
                className="flex items-center justify-between py-1 review-addons-item"
              >
                <span className="text-xs text-foreground review-addons-name">
                  {addon.name}
                </span>
                {(!!addon.price || !!addon.duration) && (
                  <div className="text-right shrink-0 review-addons-price">
                    {!!addon.price && (
                      <span className="text-xs font-medium text-foreground">
                        +${formatAmountString(addon.price || 0)}
                      </span>
                    )}
                    {!!addon.duration && (
                      <span className="text-xs text-muted-foreground ml-2 review-addons-duration">
                        +
                        {t(
                          "duration_hour_min_format",
                          durationToTime(addon.duration),
                        )}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Date & Time */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2 review-date-title">
            {t("booking.review.date.title")}
          </h4>
          <div className="mb-2 flex items-center gap-2 text-foreground text-xs review-date-content">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="review-date-date">
              {DateTime.fromJSDate(dateTime.date)
                .set({ hour: dateTime.time.hour, minute: dateTime.time.minute })
                .setZone(dateTime.timeZone)
                .toLocaleString(DateTime.DATETIME_FULL, { locale })}
            </span>
          </div>
          <div className="mb-2 flex items-center gap-2 text-foreground text-xs review-timezone-content">
            <Globe2 className="w-4 h-4 text-muted-foreground" />
            <span className="review-date-timezone">
              {t("timezone_format", {
                timezone: timeZone?.currentTimeFormat || "",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-foreground text-xs review-duration-content">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="review-date-duration">
              {t("booking.review.total.duration", {
                duration: t(
                  "duration_hour_min_format",
                  durationToTime(selectedAppointmentOption.duration || 0),
                ),
              })}
            </span>
          </div>
        </div>

        {/* Contact Details */}
        <div className="border-t pt-4 review-contact-details">
          <h4 className="text-sm font-medium text-muted-foreground mb-2 review-contact-details-title">
            {t("booking.review.contact.title")}
          </h4>
          <div className="space-y-1 text-xs">
            <p className="text-foreground review-contact-details-name">
              <span className="font-medium">
                {t("booking.review.contact.name", { name })}
              </span>
            </p>
            <p className="text-muted-foreground review-contact-details-email">
              {t("booking.review.contact.email", { email })}
            </p>
            {phone && (
              <p className="text-muted-foreground review-contact-details-phone">
                {t("booking.review.contact.phone", { phone })}
              </p>
            )}
            {Object.entries(restFields)
              .map(([key, value]) => {
                const field = formFields.find((field) => field.name === key);
                return {
                  key,
                  value:
                    typeof value === "boolean"
                      ? value
                        ? t("booking.review.contact.yes")
                        : t("booking.review.contact.no")
                      : value,
                  label: field?.data?.label ?? key,
                  type: field?.type,
                };
              })
              .filter(
                ({ type, value }) =>
                  type !== "file" && (type === "checkbox" || !!value),
              )
              .map(({ key, value, label }) => (
                <p
                  className="text-muted-foreground review-contact-details-other"
                  key={key}
                >
                  {t("booking.review.contact.other", {
                    label,
                    value,
                  })}
                </p>
              ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4 review-total">
          <div className="flex items-center justify-between review-total-content">
            <div>
              {!!price && price > 0 && (
                <p className="font-semibold text-foreground review-total-title">
                  {t("booking.review.total.title")}
                </p>
              )}
            </div>
            {!!price && price > 0 && (
              <p className="text-lg font-bold text-foreground review-total-amount">
                ${formatAmountString(price)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

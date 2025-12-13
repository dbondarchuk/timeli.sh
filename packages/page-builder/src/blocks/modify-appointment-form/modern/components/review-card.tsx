import { useFormatter, useI18n, useLocale } from "@timelish/i18n";
import { durationToTime, formatAmountString } from "@timelish/utils";
import { AlertTriangle } from "lucide-react";
import { DateTime } from "luxon";
import { useModifyAppointmentFormContext } from "./context";

export const ReviewCard: React.FC = () => {
  const { appointment, dateTime, type, newDateTime } =
    useModifyAppointmentFormContext();

  const locale = useLocale();
  const formatter = useFormatter();

  const t = useI18n("translation");

  if (type === "reschedule" && !dateTime) return null;
  if (!appointment || !appointment.allowed) return null;

  return (
    <div className="space-y-6 review-card card-container">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground review-card-title card-title">
          {t(`modification.review.${type}.title`)}
        </h2>
        <p className="text-xs text-muted-foreground review-card-description card-description">
          {t(`modification.review.${type}.description`)}
        </p>
      </div>

      {type === "cancel" && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 review-cancel-alert">
          <div className="flex items-center gap-2 text-destructive mb-3 review-cancel-alert-title">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium review-cancel-alert-title-text">
              {t("modification.review.cancel.alert.title")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground review-cancel-alert-sub-title">
            {t("modification.review.cancel.alert.subTitle")}
          </p>
          {appointment.type === "cancel" &&
            appointment.action === "refund" &&
            appointment.refundPolicy === "forfeitDeposit" && (
              <p className="text-sm text-muted-foreground review-cancel-alert-sub-title">
                {t(
                  "modification.review.cancel.alert.forfeitDepositDescription",
                )}
              </p>
            )}
        </div>
      )}

      {/* Service Summary */}
      <div className="space-y-4 text-sm review-service-summary">
        <div className="flex justify-between py-2 border-b border-border review-service-summary-item">
          <span className="text-muted-foreground review-service-summary-item-label">
            {t("modification.review.service")}
          </span>
          <span className="font-medium text-foreground review-service-summary-item-value">
            {appointment.optionName}
          </span>
        </div>
        {appointment.addonsNames && appointment.addonsNames.length > 0 && (
          <div className="flex justify-between py-2 border-b border-border review-service-summary-item">
            <span className="text-muted-foreground review-service-summary-item-label">
              {t("modification.review.addons")}
            </span>
            <span className="font-medium text-foreground review-service-summary-item-value">
              {formatter.list(appointment.addonsNames)}
            </span>
          </div>
        )}
        <div className="flex justify-between py-2 border-b border-border review-service-summary-item">
          <span className="text-muted-foreground review-service-summary-item-label">
            {t("modification.review.originalDate")}
          </span>
          <span className="font-medium text-muted-foreground line-through review-service-summary-item-value">
            {DateTime.fromJSDate(appointment.dateTime)
              .setZone(appointment.timeZone)
              .toLocaleString(DateTime.DATE_HUGE, { locale })}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-border review-service-summary-item">
          <span className="text-muted-foreground review-service-summary-item-label">
            {t("modification.review.originalTime")}
          </span>
          <span className="font-medium text-muted-foreground line-through review-service-summary-item-value">
            {DateTime.fromJSDate(appointment.dateTime)
              .setZone(appointment.timeZone)
              .toLocaleString(DateTime.TIME_SIMPLE, { locale })}
          </span>
        </div>
        {type === "reschedule" && !!newDateTime && (
          <>
            <div className="flex justify-between py-2 border-b border-border review-service-summary-item">
              <span className="text-muted-foreground review-service-summary-item-label">
                {t("modification.review.newDate")}
              </span>
              <span className="font-medium text-primary review-service-summary-item-value">
                {newDateTime.toLocaleString(DateTime.DATE_HUGE, { locale })}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border review-service-summary-item">
              <span className="text-muted-foreground review-service-summary-item-label">
                {t("modification.review.newTime")}
              </span>
              <span className="font-medium text-primary review-service-summary-item-value">
                {newDateTime.toLocaleString(DateTime.TIME_SIMPLE, { locale })}
              </span>
            </div>
          </>
        )}
        <div className="flex justify-between py-2 border-b border-border review-service-summary-item">
          <span className="text-muted-foreground review-service-summary-item-label">
            {t("modification.review.duration")}
          </span>
          <span className="font-medium text-foreground review-service-summary-item-value">
            {t(
              "duration_hour_minutes_format",
              durationToTime(appointment.duration || 0),
            )}
          </span>
        </div>
        {!!appointment.price && (
          <div className="flex justify-between py-2 border-b border-border review-service-summary-item">
            <span className="text-muted-foreground review-service-summary-item-label">
              {t("modification.review.originalPrice")}
            </span>
            <span className="font-medium text-foreground review-service-summary-item-value">
              ${formatAmountString(appointment.price)}
            </span>
          </div>
        )}
        {appointment.type === "cancel" && appointment.action === "refund" && (
          <div className="flex justify-between py-2 border-b border-border review-service-summary-item">
            <span className="text-muted-foreground review-service-summary-item-label">
              {t("modification.review.cancel.refundAmount")}
            </span>
            <span className="font-medium text-destructive review-service-summary-item-value review-cancel-refund-amount">
              ${formatAmountString(appointment.refundAmount)}
            </span>
          </div>
        )}
        {((appointment.type === "cancel" && appointment.action === "payment") ||
          (appointment.type === "reschedule" &&
            appointment.reschedulePolicy === "paymentRequired")) &&
          !!appointment.paymentAmount && (
            <div className="flex justify-between py-2 border-b border-border review-service-summary-item">
              <span className="text-muted-foreground review-service-summary-item-label">
                {t(`modification.review.${type}.fee`)}
              </span>
              <span className="font-medium text-destructive review-service-summary-item-value review-cancel-payment-amount-required">
                ${formatAmountString(appointment.paymentAmount)}
              </span>
            </div>
          )}
      </div>

      {/* <div className="flex gap-2 items-center border border-border rounded-lg p-2 review-confirmation-checkbox-container">
        <Checkbox
          checked={confirmedByUser}
          onCheckedChange={(e) => setConfirmedByUser(!!e)}
          id="confirmedByUser"
          className="review-confirmation-checkbox"
        />
        <Label
          className="text-sm text-muted-foreground review-confirmation-checkbox-label"
          htmlFor="confirmedByUser"
        >
          {t(`modification.review.${type}.checkboxLabel`)}
        </Label>
      </div> */}
    </div>
  );
};

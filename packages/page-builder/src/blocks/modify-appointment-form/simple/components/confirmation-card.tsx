import { I18nRichText, useI18n, useLocale } from "@timelish/i18n";
import { Checkbox, Label } from "@timelish/ui";
import { formatAmountString } from "@timelish/utils";
import { DateTime as Luxon } from "luxon";
import { useModifyAppointmentFormContext } from "./context";

export const ConfirmationCard: React.FC = () => {
  const i18n = useI18n("translation");
  const {
    appointment,
    type,
    newDateTime,
    confirmedByUser,
    setConfirmedByUser,
  } = useModifyAppointmentFormContext();

  const locale = useLocale();

  if (!appointment?.allowed) return null;
  return (
    <div className="relative">
      <div className="mb-3 text-center">
        <h2>{i18n(`${type}_appointment_confirmation_title`)}</h2>
      </div>
      <div className="flex flex-col gap-4 flex-wrap">
        <div>
          {appointment.type === "cancel" && appointment.action === "refund" ? (
            <I18nRichText
              namespace="translation"
              text={`cancel_appointment_confirmation_${appointment.refundPolicy}_description`}
              args={{
                name: (appointment as any).name,
                service: (appointment as any).optionName,
                dateTime: Luxon.fromJSDate(
                  (appointment as any).dateTime,
                ).toLocaleString(Luxon.DATETIME_FULL, {
                  locale,
                }),
                refundPercentage: appointment.refundPercentage,
                refundAmount: formatAmountString(appointment.refundAmount),
                feesAmount: formatAmountString(appointment.feesAmount),
                refundFees: appointment.refundFees ? 1 : 0,
              }}
            />
          ) : appointment.type === "cancel" &&
            appointment.action === "payment" ? (
            <I18nRichText
              namespace="translation"
              text={`cancel_payment_${appointment.paymentPolicy === "paymentRequired" ? "partial" : "full_price"}_required_description`}
              args={{
                name: (appointment as any).name,
                service: (appointment as any).optionName,
                dateTime: Luxon.fromJSDate(
                  (appointment as any).dateTime,
                ).toLocaleString(Luxon.DATETIME_FULL, {
                  locale,
                }),
                amount: formatAmountString(appointment.paymentAmount),
                totalPrice: formatAmountString(appointment.price ?? 0),
              }}
            />
          ) : (
            <I18nRichText
              namespace="translation"
              text={`reschedule_appointment_confirmation_description`}
              args={{
                name: (appointment as any).name,
                service: (appointment as any).optionName,
                dateTime: Luxon.fromJSDate(
                  (appointment as any).dateTime,
                ).toLocaleString(Luxon.DATETIME_FULL, {
                  locale,
                }),
                newDateTime: newDateTime?.toLocaleString(Luxon.DATETIME_FULL, {
                  locale,
                }),
              }}
            />
          )}
        </div>
        <Label className="flex flex-row gap-2 items-center text-base">
          <Checkbox
            checked={confirmedByUser}
            onCheckedChange={(e) => setConfirmedByUser(!!e)}
          />
          <div className="cursor-pointer">
            {i18n(`${type}_appointment_confirmation_checkbox_label`)}
          </div>
        </Label>
      </div>
    </div>
  );
};

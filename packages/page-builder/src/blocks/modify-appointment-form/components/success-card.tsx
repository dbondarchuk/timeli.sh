import { useI18n, useLocale } from "@vivid/i18n";
import { DateTime as Luxon } from "luxon";
import { useModifyAppointmentFormContext } from "./context";

export const SuccessCard: React.FC = () => {
  const i18n = useI18n("translation");
  const { appointment, type, newDateTime } = useModifyAppointmentFormContext();

  const locale = useLocale();

  return (
    <div className="relative text-center">
      <div className="mb-3">
        <h2 className="text-lg font-bold">
          {i18n(`${type}_appointment_confirmation_success_title`)}
        </h2>
      </div>
      <div className="flex flex-row gap-2 justify-around flex-wrap">
        {i18n(`${type}_appointment_confirmation_success_message`, {
          name: (appointment as any).name,
          service: (appointment as any).optionName,
          dateTime: Luxon.fromJSDate(
            (appointment as any).dateTime,
          ).toLocaleString(Luxon.DATE_FULL, {
            locale,
          }),
          newDateTime: newDateTime?.toLocaleString(Luxon.DATE_FULL, {
            locale,
          }),
        })}
      </div>
    </div>
  );
};

import { useI18n } from "@timelish/i18n";
import { useScheduleContext } from "./context";

export const ConfirmationCard: React.FC = () => {
  const i18n = useI18n("translation");
  const { fields, appointmentOption } = useScheduleContext();

  return (
    <div className="relative text-center">
      <div className="mb-3">
        <h2 className="text-lg font-bold">
          {i18n("booking.confirmation.successTitle")}
        </h2>
      </div>
      <div className="flex flex-row gap-2 justify-around flex-wrap">
        {i18n("booking.confirmation.successMessage", {
          name: fields.name,
          service: appointmentOption.name,
        })}
      </div>
    </div>
  );
};

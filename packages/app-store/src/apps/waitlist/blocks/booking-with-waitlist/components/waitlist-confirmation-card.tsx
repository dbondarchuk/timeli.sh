import { useI18n } from "@timelish/i18n";
import {
  WaitlistPublicKeys,
  waitlistPublicNamespace,
  WaitlistPublicNamespace,
} from "../../../translations/types";
import { useScheduleContext } from "./context";

export const WaitlistConfirmationCard: React.FC = () => {
  const t = useI18n<WaitlistPublicNamespace, WaitlistPublicKeys>(
    waitlistPublicNamespace,
  );

  const { fields, appointmentOption } = useScheduleContext();

  return (
    <div className="relative text-center">
      <div className="mb-3">
        <h2 className="text-lg font-bold">{t("block.confirmation.title")}</h2>
      </div>
      <div className="flex flex-row gap-2 justify-around flex-wrap">
        {t("block.confirmation.message", {
          name: fields.name,
          service: appointmentOption.name,
        })}
      </div>
    </div>
  );
};

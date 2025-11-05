import { Button } from "@timelish/ui";
import { CalendarSync, CalendarX } from "lucide-react";
import { useModifyAppointmentFormContext } from "./context";
import { ModifyAppointmentType } from "./types";

export const TypeCard: React.FC = () => {
  const { setType, setStep } = useModifyAppointmentFormContext();

  const onClick = (type: ModifyAppointmentType) => {
    setType(type);
    setStep("form");
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-4 @container/type-card">
      <Button
        variant="outline"
        className="w-full h-36 flex-col gap-4 [&>svg]:size-12 text-2xl"
        onClick={() => onClick("cancel")}
      >
        <CalendarX />
        Cancel
      </Button>
      <Button
        variant="outline"
        className="w-full h-36 flex-col gap-4 [&>svg]:size-12 text-2xl"
        onClick={() => onClick("reschedule")}
      >
        <CalendarSync />
        Reschedule
      </Button>
    </div>
  );
};

import { useI18n } from "@vivid/i18n";
import { Button } from "@vivid/ui";
import { durationToTime } from "@vivid/utils";
import React from "react";
import { useScheduleContext } from "./context";

const durations = [15, 30, 45, 60, 90, 120];

export const DurationCard: React.FC = () => {
  const i18n = useI18n("translation");
  const { setDuration, duration } = useScheduleContext();

  return (
    <div className="relative text-center">
      <div className="mb-3">
        <h2>{i18n("duration_select_title")}</h2>
      </div>
      <div className="flex flex-row gap-2 justify-around flex-wrap">
        {durations.map((dur) => (
          <div className="" key={dur}>
            <Button
              className="w-36"
              variant={duration === dur ? "default" : "outline"}
              onClick={() => setDuration(duration === dur ? undefined : dur)}
            >
              {i18n("duration_hour_minutes_format", durationToTime(dur))}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

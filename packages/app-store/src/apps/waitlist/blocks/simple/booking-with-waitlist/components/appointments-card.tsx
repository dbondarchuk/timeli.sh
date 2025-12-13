import { useI18n } from "@timelish/i18n";
import { AppointmentChoice } from "@timelish/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Markdown,
} from "@timelish/ui";
import { durationToTime } from "@timelish/utils";
import { DollarSign, Timer } from "lucide-react";
import React from "react";
import {
  WaitlistPublicKeys,
  waitlistPublicNamespace,
  WaitlistPublicNamespace,
} from "../../../../translations/types";

export type AppointmentsCardProps = {
  options: AppointmentChoice[];
  className?: string;
  id?: string;
  onSelectOption: (slug: string) => void;
};

export const AppointmentsCard: React.FC<
  AppointmentsCardProps & React.HTMLAttributes<HTMLDivElement>
> = ({ options: meetings, className, id, onSelectOption, ...props }) => {
  const t = useI18n<WaitlistPublicNamespace, WaitlistPublicKeys>(
    waitlistPublicNamespace,
  );

  const onKeyPress = React.useCallback(
    (id: string, event: React.KeyboardEvent<any>) => {
      if (event.key === "Enter" || event.key === " ") {
        onSelectOption(id);
        event.preventDefault();
      }
    },
    [onSelectOption],
  );

  return (
    <div className={className} id={id} {...props}>
      {meetings.map((option) => {
        return (
          <Card
            key={option._id}
            onClick={() => onSelectOption(option._id)}
            onKeyDown={(e) => onKeyPress(option._id, e)}
            className="cursor-pointer flex flex-col justify-between"
            tabIndex={1}
            aria-describedby={`option-${option._id}`}
            role="button"
          >
            <CardHeader id={`option-${option._id}`}>
              <div className="flex flex-col grow gap-2">
                <CardTitle>{option.name}</CardTitle>
                <CardDescription className="flex flex-col gap-2">
                  <div
                    className="flex flex-row items-center"
                    aria-label={
                      option.duration
                        ? t(
                            "block.durationHourMinFormat",
                            durationToTime(option.duration),
                          )
                        : t("block.customDurationLabel")
                    }
                  >
                    <Timer className="mr-1" />
                    {option.duration
                      ? t(
                          "block.durationHourMinFormat",
                          durationToTime(option.duration),
                        )
                      : t("block.customDuration")}
                  </div>
                  {!!option.price && (
                    <div
                      className="flex flex-row items-center"
                      aria-label={t("block.customDuration", {
                        price: option.price.toFixed(2).replace(/\.00$/, ""),
                      })}
                    >
                      <DollarSign className="mr-1" aria-label="" />
                      {option.price.toFixed(2).replace(/\.00$/, "")}
                    </div>
                  )}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Markdown markdown={option.description} prose="simple" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

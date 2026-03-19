import { useI18n } from "@timelish/i18n";
import { AppointmentChoice } from "@timelish/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Markdown,
  useCurrencyFormat,
} from "@timelish/ui";
import { durationToTime } from "@timelish/utils";
import { DollarSign, Timer } from "lucide-react";
import React from "react";

export type AppointmentsCardProps = {
  options: AppointmentChoice[];
  className?: string;
  id?: string;
  onSelectOption: (slug: string) => void;
};

export const AppointmentsCard: React.FC<
  AppointmentsCardProps & React.HTMLAttributes<HTMLDivElement>
> = ({ options: meetings, className, id, onSelectOption, ...props }) => {
  const i18n = useI18n("translation");
  const currencyFormat = useCurrencyFormat();

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
                      option.durationType === "fixed"
                        ? i18n(
                            "common.formats.formDurationHourMinutesLabel",
                            durationToTime(option.duration),
                          )
                        : i18n("common.formats.customDurationLabel")
                    }
                  >
                    <Timer className="mr-1" />
                    {option.durationType === "fixed"
                      ? i18n(
                          "common.formats.durationHourMin",
                          durationToTime(option.duration),
                        )
                      : i18n("common.labels.durationCustom")}
                  </div>
                  {option.durationType === "fixed" && !!option.price && (
                    <div
                      className="flex flex-row items-center"
                      aria-label={i18n("common.formats.formPriceLabel", {
                        price: currencyFormat(option.price),
                      })}
                    >
                      <DollarSign className="mr-1" aria-label="" />
                      {currencyFormat(option.price)}
                    </div>
                  )}
                  {option.durationType === "flexible" &&
                    !!option.pricePerHour && (
                      <div
                        className="flex flex-row items-center"
                        aria-label={i18n("common.formats.formPriceLabel", {
                          price: currencyFormat(option.pricePerHour),
                        })}
                      >
                        <DollarSign className="mr-1" aria-label="" />
                        {i18n("booking.option.price_per_hour", {
                          price: currencyFormat(option.pricePerHour),
                        })}
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

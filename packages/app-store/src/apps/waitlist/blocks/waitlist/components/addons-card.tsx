import { useI18n } from "@vivid/i18n";
import { AppointmentAddon } from "@vivid/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Markdown,
} from "@vivid/ui";
import { durationToTime } from "@vivid/utils";
import { DollarSign, Timer } from "lucide-react";
import React from "react";
import {
  WaitlistPublicKeys,
  WaitlistPublicNamespace,
  waitlistPublicNamespace,
} from "../../../translations/types";
import { useScheduleContext } from "./context";

export const AddonsCard: React.FC = () => {
  const t = useI18n<WaitlistPublicNamespace, WaitlistPublicKeys>(
    waitlistPublicNamespace,
  );

  const { appointmentOption, setSelectedAddons, selectedAddons, className } =
    useScheduleContext();

  const onClick = (option: AppointmentAddon): void => {
    const index = (selectedAddons || []).findIndex(
      (addon) => addon._id === option._id,
    );

    if (index < 0) {
      setSelectedAddons([...(selectedAddons || []), option]);
    } else {
      setSelectedAddons([
        ...(selectedAddons || []).slice(0, index),
        ...(selectedAddons || []).slice(index + 1),
      ]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-center">
        <h2 className="text-xl">{t("block.selectAddonsLabel")}</h2>
      </div>
      <div className={className}>
        {(appointmentOption.addons || []).map((addon) => {
          return (
            <Card
              key={addon._id}
              onClick={() => onClick(addon)}
              className="cursor-pointer flex flex-col justify-between"
            >
              <CardHeader
                className="flex flex-row w-full"
                id={`addon-${addon._id}`}
              >
                <div className="flex flex-col grow gap-2">
                  <CardTitle className="mt-0">{addon.name}</CardTitle>
                  <CardDescription className="flex flex-col gap-2">
                    {addon.duration && (
                      <div
                        className="flex flex-row items-center"
                        aria-label={t(
                          "block.durationFormat",
                          durationToTime(addon.duration),
                        )}
                      >
                        <Timer className="mr-1" />
                        {t(
                          "block.durationHourMinFormat",
                          durationToTime(addon.duration),
                        )}
                      </div>
                    )}
                    {addon.price && (
                      <div
                        className="flex flex-row items-center"
                        aria-label={t("block.priceFormat", {
                          price: addon.price.toFixed(2).replace(/\.00$/, ""),
                        })}
                      >
                        <DollarSign className="mr-1" />
                        {addon.price.toFixed(2).replace(/\.00$/, "")}
                      </div>
                    )}
                  </CardDescription>
                </div>
                <div className="flex place-content-start">
                  <Checkbox
                    aria-describedby={`addon-${addon._id}`}
                    checked={selectedAddons?.some((a) => a._id === addon._id)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Markdown markdown={addon.description} prose="simple" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

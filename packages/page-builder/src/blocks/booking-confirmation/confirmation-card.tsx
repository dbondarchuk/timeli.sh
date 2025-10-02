"use client";

import { useI18n } from "@vivid/i18n";
import { Appointment } from "@vivid/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
} from "@vivid/ui";
import { durationToTime } from "@vivid/utils";
import { DollarSign, Timer } from "lucide-react";
import { forwardRef } from "react";

export const ConfirmationCard = forwardRef<
  HTMLDivElement,
  {
    appointment: Appointment;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    className?: string;
    id?: string;
  }
>(({ appointment, onClick, className, id }, ref) => {
  const i18n = useI18n("translation");

  return (
    <Card
      className={cn("sm:min-w-min md:w-full", className)}
      id={id}
      onClick={onClick}
      ref={ref}
    >
      {appointment?.option && appointment.fields ? (
        <>
          <CardHeader className="text-center">
            <CardTitle>{appointment.option.name}</CardTitle>
            <CardDescription className="flex flex-row gap-2 justify-center place-items-center">
              {appointment.totalDuration && (
                <div className="flex flex-row items-center">
                  <Timer className="mr-1" />
                  {i18n(
                    "duration_hour_min_format",
                    durationToTime(appointment.totalDuration),
                  )}
                </div>
              )}
              {appointment.totalPrice && (
                <div className="flex flex-row items-center">
                  <DollarSign className="mr-1" />
                  {appointment.totalPrice.toFixed(2).replace(/\.00$/, "")}
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative text-center">
              <div className="mb-3">
                <h2 className="text-lg font-bold">
                  {i18n("confirmation_success_title")}
                </h2>
              </div>
              <div className="flex flex-row gap-2 justify-around flex-wrap">
                {i18n("confirmation_success_message", {
                  name: appointment.fields.name,
                  service: appointment.option.name,
                })}
              </div>
            </div>
          </CardContent>
        </>
      ) : (
        <CardContent>
          <div className="relative text-center">
            <h2>{i18n("appointment_fetch_failed_title")}</h2>
          </div>
        </CardContent>
      )}
    </Card>
  );
});

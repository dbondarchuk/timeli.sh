"use client";

import { useI18n, useLocale } from "@timelish/i18n";
import type { Appointment } from "@timelish/types";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Heading,
  Link,
} from "@timelish/ui";
import { durationToTime } from "@timelish/utils";
import {
  Calendar,
  CalendarCheck2,
  CalendarX2,
  CheckCircle,
  Clock,
  DollarSign,
  Presentation,
  StickyNote,
} from "lucide-react";
import { DateTime } from "luxon";
import React from "react";
import { AppointmentActionButton } from "./action-button";
import { AppointmentDeclineDialog } from "./appointment-decline-dialog";

export type AppointmentCardProps = {
  appointment: Appointment;
  timeZone?: string;
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  timeZone = "local",
}) => {
  const t = useI18n("admin");
  const locale = useLocale();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="w-full flex flex-row justify-between items-center">
          <Heading
            title={appointment.option.name}
            description={t.rich("appointments.card.by", {
              name: appointment.customer?.name ?? appointment.fields.name,
              link: (chunks: any) => (
                <Link
                  href={`/dashboard/customers/${appointment.customerId}`}
                  variant="underline"
                >
                  {chunks}
                </Link>
              ),
            })}
            href={`/dashboard/appointments/${appointment._id}`}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm flex flex-col w-full @container [contain:layout]">
        <dl className="divide-y">
          <div className="py-1 flex flex-row gap-2 flex-wrap @sm:py-2 @sm:grid @sm:grid-cols-3 @sm:gap-4">
            <dt className="flex self-center items-center gap-1">
              <Presentation size={16} /> {t("appointments.card.appointment")}:
            </dt>
            <dd className="col-span-2">{appointment.option.name}</dd>
          </div>
          <div className="py-1 flex flex-row gap-2 flex-wrap @sm:py-2 @sm:grid @sm:grid-cols-3 @sm:gap-4">
            <dt className="flex self-center items-center gap-1">
              <CheckCircle size={16} /> {t("appointments.card.status")}:
            </dt>
            <dd className="col-span-2">
              {t(`appointments.status.${appointment.status}`)}
            </dd>
          </div>
          <div className="py-1 flex flex-row gap-2 flex-wrap @sm:py-2 @sm:grid @sm:grid-cols-3 @sm:gap-4">
            <dt className="flex self-center items-center gap-1">
              <Calendar size={16} /> {t("appointments.card.dateTime")}:
            </dt>
            <dd className="col-span-2">
              {DateTime.fromJSDate(appointment.dateTime, {
                zone: timeZone,
              }).toLocaleString(DateTime.DATETIME_SHORT, { locale })}
            </dd>
          </div>
          <div className="py-1 flex flex-row gap-2 flex-wrap @sm:py-2 @sm:grid @sm:grid-cols-3 @sm:gap-4">
            <dt className="flex self-center items-center gap-1">
              <Clock size={16} /> {t("appointments.card.duration")}:
            </dt>
            <dd className="col-span-2">
              {t(
                "common.timeDuration",
                durationToTime(appointment.totalDuration),
              )}
            </dd>
          </div>
          <div className="py-1 flex flex-row gap-2 flex-wrap @sm:py-2 @sm:grid @sm:grid-cols-3 @sm:gap-4">
            <dt className="flex self-center items-center gap-1">
              <Calendar size={16} /> {t("appointments.card.endsAt")}:
            </dt>
            <dd className="col-span-2">
              {DateTime.fromJSDate(appointment.dateTime, {
                zone: timeZone,
              })
                .plus({ minutes: appointment.totalDuration })
                .toLocaleString(DateTime.DATETIME_SHORT, { locale })}
            </dd>
          </div>
          {appointment.totalPrice && (
            <div className="py-1 flex flex-row gap-2 flex-wrap @sm:py-2 @sm:grid @sm:grid-cols-3 @sm:gap-4">
              <dt className="flex self-center items-center gap-1">
                <DollarSign size={16} /> {t("appointments.card.price")}:
              </dt>
              <dd className="col-span-2">${appointment.totalPrice}</dd>
            </div>
          )}
          {appointment.note && (
            <div className="py-1 flex flex-row gap-2 flex-wrap @sm:py-2 @sm:grid @sm:grid-cols-3 @sm:gap-4">
              <dt className="flex self-center items-center gap-1">
                <StickyNote size={16} /> {t("appointments.card.note")}:
              </dt>
              <dd className="col-span-2">{appointment.note}</dd>
            </div>
          )}
        </dl>
      </CardContent>
      {appointment.status !== "declined" && (
        <CardFooter className="justify-end gap-2">
          <AppointmentDeclineDialog
            appointment={appointment}
            trigger={
              <Button
                variant="destructive"
                className="inline-flex flex-row gap-2 items-center"
              >
                <CalendarX2 size={20} /> {t("appointments.card.decline")}
              </Button>
            }
          />
          {appointment.status === "pending" && (
            <AppointmentActionButton
              variant="default"
              _id={appointment._id}
              status="confirmed"
            >
              <CalendarCheck2 size={20} />
              {t("appointments.card.confirm")}
            </AppointmentActionButton>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

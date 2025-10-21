"use client";

import { useI18n } from "@vivid/i18n";

import { Appointment, AppointmentStatus } from "@vivid/types";
import {
  Button,
  Link,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@vivid/ui";
import {
  CalendarCheck2,
  CalendarCog,
  CalendarSearch,
  CalendarSync,
  CalendarX2,
  Send,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import React from "react";
import { RecentCommunications } from "../communications/communications";
import { SendCommunicationDialog } from "../communications/send-message-dialog";
import { AppointmentActionButton } from "./action-button";
import { AppointmentDeclineDialog } from "./appointment-decline-dialog";
import { AppointmentRescheduleDialog } from "./appointment-reschedule-dialog";
import { AppointmentDetails } from "./tabs/details";
import { AppointmentFiles } from "./tabs/files";
import { AppointmentHistory } from "./tabs/history";
import { PaymentsTab } from "./tabs/payments";

const views = [
  "details",
  "payments",
  "files",
  "communications",
  "history",
] as const;
type View = (typeof views)[number];

export const AppointmentView: React.FC<{
  appointment: Appointment;
  view?: View;
}> = ({ appointment: propAppointment, view }) => {
  const t = useI18n("admin");

  const [key, setKey] = React.useState<string>();
  const params = useSearchParams();
  const defaultView = view ?? params.get("view") ?? "details";

  const [appointment, setAppointment] = React.useState(propAppointment);

  const reschedule = ({
    dateTime,
    duration,
  }: {
    dateTime: Date;
    duration: number;
  }) => {
    setAppointment((prev) => ({
      ...prev,
      dateTime,
      totalDuration: duration,
    }));

    setKey(new Date().getTime().toString());
  };

  const updateStatus = (newStatus: AppointmentStatus) => {
    setAppointment((prev) => ({
      ...prev,
      status: newStatus,
    }));

    setKey(new Date().getTime().toString());
  };

  return (
    <div className="flex flex-col gap-4 w-full @container [contain:layout]">
      <div className="flex flex-row justify-end gap-2 flex-wrap [&>form]:hidden">
        <SendCommunicationDialog
          appointmentId={appointment._id}
          onSuccess={() => setKey(new Date().getTime().toString())}
        >
          <Button variant="secondary">
            <Send /> {t("appointments.view.sendMessage")}
          </Button>
        </SendCommunicationDialog>
        <Link
          className="inline-flex flex-row gap-2 items-center"
          variant="outline"
          button
          href={`/admin/dashboard/appointments/new?from=${appointment._id}`}
        >
          <CalendarSync size={20} /> {t("appointments.view.scheduleAgain")}
        </Link>

        {appointment.status !== "declined" ? (
          <>
            <AppointmentRescheduleDialog
              appointment={appointment}
              onRescheduled={reschedule}
              trigger={
                <Button
                  variant="outline"
                  className="inline-flex flex-row gap-2 items-center"
                >
                  <CalendarSearch size={20} />
                  {t("appointments.view.reschedule")}
                </Button>
              }
            />
            <Link
              className="inline-flex flex-row gap-2 items-center"
              variant="outline"
              button
              href={`/admin/dashboard/appointments/${appointment._id}/edit`}
            >
              <CalendarCog size={20} /> {t("appointments.view.edit")}
            </Link>
            <AppointmentDeclineDialog
              appointment={appointment}
              onSuccess={updateStatus}
              trigger={
                <Button
                  variant="destructive"
                  className="inline-flex flex-row gap-2 items-center"
                >
                  <CalendarX2 size={20} /> {t("appointments.view.decline")}
                </Button>
              }
            />
          </>
        ) : null}

        {appointment.status === "pending" ? (
          <AppointmentActionButton
            variant="default"
            _id={appointment._id}
            status="confirmed"
            className="gap-2"
            onSuccess={updateStatus}
          >
            <CalendarCheck2 size={20} /> {t("appointments.view.confirm")}
          </AppointmentActionButton>
        ) : null}
      </div>

      <Tabs defaultValue={defaultView} className="flex flex-col gap-2 mb-4">
        {/* <TabsList className="w-fit self-end"> */}
        <TabsList className="w-full [&>button]:flex-1 bg-card border flex-wrap h-auto">
          <TabsTrigger value="details">
            {t("appointments.view.details")}
          </TabsTrigger>
          <TabsTrigger value="payments">
            {t("appointments.view.payments")}
          </TabsTrigger>
          <TabsTrigger value="files">
            {t("appointments.view.files")}
          </TabsTrigger>
          <TabsTrigger value="communications">
            {t("appointments.view.communications")}
          </TabsTrigger>
          <TabsTrigger value="history">
            {t("appointments.view.history")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <AppointmentDetails appointment={appointment} key={key} />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsTab appointment={appointment} key={key} />
        </TabsContent>
        <TabsContent value="files">
          <AppointmentFiles appointment={appointment} key={key} />
        </TabsContent>
        <TabsContent value="communications">
          <RecentCommunications appointmentId={appointment._id} key={key} />
        </TabsContent>
        <TabsContent value="history">
          <AppointmentHistory appointmentId={appointment._id} key={key} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

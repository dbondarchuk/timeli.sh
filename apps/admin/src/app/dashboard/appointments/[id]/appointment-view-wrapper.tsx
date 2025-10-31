import { getI18nAsync } from "@vivid/i18n/server";
import { Breadcrumbs, Heading } from "@vivid/ui";
import { AppointmentView } from "@vivid/ui-admin-kit";
import { notFound } from "next/navigation";
import React from "react";
import { AppointmentDeclineDialogWrapper } from "./appointment-decline-dialog";
import { getAppointment } from "./cached";

export const AppointmentViewWrapper: React.FC<{
  appointmentId: string;
  shouldShowDeclineModal?: boolean;
}> = async ({ appointmentId, shouldShowDeclineModal }) => {
  const t = await getI18nAsync("admin");
  const appointment = await getAppointment(appointmentId);

  if (!appointment) {
    return notFound();
  }

  const breadcrumbItems = [
    { title: t("navigation.dashboard"), link: "/dashboard" },
    {
      title: t("navigation.appointments"),
      link: "/dashboard/appointments",
    },
    { title: appointment.option.name, link: "/dashboard/appointments" },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-4 justify-between">
        <Breadcrumbs items={breadcrumbItems} />
        <Heading
          title={appointment.option.name}
          description={t("appointments.detail.by", {
            name: appointment.fields.name,
          })}
        />
        {/* <Separator /> */}
      </div>
      <AppointmentView appointment={appointment} />
      {shouldShowDeclineModal && (
        <AppointmentDeclineDialogWrapper appointment={appointment} />
      )}
    </div>
  );
};

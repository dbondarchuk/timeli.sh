import { getI18nAsync } from "@vivid/i18n/server";
import { ServicesContainer } from "@vivid/services";
import { Card, CardContent, CardHeader } from "@vivid/ui";
import { AppointmentCard } from "@vivid/ui-admin-kit";
import { DateTime } from "luxon";
import React from "react";

export const PendingAppointmentsTab: React.FC = async () => {
  const t = await getI18nAsync("admin");
  const beforeNow = DateTime.now().minus({ hours: 1 }).toJSDate();
  const pendingAppointments =
    await ServicesContainer.EventsService().getPendingAppointments(
      20,
      beforeNow,
    );

  const { timeZone } =
    await ServicesContainer.ConfigurationService().getConfiguration("general");

  return (
    <>
      {pendingAppointments.total === 0 ? (
        <Card>
          <CardHeader className="flex text-center font-medium text-lg">
            {t("dashboard.appointments.noPendingAppointments")}
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            {t("dashboard.appointments.caughtUp")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {pendingAppointments.items.map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              timeZone={timeZone}
              appointment={appointment}
            />
          ))}
        </div>
      )}
    </>
  );
};

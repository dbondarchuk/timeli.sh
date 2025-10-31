import { getI18nAsync } from "@vivid/i18n/server";
import { Card, CardContent } from "@vivid/ui";
import { AppointmentCard } from "@vivid/ui-admin-kit";
import { DateTime } from "luxon";
import React from "react";
import { getServicesContainer } from "../utils";

export const NextAppointmentsCards: React.FC = async () => {
  const t = await getI18nAsync("admin");
  const servicesContainer = await getServicesContainer();
  const nextAppointments =
    await servicesContainer.eventsService.getNextAppointments(
      DateTime.now().toJSDate(),
      3,
    );

  const { timeZone } =
    await servicesContainer.configurationService.getConfiguration("general");

  return (
    <div className="flex flex-col gap-2">
      {!nextAppointments.length && (
        <Card>
          <CardContent className="flex justify-center py-4">
            {t("dashboard.appointments.noAppointments")}
          </CardContent>
        </Card>
      )}
      {nextAppointments.map((appointment) => (
        <AppointmentCard
          appointment={appointment}
          timeZone={timeZone}
          key={appointment._id}
        />
      ))}
    </div>
  );
};

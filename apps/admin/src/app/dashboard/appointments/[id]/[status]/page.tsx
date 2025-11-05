import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@timelish/logger";
import { notFound, redirect } from "next/navigation";

type Props = PageProps<"/dashboard/appointments/[id]/[status]">;

export default async function Page(props: Props) {
  const logger = getLoggerFactory("AdminPages")("appointment-status-change");
  const params = await props.params;
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      appointmentId: params.id,
      status: params.status,
    },
    "Processing appointment status change",
  );

  switch (params.status) {
    case "confirm":
      await servicesContainer.eventsService.changeAppointmentStatus(
        params.id,
        "confirmed",
      );

      logger.debug(
        {
          appointmentId: params.id,
          newStatus: "confirmed",
        },
        "Appointment confirmed, redirecting",
      );

      redirect(`/dashboard/appointments/${params.id}`);

    case "decline":
      // await ServicesContainer.EventsService().changeAppointmentStatus(
      //   params.id,
      //   "declined"
      // );

      logger.debug(
        {
          appointmentId: params.id,
          action: "decline",
        },
        "Appointment decline requested, redirecting with decline modal",
      );

      redirect(`/dashboard/appointments/${params.id}?decline`);

    default:
      return notFound();
  }
}

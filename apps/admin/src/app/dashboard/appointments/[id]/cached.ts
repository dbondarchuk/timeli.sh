import { getServicesContainer } from "@/app/utils";
import { cache } from "react";

export const getAppointment = cache(async (id: string) => {
  const servicesContainer = await getServicesContainer();
  return await servicesContainer.bookingService.getAppointment(id);
});

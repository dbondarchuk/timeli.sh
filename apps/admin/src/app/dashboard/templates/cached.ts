import { getServicesContainer } from "@/app/utils";
import { cache } from "react";

export const getTemplate = cache(async (id: string) => {
  const servicesContainer = await getServicesContainer();
  return await servicesContainer.templatesService.getTemplate(id);
});

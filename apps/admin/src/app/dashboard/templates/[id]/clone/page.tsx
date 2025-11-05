import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@timelish/logger";
import { notFound, redirect } from "next/navigation";

type Props = PageProps<"/dashboard/templates/[id]/clone">;

export default async function CloneTemplatePage(props: Props) {
  const logger = getLoggerFactory("AdminPages")("clone-template");
  const { id } = await props.params;
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      templateId: id,
    },
    "Starting template clone operation",
  );

  const template = await servicesContainer.templatesService.getTemplate(id);
  if (!template) {
    logger.warn({ templateId: id }, "Template not found for cloning");
    notFound();
  }

  const { updatedAt: _, _id: __, ...newTemplate } = template;
  newTemplate.name = template.name + " Copy";

  logger.debug(
    {
      originalTemplateId: id,
      originalName: template.name,
      newName: newTemplate.name,
    },
    "Creating cloned template",
  );

  const { _id } =
    await servicesContainer.templatesService.createTemplate(newTemplate);

  logger.debug(
    {
      originalTemplateId: id,
      newTemplateId: _id,
      newName: newTemplate.name,
    },
    "Template cloned successfully, redirecting",
  );

  redirect(`/dashboard/templates/${_id}`);
}

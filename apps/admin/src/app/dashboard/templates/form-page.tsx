import { getServicesContainer, getWebsiteUrl } from "@/app/utils";
import { TemplateForm } from "@/components/admin/templates/form";
import { TemplatesTemplate } from "@/components/admin/templates/templates/type";
import { getI18nAsync } from "@vivid/i18n/server";
import { CommunicationChannel, Template } from "@vivid/types";
import { Breadcrumbs } from "@vivid/ui";
import {
  demoAppointment,
  demoWaitlistEntry,
  getAdminUrl,
  getArguments,
} from "@vivid/utils";
import { notFound } from "next/navigation";
import React from "react";
import { getTemplate } from "./cached";

export const TemplateFormPage: React.FC<
  | {
      type: CommunicationChannel;
      template?: TemplatesTemplate;
    }
  | {
      id: string;
    }
> = async (props) => {
  const t = await getI18nAsync("admin");
  const servicesContainer = await getServicesContainer();
  const adminUrl = getAdminUrl();
  const websiteUrl = await getWebsiteUrl();
  const config = await servicesContainer.configurationService.getConfigurations(
    "booking",
    "general",
    "social",
  );

  const demoArguments = getArguments({
    appointment: demoAppointment,
    config,
    adminUrl,
    websiteUrl,
    customer: demoAppointment.customer,
    locale: config.general.language,
    additionalProperties: {
      waitlistEntry: demoWaitlistEntry,
    },
  });

  let initialData: Template | undefined;
  let type: CommunicationChannel;
  let template: TemplatesTemplate | undefined;
  if ("id" in props) {
    const data = await getTemplate(props.id);
    if (!data) {
      notFound();
    }

    initialData = data;
    type = data.type;
  } else {
    type = props.type;
    template = props.template;
  }

  const breadcrumbItems = [
    { title: t("navigation.dashboard"), link: "/dashboard" },
    {
      title: t("navigation.communications"),
      link: "/dashboard/communication-logs",
    },
    { title: t("navigation.templates"), link: "/dashboard/templates" },
    {
      title: t(`common.labels.channel.${type}`),
      link: `/dashboard/templates?type=${encodeURIComponent(type)}`,
    },
  ];

  if (initialData) {
    breadcrumbItems.push({
      title: initialData.name,
      link: `/dashboard/templates/${type}/${initialData._id}`,
    });
  } else {
    breadcrumbItems.push({
      title: t("templates.formPage.new"),
      link: `/dashboard/templates/${type}/new`,
    });
  }

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      {initialData ? (
        <TemplateForm args={demoArguments} initialData={initialData} />
      ) : (
        <TemplateForm args={demoArguments} type={type} template={template} />
      )}
    </>
  );
};

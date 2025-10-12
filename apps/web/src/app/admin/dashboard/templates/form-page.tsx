import { TemplateForm } from "@/components/admin/templates/form";
import { TemplatesTemplate } from "@/components/admin/templates/templates/type";
import { getI18nAsync } from "@vivid/i18n/server";
import { ServicesContainer } from "@vivid/services";
import { CommunicationChannel, Template } from "@vivid/types";
import { Breadcrumbs } from "@vivid/ui";
import { demoAppointment, demoWaitlistEntry, getArguments } from "@vivid/utils";
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
  const config =
    await ServicesContainer.ConfigurationService().getConfigurations(
      "booking",
      "general",
      "social",
    );

  const demoArguments = getArguments({
    appointment: demoAppointment,
    config,
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
    { title: t("navigation.dashboard"), link: "/admin/dashboard" },
    {
      title: t("navigation.communications"),
      link: "/admin/dashboard/communication-logs",
    },
    { title: t("navigation.templates"), link: "/admin/dashboard/templates" },
    {
      title: t(`common.labels.channel.${type}`),
      link: `/admin/dashboard/templates?type=${encodeURIComponent(type)}`,
    },
  ];

  if (initialData) {
    breadcrumbItems.push({
      title: initialData.name,
      link: `/admin/dashboard/templates/${type}/${initialData._id}`,
    });
  } else {
    breadcrumbItems.push({
      title: t("templates.formPage.new"),
      link: `/admin/dashboard/templates/${type}/new`,
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

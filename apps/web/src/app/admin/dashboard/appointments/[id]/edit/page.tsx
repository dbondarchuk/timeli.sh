import PageContainer from "@/components/admin/layout/page-container";
import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { AppointmentChoice } from "@vivid/types";
import { Breadcrumbs, Heading } from "@vivid/ui";
import {
  AppointmentScheduleForm,
  AppointmentScheduleFormFrom,
} from "@vivid/ui-admin-kit";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("appointments.edit.title"),
  };
}

export default async function NewAssetsPage(props: Props) {
  const t = await getI18nAsync("admin");
  const logger = getLoggerFactory("AdminPages")("edit-appointment");
  const { id } = await props.params;

  logger.debug(
    {
      id,
    },
    "Loading edit appointment page",
  );

  const config =
    await ServicesContainer.ConfigurationService().getConfiguration("booking");
  const [fields, addons, options] = await Promise.all([
    ServicesContainer.ServicesService().getFields({}),
    ServicesContainer.ServicesService().getAddons({}),
    ServicesContainer.ServicesService().getOptions({}),
  ]);

  const optionsChoices = (config.options || [])
    .map((o) => options.items?.find(({ _id }) => o.id == _id))
    .filter((o) => !!o);

  const choices: AppointmentChoice[] = optionsChoices.map((option) => ({
    ...option,
    addons:
      option.addons
        ?.map((f) => addons.items?.find((x) => x._id === f.id))
        .filter((f) => !!f) || [],
  }));

  const appointment =
    await ServicesContainer.EventsService().getAppointment(id);

  if (!appointment) {
    logger.warn({ id }, "Appointment not found");
    return notFound();
  }

  const breadcrumbItems = [
    { title: t("navigation.dashboard"), link: "/admin/dashboard" },
    {
      title: t("navigation.appointments"),
      link: "/admin/dashboard/appointments",
    },
    {
      title: appointment.option.name,
      link: `/admin/dashboard/appointments/${id}`,
    },
    {
      title: t("appointments.edit.title"),
      link: `/admin/dashboard/appointments/${id}/edit`,
    },
  ];

  logger.debug(
    {
      id,
      optionsCount: choices.length,
      fieldsCount: fields.items?.length || 0,
      addonsCount: addons.items?.length || 0,
    },
    "Edit appointment page loaded",
  );

  const from: AppointmentScheduleFormFrom = {
    optionId: appointment.option._id,
    addonsIds: appointment.addons?.map((addon) => addon._id),
    customerId: appointment.customer._id,
    fields: appointment.fields,
    dateTime: appointment.dateTime,
    totalDuration: appointment.totalDuration,
    totalPrice: appointment.totalPrice,
    note: appointment.note,
    status: appointment.status,
    discount: appointment.discount,
  };

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <Heading
            title={t("appointments.edit.title")}
            description={t("appointments.edit.description")}
          />
        </div>
        <AppointmentScheduleForm
          options={choices}
          knownFields={fields.items || []}
          from={from}
          isEdit={true}
          id={id}
          customer={appointment.customer}
        />
      </div>
    </PageContainer>
  );
}

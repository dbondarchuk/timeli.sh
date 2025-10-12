import {
  AppointmentScheduleForm,
  AppointmentScheduleFormFrom,
} from "@/components/admin/appointments/appointment-form";
import PageContainer from "@/components/admin/layout/page-container";
import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { AppointmentChoice } from "@vivid/types";
import { Breadcrumbs, Heading } from "@vivid/ui";
import { Metadata } from "next";
import { searchParamsCache } from "./search-params";

type Props = {
  searchParams: Promise<{
    from?: string;
    fromValue?: string;
    customer?: string;
    data?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("appointments.new.title"),
  };
}

export default async function NewAppointmentPage(props: Props) {
  const t = await getI18nAsync("admin");
  const logger = getLoggerFactory("AdminPages")("new-appointment");
  const awaitedSearchParams = await props.searchParams;
  const searchParams = searchParamsCache.parse(awaitedSearchParams);

  logger.debug(
    {
      from: searchParams.from,
      customer: searchParams.customer,
      fromValue: searchParams.fromValue ? "yes" : "no",
      data: searchParams.data ? "yes" : "no",
    },
    "Loading new appointment page",
  );

  const breadcrumbItems = [
    { title: t("navigation.dashboard"), link: "/admin/dashboard" },
    {
      title: t("navigation.appointments"),
      link: "/admin/dashboard/appointments",
    },
    {
      title: t("appointments.new.title"),
      link: "/admin/dashboard/appointments/new",
    },
  ];

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

  const appointment = searchParams?.from
    ? await ServicesContainer.EventsService().getAppointment(searchParams.from)
    : undefined;

  const from: AppointmentScheduleFormFrom | undefined = appointment
    ? {
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
        data: searchParams.data as Record<string, any>,
      }
    : (searchParams.fromValue ?? undefined);

  const customer =
    !from && searchParams.customer
      ? await ServicesContainer.CustomersService().getCustomer(
          searchParams.customer,
        )
      : undefined;

  logger.debug(
    {
      from: searchParams.from,
      fromValue: searchParams.fromValue ? "yes" : "no",
      customer: searchParams.customer,
      hasFromAppointment: !!from,
      hasCustomer: !!customer,
      optionsCount: choices.length,
      fieldsCount: fields.items?.length || 0,
      addonsCount: addons.items?.length || 0,
    },
    "New appointment page loaded",
  );

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col gap-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex flex-row items-center gap-4 justify-between">
          <Heading
            title={t("appointments.new.title")}
            description={t("appointments.new.description")}
          />
          {/* {waitlist && (
            <Dialog>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button variant="ghost">
                        <CalendarClock className="size-4" />
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t("appointments.new.waitlistEntry")}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DialogContent className="@container">
                <DialogHeader>
                  <DialogTitle>
                    {t("appointments.new.waitlistEntry")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("appointments.new.waitlistEntryDescription")}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                  <WaitlistCardContent entry={waitlist} />
                </ScrollArea>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">
                      {t("common.buttons.close")}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )} */}
        </div>
        <AppointmentScheduleForm
          options={choices}
          knownFields={fields.items || []}
          from={from}
          isEdit={false}
          customer={customer}
        />
      </div>
    </PageContainer>
  );
}

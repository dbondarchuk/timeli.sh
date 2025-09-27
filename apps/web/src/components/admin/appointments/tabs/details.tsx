"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n, useLocale } from "@vivid/i18n";
import { Appointment, timeZones } from "@vivid/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Link,
  Textarea,
  toastPromise,
  useTimeZone,
} from "@vivid/ui";
import { durationToTime, formatAmountString } from "@vivid/utils";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateAppointmentNote } from "../actions";
import { AppointmentCalendar } from "../appointment-calendar";

const noteFormSchema = z.object({
  note: z.string().optional(),
});

type NoteFormSchema = z.infer<typeof noteFormSchema>;

type AppointmentDetailsProps = {
  appointment: Appointment;
};

export const AppointmentDetails = ({
  appointment,
}: AppointmentDetailsProps) => {
  const [loading, setLoading] = useState(false);
  const t = useI18n("admin");
  const locale = useLocale();
  const timeZone = useTimeZone();
  const router = useRouter();

  const duration = durationToTime(appointment.totalDuration);
  const paidPayments = appointment.payments?.filter(
    (payment) => payment.status === "paid",
  );

  const totalPaid =
    paidPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

  const { name, email, phone, ...restFields } = appointment.fields;

  const noteForm = useForm<NoteFormSchema>({
    resolver: zodResolver(noteFormSchema),
    mode: "all",
    values: {
      note: appointment.note,
    },
  });

  const onNoteSubmit = async (data: NoteFormSchema) => {
    try {
      setLoading(true);
      await toastPromise(updateAppointmentNote(appointment._id, data.note), {
        success: t("appointments.view.noteUpdated"),
        error: t("appointments.view.requestError"),
      });

      router.refresh();
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col @4xl:grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <dl className="divide-y">
            <div className="py-1 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="flex self-center">
                {t("appointments.view.dateTime")}:
              </dt>
              <dd className="col-span-2">
                <Accordion type="single" collapsible>
                  <AccordionItem value="dateTime" className="border-none">
                    <AccordionTrigger>
                      {DateTime.fromJSDate(appointment.dateTime)
                        .setZone(timeZone)
                        .toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY, {
                          locale,
                        })}{" "}
                      -{" "}
                      {DateTime.fromJSDate(appointment.dateTime)
                        .setZone(timeZone)
                        .plus({ minutes: appointment.totalDuration })
                        .toLocaleString(DateTime.TIME_SIMPLE, { locale })}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-1">
                        <div>{t("appointments.view.dateAndTime")}:</div>
                        <div>
                          {DateTime.fromJSDate(appointment.dateTime)
                            .setZone(timeZone)
                            .toLocaleString(
                              DateTime.DATETIME_MED_WITH_WEEKDAY,
                              {
                                locale,
                              },
                            )}
                        </div>
                        <div>{t("appointments.view.duration")}:</div>
                        <div>
                          {duration.hours > 0 && (
                            <>
                              {duration.hours} {t("appointments.view.hours")}
                            </>
                          )}
                          {duration.hours > 0 && duration.minutes > 0 && <> </>}
                          {duration.minutes > 0 && (
                            <>
                              {duration.minutes}{" "}
                              {t("appointments.view.minutes")}
                            </>
                          )}
                        </div>
                        <div>{t("appointments.view.timezone")}:</div>
                        <div>
                          {
                            timeZones.find(
                              (tz) => tz.name === appointment.timeZone,
                            )?.currentTimeFormat
                          }{" "}
                          <span className="text-sm text-muted-foreground">
                            ({appointment.timeZone})
                          </span>
                        </div>
                        <div>{t("appointments.view.endsAt")}:</div>
                        <div>
                          {DateTime.fromJSDate(appointment.dateTime)
                            .setZone(timeZone)
                            .plus({ minutes: appointment.totalDuration })
                            .toLocaleString(
                              DateTime.DATETIME_MED_WITH_WEEKDAY,
                              { locale },
                            )}{" "}
                        </div>
                        <div>{t("appointments.view.requestedAt")}:</div>
                        <div>
                          {DateTime.fromJSDate(appointment.createdAt)
                            .setZone(timeZone)
                            .toLocaleString(
                              DateTime.DATETIME_MED_WITH_WEEKDAY,
                              {
                                locale,
                              },
                            )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </dd>
            </div>
            <div className="py-1 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="flex self-center">
                {t("appointments.view.status")}
              </dt>
              <dd className="col-span-2">
                {t(`appointments.status.${appointment.status}`)}
              </dd>
            </div>

            {!!appointment.totalPrice && (
              <div className="py-1 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt>{t("appointments.view.price")}:</dt>
                <dd className="col-span-2">
                  ${formatAmountString(appointment.totalPrice)}
                </dd>
              </div>
            )}
            {!!totalPaid && (
              <>
                <div className="py-1 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt>{t("appointments.view.amountPaid")}:</dt>
                  <dd className="col-span-2">
                    ${formatAmountString(totalPaid)}
                  </dd>
                </div>
                {!!appointment.totalPrice &&
                  appointment.totalPrice - totalPaid > 0 && (
                    <div className="py-1 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt>{t("appointments.view.amountLeftToPay")}:</dt>
                      <dd className="col-span-2">
                        $
                        {formatAmountString(appointment.totalPrice - totalPaid)}
                      </dd>
                    </div>
                  )}
              </>
            )}
            <div className="py-1 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="flex self-center">
                {t("appointments.view.customer")}
              </dt>
              <dd className="col-span-2">
                <Accordion type="single" collapsible>
                  <AccordionItem value="option" className="border-none">
                    <AccordionTrigger className="text-left">
                      <span>
                        {appointment.customer.name}{" "}
                        <span className="text-sm text-muted-foreground">
                          ({appointment.customer.email})
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-3 gap-1">
                        <div>{t("appointments.view.name")}:</div>
                        <div className="col-span-2">
                          <Link
                            variant="default"
                            href={`/admin/dashboard/customers/${appointment.customerId}`}
                          >
                            {appointment.customer.name}
                          </Link>
                        </div>
                        <div>{t("appointments.view.email")}:</div>
                        <div className="col-span-2">
                          {appointment.customer.email}
                        </div>
                        <div>{t("appointments.view.phone")}:</div>
                        <div className="col-span-2">
                          {appointment.customer.phone}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </dd>
            </div>
            <div className="py-1 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="flex self-center">
                {t("appointments.view.fields")}
              </dt>
              <dd className="col-span-2">
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <div>{t("appointments.view.name")}:</div>
                  <div className="col-span-2">
                    <Link
                      variant="default"
                      href={`/admin/dashboard/appointments?search=${encodeURIComponent(
                        name,
                      )}`}
                    >
                      {name}
                    </Link>
                  </div>
                  <div>{t("appointments.view.email")}:</div>
                  <div className="col-span-2">
                    <Link
                      variant="default"
                      href={`/admin/dashboard/appointments?search=${encodeURIComponent(
                        email,
                      )}`}
                    >
                      {email}
                    </Link>
                  </div>
                  <div>{t("appointments.view.phone")}:</div>
                  <div className="col-span-2">
                    <Link
                      variant="default"
                      href={`/admin/dashboard/appointments?search=${encodeURIComponent(
                        phone,
                      )}`}
                    >
                      {phone}
                    </Link>
                  </div>
                  {Object.entries(restFields).map(([key, value]) => (
                    <Fragment key={key}>
                      <div>
                        {appointment.fieldsLabels?.[key] ? (
                          <>
                            <span>{appointment.fieldsLabels?.[key]}</span>{" "}
                            <span className="text-sm text-muted-foreground">
                              ({key})
                            </span>
                          </>
                        ) : (
                          key
                        )}
                        :
                      </div>
                      <div className="col-span-2">
                        {typeof value === "boolean" ? (
                          value ? (
                            t("appointments.view.yes")
                          ) : (
                            t("appointments.view.no")
                          )
                        ) : (
                          <Link
                            variant="default"
                            href={`/admin/dashboard/appointments?search=${encodeURIComponent(
                              value.toString(),
                            )}`}
                          >
                            {value.toString()}
                          </Link>
                        )}
                      </div>
                    </Fragment>
                  ))}
                </div>
              </dd>
            </div>
            <div className="py-1 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="flex self-center">
                {t("appointments.view.selectedOption")}
              </dt>
              <dd className="col-span-2">
                <Accordion type="single" collapsible>
                  <AccordionItem value="option" className="border-none">
                    <AccordionTrigger>
                      {appointment.option.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-3 gap-1">
                        <div>{t("appointments.view.option")}:</div>
                        <div className="col-span-2">
                          <Link
                            href={`/admin/dashboard/services/options/${appointment.option._id}`}
                            variant="default"
                          >
                            {appointment.option.name}
                          </Link>
                        </div>
                        {!!appointment.option.duration && (
                          <>
                            <div>{t("appointments.view.duration")}:</div>
                            <div className="col-span-2">
                              {appointment.option.duration}{" "}
                              {t("appointments.view.minutes")}
                            </div>
                          </>
                        )}
                        {!!appointment.option.price && (
                          <>
                            <div>{t("appointments.view.price")}:</div>
                            <div className="col-span-2">
                              ${formatAmountString(appointment.option.price)}
                            </div>
                          </>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </dd>
            </div>
            {appointment.addons && appointment.addons.length > 0 && (
              <div className="py-1 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="flex self-center">
                  {t("appointments.view.selectedAddons")}:
                </dt>
                <dd className="col-span-2">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="addons" className="border-none">
                      <AccordionTrigger>
                        {appointment.addons
                          .map((addon) => addon.name)
                          .join(", ")}
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul>
                          {appointment.addons.map((addon, index) => (
                            <li key={`${addon._id}-${index}`}>
                              <Link
                                href={`/admin/dashboard/services/addons/${addon._id}`}
                                variant="default"
                              >
                                {addon.name}
                              </Link>
                              {(addon.price || addon.duration) && (
                                <ul className="pl-2">
                                  {!!addon.duration && (
                                    <li>
                                      {t("appointments.view.duration")}:{" "}
                                      {addon.duration}{" "}
                                      {t("appointments.view.min")}
                                    </li>
                                  )}
                                  {!!addon.price && (
                                    <li>
                                      {t("appointments.view.price")}: $
                                      {formatAmountString(addon.price)}
                                    </li>
                                  )}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </dd>
              </div>
            )}
          </dl>
        </div>
        <div className="flex flex-col gap-2">
          <AppointmentCalendar appointment={appointment} />
        </div>
      </div>

      <Form {...noteForm}>
        <form
          onSubmit={noteForm.handleSubmit(onNoteSubmit)}
          onBlur={noteForm.handleSubmit(onNoteSubmit)}
          className="flex flex-col gap-2"
        >
          <div className="font-semibold flex flex-row gap-1 items-center">
            {t("appointments.view.note")}
          </div>
          <FormField
            control={noteForm.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    disabled={loading}
                    placeholder={t("appointments.view.note")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  );
};

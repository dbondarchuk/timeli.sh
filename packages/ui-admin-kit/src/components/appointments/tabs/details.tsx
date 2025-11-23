"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { adminApi } from "@timelish/api-sdk";
import { AdminKeys, useI18n, useLocale } from "@timelish/i18n";
import { Appointment, timeZones } from "@timelish/types";
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
} from "@timelish/ui";
import { durationToTime, formatAmountString } from "@timelish/utils";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
    appointment.payments?.reduce(
      (sum, payment) =>
        sum +
        payment.amount -
        (payment.refunds?.reduce((sum, refund) => sum + refund.amount, 0) || 0),
      0,
    ) || 0;

  const totalAmountLeft = appointment.totalPrice
    ? appointment.totalPrice -
      (paidPayments
        ?.filter(
          (payment) =>
            payment.type !== "rescheduleFee" &&
            payment.type !== "cancellationFee" &&
            payment.type !== "tips",
        )
        .reduce((sum, payment) => sum + payment.amount, 0) || 0)
    : 0;

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
      await toastPromise(
        adminApi.appointments.updateNote(appointment._id, data.note),
        {
          success: t("appointments.view.noteUpdated"),
          error: t("appointments.view.requestError"),
        },
      );

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
        <div className="flex flex-col gap-2 text-xs">
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
                      <div className="grid grid-cols-2 gap-1 text-xs">
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
            {!!appointment.discount && (
              <div className="py-1 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt>{t("appointments.view.discount")}:</dt>
                <dd className="col-span-2 flex flex-row gap-1 items-center">
                  <span>
                    -${formatAmountString(appointment.discount.discountAmount)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({appointment.discount.code})
                  </span>
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
                  totalAmountLeft > 0 &&
                  appointment.status !== "declined" && (
                    <div className="py-1 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt>{t("appointments.view.amountLeftToPay")}:</dt>
                      <dd className="col-span-2">
                        ${formatAmountString(totalAmountLeft)}
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
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div>{t("appointments.view.name")}:</div>
                        <div className="col-span-2">
                          <Link
                            variant="default"
                            href={`/dashboard/customers/${appointment.customerId}`}
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
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <div>{t("appointments.view.name")}:</div>
                  <div className="col-span-2">{name}</div>
                  <div>{t("appointments.view.email")}:</div>
                  <div className="col-span-2">{email}</div>
                  <div>{t("appointments.view.phone")}:</div>
                  <div className="col-span-2">{phone}</div>
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
                        {typeof value === "boolean"
                          ? value
                            ? t("appointments.view.yes")
                            : t("appointments.view.no")
                          : value.toString()}
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
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div>{t("appointments.view.option")}:</div>
                        <div className="col-span-2">
                          <Link
                            href={`/dashboard/services/options/${appointment.option._id}`}
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
                                href={`/dashboard/services/addons/${addon._id}`}
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
            {appointment.meetingInformation && (
              <div className="py-1 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="flex self-center">
                  {t("appointments.view.meetingInformation.label")}
                </dt>
                <dd className="col-span-2">
                  <dd className="col-span-2">
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div>
                        {t("appointments.view.meetingInformation.url")}:
                      </div>
                      <div className="col-span-2">
                        <Link
                          variant="default"
                          target="_blank"
                          href={appointment.meetingInformation.url}
                        >
                          {appointment.meetingInformation.url}
                        </Link>
                      </div>
                      <div>
                        {t("appointments.view.meetingInformation.type")}:
                      </div>
                      <div className="col-span-2">
                        {t.has(
                          `onlineMeeting.types.${appointment.meetingInformation.type}` as AdminKeys,
                        )
                          ? t(
                              `onlineMeeting.types.${appointment.meetingInformation.type}` as AdminKeys,
                            )
                          : appointment.meetingInformation.type}
                      </div>
                      <div>
                        {t("appointments.view.meetingInformation.meetingId")}:
                      </div>
                      <div className="col-span-2">
                        {appointment.meetingInformation.meetingId}
                      </div>
                      {!!appointment.meetingInformation.meetingPassword && (
                        <>
                          <div>
                            {t(
                              "appointments.view.meetingInformation.meetingPassword",
                            )}
                            :
                          </div>
                          <div className="col-span-2">
                            {appointment.meetingInformation.meetingPassword}
                          </div>
                        </>
                      )}
                    </div>
                  </dd>
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

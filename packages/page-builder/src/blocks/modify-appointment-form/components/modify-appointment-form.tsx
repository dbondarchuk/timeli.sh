"use client";

import { useI18n } from "@vivid/i18n";
import type { CollectPayment, DateTime } from "@vivid/types";
import { Availability, ModifyAppointmentInformation } from "@vivid/types";
import { Spinner, toast } from "@vivid/ui";
import { fetchWithJson } from "@vivid/utils";
import { DateTime as LuxonDateTime } from "luxon";
import React, { useMemo } from "react";
import { ModifyAppointmentFormContext, StepType } from "./context";
import { StepCard } from "./step-card";
import { ModifyAppointmentFields, ModifyAppointmentType } from "./types";

export type ModifyAppointmentFormProps = {
  className?: string;
  id?: string;
  isEditor?: boolean;
};

export const ModifyAppointmentForm: React.FC<
  ModifyAppointmentFormProps & React.HTMLAttributes<HTMLDivElement>
> = ({ className, id, isEditor, ...props }) => {
  const i18n = useI18n("translation");
  const [type, setType] = React.useState<ModifyAppointmentType>();

  const errors = React.useMemo(
    () => ({
      fetchTitle: i18n("availability_fetch_failed_title"),
      fetchDescription: i18n("availability_fetch_failed_description"),
      fetchAppointmentTitle: i18n("appointment_fetch_failed_title"),
      fetchAppointmentDescription: i18n("appointment_fetch_failed_description"),
      fetchPaymentInformationTitle: i18n(
        "payment_information_fetch_failed_title",
      ),
      fetchPaymentInformationDescription: i18n(
        "payment_information_fetch_failed_description",
      ),
      submitTitle: i18n(`${type!}_submit_failed_title`),
      submitDescription: i18n(`${type!}_submit_failed_description`),
      timeNotAvailableDescription: i18n(
        "submit_event_failed_time_not_available_description",
      ),
    }),
    [i18n, type],
  );

  const topRef = React.createRef<HTMLDivElement>();

  const [step, setStep] = React.useState<StepType>("type");
  const [confirmedByUser, setConfirmedByUser] = React.useState(false);
  const [dateTime, setDateTime] = React.useState<DateTime | undefined>(
    undefined,
  );

  const [appointment, setAppointment] = React.useState<
    ModifyAppointmentInformation | undefined
  >(undefined);
  const [availability, setAvailability] = React.useState<Availability>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [fields, setFields] = React.useState<ModifyAppointmentFields>({
    type: "email",
    email: "",
    dateTime: new Date(),
  });

  const [paymentInformation, setPaymentInformation] =
    React.useState<CollectPayment | null>();

  const [isFormValid, setIsFormValid] = React.useState(false);

  const newDateTime = useMemo(
    () =>
      !!dateTime
        ? LuxonDateTime.fromObject(
            {
              year: dateTime.date.getFullYear(),
              month: dateTime.date.getMonth() + 1,
              day: dateTime.date.getDate(),
              hour: dateTime.time.hour,
              minute: dateTime.time.minute,
              second: 0,
            },
            { zone: dateTime.timeZone },
          )
        : undefined,
    [dateTime],
  );

  const fetchAppointment = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithJson(`/api/event/modify`, {
        method: "POST",
        body: JSON.stringify({
          type,
          fields,
        }),
      });

      if (response.status >= 400) {
        throw { response };
      }

      const data = (await response.json({
        parseDates: true,
      })) as ModifyAppointmentInformation;

      setAppointment(data);

      return data;
    } catch (e: any) {
      let notFound = false;
      let message = "";
      if (typeof e === "object" && e && "response" in e) {
        try {
          const error = await e.response.json();
          if (error.error === "appointment_not_found") {
            notFound = true;
          }

          message = error.response.statusText;
        } catch {}
      } else {
        message = e;
      }

      console.error(e);
      toast.error(notFound ? errors.fetchAppointmentTitle : errors.fetchTitle, {
        description: notFound
          ? errors.fetchAppointmentDescription
          : errors.fetchDescription,
      });

      setAppointment(undefined);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentInformation = async (): Promise<CollectPayment | null> => {
    const body = {
      dateTime: newDateTime?.toUTC().toJSDate(),
      type,
      fields,
    };

    const intentId = paymentInformation?.intent?._id;
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/payments${intentId ? `/${intentId}` : ""}`,
        {
          method: intentId ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, paymentType: "rescheduleFee" }),
        },
      );

      if (response.status >= 400) {
        throw new Error(
          `Failed to get payment information: ${response.status}: ${await response.text()}`,
        );
      }

      return (await response.json()) as CollectPayment | null;
    } catch (e) {
      toast.error(errors.fetchPaymentInformationTitle, {
        description: errors.fetchPaymentInformationDescription,
      });

      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailability = async (
    appointment: ModifyAppointmentInformation | undefined,
  ) => {
    if (!appointment || !appointment.allowed || !appointment.duration) return;

    if (errors.fetchTitle === "availability_fetch_failed_title") return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/availability?duration=${appointment.duration}`,
      );

      if (response.status >= 400) throw new Error(response.statusText);
      const data = (await response.json()) as Availability;
      setAvailability(data);
    } catch (e) {
      console.error(e);

      setAvailability([]);
      toast.error(errors.fetchTitle, {
        description: errors.fetchDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async () => {
    setIsLoading(true);
    if (!appointment || !appointment.allowed) return;

    try {
      const body = {
        dateTime: newDateTime?.toUTC().toJSDate(),
        type,
        fields,
      };

      const response = await fetch(`/api/event/${appointment.id}/modify`, {
        method: "POST",
        body: JSON.stringify({
          ...body,
          paymentIntentId: paymentInformation?.intent?._id,
        }),
      });

      if (response.status === 400) {
        const error = await response.json();
        if (error.error === "time_not_available") {
          toast.error(errors.submitTitle, {
            description: errors.timeNotAvailableDescription,
          });
        } else {
          toast.error(errors.submitTitle, {
            description: errors.submitDescription,
          });
        }

        await fetchAvailability(appointment);
        setDateTime(undefined);
        setStep(type === "reschedule" ? "calendar" : "type");
        return;
      } else if (response.status > 400) {
        throw new Error(response.statusText);
      }

      setStep("success");
    } catch (e) {
      toast.error(errors.submitTitle, {
        description: errors.submitDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // React.useEffect(() => {
  //   topRef?.current?.scrollIntoView();
  // }, [step]);

  return (
    <div className="relative" id={id} {...props}>
      <div ref={topRef} />
      <ModifyAppointmentFormContext.Provider
        value={{
          appointment,
          setAppointment,
          type: type as ModifyAppointmentType,
          setType,
          confirmedByUser,
          setConfirmedByUser,
          step,
          setStep,
          fetchAvailability,
          fields,
          setFields,
          onSubmit,
          setDateTime,
          fetchAppointment,
          paymentInformation,
          setPaymentInformation,
          fetchPaymentInformation,
          dateTime,
          newDateTime,
          availability,
          isFormValid,
          setIsFormValid,
          className,
          isEditor,
        }}
      >
        <StepCard />
      </ModifyAppointmentFormContext.Provider>

      {isLoading && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-white opacity-50">
          <div role="status">
            <Spinner className="w-20 h-20" />
            <span className="sr-only">Please wait...</span>
          </div>
        </div>
      )}
    </div>
  );
};

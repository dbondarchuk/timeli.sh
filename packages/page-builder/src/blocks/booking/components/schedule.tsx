"use client";

import { useI18n } from "@vivid/i18n";
import type {
  AppointmentAddon,
  AppointmentChoice,
  AppointmentFields,
  AppointmentRequest,
  CollectPayment,
  DateTime,
  FieldSchema,
  WithDatabaseId,
} from "@vivid/types";
import { ApplyDiscountResponse, Availability } from "@vivid/types";
import { Spinner, toast } from "@vivid/ui";
import { DateTime as LuxonDateTime } from "luxon";
import { useRouter } from "next/navigation";
import React from "react";
import { ScheduleContext, StepType } from "./context";
import { StepCard } from "./step-card";
import { CheckDuplicateAppointmentsResponse } from "./types";

export type ScheduleProps = {
  appointmentOption: AppointmentChoice;
  goBack?: () => void;
  successPage?: string;
  fieldsSchema: Record<string, FieldSchema>;
  timeZone: string;
  showPromoCode?: boolean;
  className?: string;
  id?: string;
  isEditor?: boolean;
};

export const Schedule: React.FC<
  ScheduleProps & React.HTMLAttributes<HTMLDivElement>
> = ({
  appointmentOption,
  goBack,
  successPage,
  fieldsSchema,
  timeZone,
  showPromoCode,
  className,
  id,
  isEditor,
  ...props
}) => {
  const i18n = useI18n("translation");

  const errors = React.useMemo(
    () => ({
      fetchTitle: i18n("availability_fetch_failed_title"),
      fetchDescription: i18n("availability_fetch_failed_description"),
      fetchPaymentInformationTitle: i18n(
        "payment_information_fetch_failed_title",
      ),
      fetchPaymentInformationDescription: i18n(
        "payment_information_fetch_failed_description",
      ),
      submitTitle: i18n("submit_event_failed_title"),
      submitDescription: i18n("submit_event_failed_description"),
      timeNotAvailableDescription: i18n(
        "submit_event_failed_time_not_available_description",
      ),
    }),
    [i18n],
  );

  const topRef = React.createRef<HTMLDivElement>();

  const appointmentOptionDuration = appointmentOption.duration;
  const [duration, setDuration] = React.useState<number | undefined>(
    appointmentOptionDuration,
  );

  const [closestDuplicateAppointment, setClosestDuplicateAppointment] =
    React.useState<LuxonDateTime | undefined>(undefined);

  const [promoCode, setPromoCode] = React.useState<ApplyDiscountResponse>();
  const [paymentInformation, setPaymentInformation] =
    React.useState<CollectPayment | null>();

  React.useEffect(() => {
    setDuration(appointmentOptionDuration);
  }, [appointmentOptionDuration, setDuration]);

  let initialStep: StepType = "duration";
  if (appointmentOption.addons && appointmentOption.addons.length) {
    initialStep = "addons";
  } else if (appointmentOption.duration) initialStep = "calendar";

  const [step, setStep] = React.useState<StepType>(initialStep);
  const [dateTime, setDateTime] = React.useState<DateTime | undefined>(
    undefined,
  );

  const [selectedAddons, setSelectedAddons] = React.useState<
    AppointmentAddon[]
  >([]);

  const addonsFields =
    selectedAddons?.flatMap((addon) => addon.fields || []) || [];
  const allFormFields = [...(appointmentOption.fields || []), ...addonsFields];
  const fieldsIdsRequired = [...allFormFields].reduce(
    (map, field) => ({
      ...map,
      [field.id]: !!map[field.id] || !!field.required,
    }),
    {} as Record<string, boolean>,
  );

  const formFields = Object.entries(fieldsIdsRequired)
    .filter(([id]) => !!fieldsSchema[id])
    .map(([id, required]) => ({
      ...fieldsSchema[id],
      required: !!fieldsSchema[id].required || required,
    }));

  const [availability, setAvailability] = React.useState<Availability>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [fields, setFields] = React.useState<AppointmentFields>({
    name: "",
    email: "",
    phone: "",
  });

  const [isFormValid, setIsFormValid] = React.useState(false);
  const [confirmDuplicateAppointment, setConfirmDuplicateAppointment] =
    React.useState(false);

  const router = useRouter();

  const getTotalDuration = () => {
    if (!duration) return undefined;

    return (
      duration +
      (selectedAddons || []).reduce(
        (sum, addon) => sum + (addon.duration || 0),
        0,
      )
    );
  };

  const fetchAvailability = async () => {
    const totalDuration = getTotalDuration();
    if (!totalDuration) return;
    if (errors.fetchTitle === "availability_fetch_failed_title") return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/availability?duration=${getTotalDuration()}`,
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

  const checkDuplicateAppointments =
    async (): Promise<CheckDuplicateAppointmentsResponse> => {
      const request = getAppointmentRequest();
      if (!request) throw new Error("Failed to build appointment request");

      setIsLoading(true);

      try {
        const response = await fetch("/api/event/duplicate", {
          method: "POST",
          body: JSON.stringify(request),
        });

        if (response.status >= 400) throw new Error(response.statusText);
        const data =
          (await response.json()) as CheckDuplicateAppointmentsResponse;
        return {
          ...data,
          closestAppointment:
            data.hasDuplicateAppointments && data.closestAppointment
              ? LuxonDateTime.fromISO(
                  data.closestAppointment as any as string,
                ).setZone(timeZone)
              : undefined,
        } as CheckDuplicateAppointmentsResponse;
      } catch (e) {
        console.error(e);
        toast.error(errors.fetchTitle, {
          description: errors.fetchDescription,
        });

        throw e;
      } finally {
        setIsLoading(false);
      }
    };

  const getAppointmentRequest = (): AppointmentRequest | null => {
    if (!dateTime || !duration) return null;
    return {
      dateTime: LuxonDateTime.fromObject(
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
        .toUTC()
        .toJSDate(),
      timeZone: dateTime.timeZone,
      duration: duration,
      optionId: appointmentOption._id,
      addonsIds: selectedAddons?.map((addon) => addon._id),
      promoCode: promoCode?.code,
      paymentIntentId: paymentInformation?.intent?._id,
      fields: Object.entries(fields)
        .filter(([_, value]) => !((value as any) instanceof File))
        .reduce(
          (obj, cur) => ({
            ...obj,
            [cur[0]]: cur[1],
          }),
          {} as AppointmentFields,
        ),
    };
  };

  React.useEffect(() => {
    if (initialStep === "calendar") {
      fetchAvailability();
    }
  }, [initialStep, i18n]);

  const fetchPaymentInformation = async (): Promise<CollectPayment | null> => {
    const request = getAppointmentRequest();
    if (!request) throw new Error("Failed to build appointment request");

    const intentId = paymentInformation?.intent?._id;
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/payments${intentId ? `/${intentId}` : ""}`,
        {
          method: intentId ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
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

  const onSubmit = async () => {
    setIsLoading(true);

    try {
      const eventBody = getAppointmentRequest();
      if (!eventBody) return;

      const formData = new FormData();
      formData.append("json", JSON.stringify(eventBody));

      const files = Object.entries(fields).filter(
        ([_, value]) => (value as any) instanceof File,
      );

      for (const [fileField, file] of files) {
        formData.append("fileField", fileField);
        formData.append(`file_${fileField}`, file as any as File);
      }

      const response = await fetch("/api/event", {
        method: "POST",
        body: formData,
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

        fetchAvailability();
        setDateTime(undefined);
        setStep("calendar");
        return;
      } else if (response.status > 400) {
        throw new Error(response.statusText);
      }

      const { id } = (await response.json()) as WithDatabaseId<any>;

      if (successPage) {
        const expireDate = LuxonDateTime.now().plus({ minutes: 1 });

        document.cookie = `appointment_id=${encodeURIComponent(
          id,
        )}; expires=${expireDate.toJSDate().toUTCString()};`;

        router.push(successPage);
      } else {
        setStep("confirmation");
      }
    } catch (e) {
      toast.error(errors.submitTitle, {
        description: errors.submitDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    topRef?.current?.scrollIntoView();
  }, [step]);

  return (
    <div className="relative" id={id} {...props}>
      <div ref={topRef} />
      <ScheduleContext.Provider
        value={{
          selectedAddons,
          appointmentOption,
          duration,
          setDiscount: setPromoCode,
          discount: promoCode,
          step,
          setStep,
          fetchAvailability,
          fields,
          setFields,
          onSubmit,
          setDateTime,
          setDuration,
          setSelectedAddons,
          dateTime,
          goBack,
          showPromoCode,
          formFields,
          timeZone,
          availability,
          paymentInformation,
          setPaymentInformation,
          fetchPaymentInformation,
          checkDuplicateAppointments,
          confirmDuplicateAppointment,
          setConfirmDuplicateAppointment,
          closestDuplicateAppointment,
          setClosestDuplicateAppointment,
          isFormValid,
          setIsFormValid,
          className,
          isEditor,
        }}
      >
        <StepCard />
      </ScheduleContext.Provider>

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

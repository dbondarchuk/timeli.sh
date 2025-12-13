"use client";

import { clientApi, ClientApiError } from "@timelish/api-sdk";
import { useI18n } from "@timelish/i18n";
import type {
  AppointmentAddon,
  AppointmentChoice,
  AppointmentFields,
  AppointmentRequest,
  CollectPayment,
  CreateOrUpdatePaymentIntentRequest,
  DateTime,
  FieldSchema,
} from "@timelish/types";
import {
  ApplyDiscountResponse,
  Availability,
  CheckDuplicateAppointmentsResponse,
} from "@timelish/types";
import { toast, useTimeZone } from "@timelish/ui";
import { DateTime as LuxonDateTime } from "luxon";
import { useRouter } from "next/navigation";
import React from "react";
import { WaitlistDate, WaitlistRequest } from "../../../../models/waitlist";
import {
  WaitlistPublicKeys,
  WaitlistPublicNamespace,
  waitlistPublicNamespace,
} from "../../../../translations/types";
import { FlowType, ScheduleContext, StepType } from "./context";
import { BookingWithWaitlistLayout } from "./layout";
import { BOOKING_STEPS, WAITLIST_STEPS } from "./steps";

export type ScheduleProps = {
  appointmentOptions: AppointmentChoice[];
  areAppointmentOptionsLoading: boolean;
  successPage?: string;
  fieldsSchema: Record<string, FieldSchema>;
  showPromoCode?: boolean;
  className?: string;
  id?: string;
  isEditor?: boolean;
  waitlistAppId: string;
  isOnlyWaitlist: boolean;
  scrollToTop?: boolean;
  hideTitle?: boolean;
  hideSteps?: boolean;
};

export const Schedule: React.FC<
  ScheduleProps & React.HTMLAttributes<HTMLDivElement>
> = ({
  appointmentOptions,
  areAppointmentOptionsLoading,
  successPage,
  fieldsSchema,
  showPromoCode,
  className,
  id,
  isEditor,
  waitlistAppId,
  isOnlyWaitlist,
  scrollToTop,
  hideTitle,
  hideSteps,
  ...props
}) => {
  const i18n = useI18n("translation");
  const t = useI18n<WaitlistPublicNamespace, WaitlistPublicKeys>(
    waitlistPublicNamespace,
  );

  const timeZone = useTimeZone();

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
      submitWaitlistTitle: t("block.errors.submit.title"),
      submitWaitlistDescription: t("block.errors.submit.description"),
    }),
    [i18n, t],
  );

  const [selectedAppointmentOption, setSelectedAppointmentOption] =
    React.useState<AppointmentChoice | undefined>(undefined);

  const appointmentOptionDuration =
    selectedAppointmentOption?.duration || undefined;
  const [duration, setDuration] = React.useState<number | undefined>(
    appointmentOptionDuration,
  );

  const [flow, setFlow] = React.useState<FlowType>(
    isOnlyWaitlist ? "waitlist" : "booking",
  );

  const steps = flow === "booking" ? BOOKING_STEPS : WAITLIST_STEPS;
  const [isBookingConfirmed, setIsBookingConfirmed] = React.useState(false);

  const [closestDuplicateAppointment, _setClosestDuplicateAppointment] =
    React.useState<LuxonDateTime | undefined>(undefined);

  const setClosestDuplicateAppointment = React.useCallback(
    (closestAppointment?: Date) => {
      _setClosestDuplicateAppointment(
        closestAppointment
          ? LuxonDateTime.fromJSDate(closestAppointment).setZone(timeZone)
          : undefined,
      );
    },
    [timeZone],
  );

  const [
    duplicateAppointmentDoNotAllowScheduling,
    setDuplicateAppointmentDoNotAllowScheduling,
  ] = React.useState<boolean | undefined>(undefined);

  const [promoCode, setPromoCode] = React.useState<ApplyDiscountResponse>();
  const [paymentInformation, setPaymentInformation] =
    React.useState<CollectPayment | null>();

  React.useEffect(() => {
    setDuration(appointmentOptionDuration);
  }, [appointmentOptionDuration, setDuration]);

  const initialStep: StepType = "option";
  const [currentStep, setCurrentStep] = React.useState<StepType>(initialStep);
  const [dateTime, setDateTime] = React.useState<DateTime | undefined>(
    undefined,
  );

  const [selectedAddons, setSelectedAddons] = React.useState<
    AppointmentAddon[]
  >([]);

  const addonsFields =
    selectedAddons?.flatMap((addon) => addon.fields || []) || [];
  const allFormFields = [
    ...(selectedAppointmentOption?.fields || []),
    ...addonsFields,
  ];
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
  const [waitlistTimes, setWaitlistTimes] = React.useState<{
    asSoonAsPossible: boolean;
    dates?: WaitlistDate[];
  }>({
    asSoonAsPossible: true,
    dates: [],
  });

  const onWaitlistSubmit = async () => {
    if (isEditor) return;
    if (!waitlistAppId || !selectedAppointmentOption?._id) return;

    const totalDuration = getTotalDuration();
    if (!totalDuration) return;

    setIsLoading(true);

    try {
      const waitlistBody: WaitlistRequest = {
        dates: waitlistTimes.asSoonAsPossible
          ? (undefined as any)
          : waitlistTimes.dates,
        asSoonAsPossible: waitlistTimes.asSoonAsPossible,
        email: fields.email,
        name: fields.name,
        phone: fields.phone,
        note: fields.note,
        optionId: selectedAppointmentOption._id,
        addonsIds: selectedAddons?.map((addon) => addon._id),
        duration: totalDuration,
      };

      await clientApi.apps.callAppApi({
        appId: waitlistAppId,
        path: "waitlist",
        method: "POST",
        body: waitlistBody,
      });

      setIsBookingConfirmed(true);
    } catch (e) {
      toast.error(errors.submitWaitlistTitle, {
        description: errors.submitWaitlistDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    setAvailability([]);
    setDateTime(undefined);

    try {
      const data = await clientApi.availability.getAvailability({
        duration: totalDuration,
      });

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
        const data = await clientApi.events.checkDuplicateAppointments(request);

        return data;
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
    if (!dateTime || !duration || !selectedAppointmentOption?._id) return null;
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
      optionId: selectedAppointmentOption._id,
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

  // React.useEffect(() => {
  //   if (initialStep === "calendar") {
  //     fetchAvailability();
  //   }
  // }, [initialStep, i18n]);

  const handleNewBooking = () => {
    setFlow(isOnlyWaitlist ? "waitlist" : "booking");
    setCurrentStep("option");
    setSelectedAppointmentOption(undefined);
    setSelectedAddons([]);
    setDuration(undefined);
    setDateTime(undefined);
    setWaitlistTimes({
      asSoonAsPossible: false,
      dates: [],
    });
    setAvailability([]);
    setIsBookingConfirmed(false);
    setClosestDuplicateAppointment(undefined);
    setDuplicateAppointmentDoNotAllowScheduling(undefined);
    setConfirmDuplicateAppointment(false);
    setPromoCode(undefined);
    setPaymentInformation(null);
    setIsFormValid(false);
    setFields({
      name: fields.name || "",
      email: fields.email || "",
      phone: fields.phone || "",
    });
  };

  const fetchPaymentInformation = async (): Promise<CollectPayment | null> => {
    const request = getAppointmentRequest();
    if (!request) throw new Error("Failed to build appointment request");

    const intentId = paymentInformation?.intent?._id;
    const body = {
      request,
      type: "deposit",
    } satisfies CreateOrUpdatePaymentIntentRequest;

    try {
      setIsLoading(true);
      const data = await (intentId
        ? clientApi.payments.updatePaymentIntent(intentId, body)
        : clientApi.payments.createPaymentIntent(body));

      return data;
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
    if (isEditor) return;
    setIsLoading(true);

    try {
      const eventBody = getAppointmentRequest();
      if (!eventBody) return;

      const files = Object.fromEntries(
        Object.entries(fields).filter(
          ([_, value]) => (value as any) instanceof File,
        ),
      );

      const { id } = await clientApi.events.createEvent(eventBody, files);

      if (successPage) {
        const expireDate = LuxonDateTime.now().plus({ minutes: 1 });

        document.cookie = `appointment_id=${encodeURIComponent(
          id,
        )}; expires=${expireDate.toJSDate().toUTCString()};`;

        router.push(successPage);
      } else {
        setIsBookingConfirmed(true);
      }
    } catch (e: any) {
      if (e instanceof ClientApiError && e.status === 400) {
        const error = await e.response.json();
        if (error.error === "time_not_available") {
          toast.error(errors.submitTitle, {
            description: errors.timeNotAvailableDescription,
          });
        } else {
          toast.error(errors.submitTitle, {
            description: errors.submitDescription,
          });
        }

        setDateTime(undefined);
        setCurrentStep("calendar");
        await fetchAvailability();
        return;
      }

      if (currentStep === "payment") {
        setCurrentStep("form");
      }

      toast.error(errors.submitTitle, {
        description: errors.submitDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScheduleContext.Provider
      value={{
        appointmentOptions,
        areAppointmentOptionsLoading,
        isLoading,
        setIsLoading,
        isBookingConfirmed,
        selectedAddons,
        selectedAppointmentOption,
        setSelectedAppointmentOption,
        duration,
        setDiscount: setPromoCode,
        discount: promoCode,
        currentStep,
        setCurrentStep,
        fetchAvailability,
        fields,
        setFields,
        onSubmit,
        setDateTime,
        setDuration,
        setSelectedAddons,
        dateTime,
        flow,
        setFlow,
        showPromoCode,
        formFields,
        availability,
        paymentInformation,
        setPaymentInformation,
        fetchPaymentInformation,
        checkDuplicateAppointments,
        confirmDuplicateAppointment,
        setConfirmDuplicateAppointment,
        closestDuplicateAppointment,
        setClosestDuplicateAppointment,
        duplicateAppointmentDoNotAllowScheduling,
        setDuplicateAppointmentDoNotAllowScheduling,
        isFormValid,
        setIsFormValid,
        isEditor,
        waitlistAppId,
        onWaitlistSubmit,
        waitlistTimes,
        setWaitlistTimes,
        isOnlyWaitlist,
        handleNewBooking,
      }}
    >
      <BookingWithWaitlistLayout
        scrollToTop={scrollToTop}
        hideTitle={hideTitle}
        hideSteps={hideSteps}
        className={className}
        {...props}
      />
    </ScheduleContext.Provider>
  );
};

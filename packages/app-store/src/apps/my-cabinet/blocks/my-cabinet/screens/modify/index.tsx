"use client";

import { clientApi, ClientApiError } from "@timelish/api-sdk";
import { useI18n } from "@timelish/i18n";
import type {
  ApplyGiftCardsSuccessResponse,
  Availability,
  CollectPayment,
  CreateOrUpdatePaymentIntentRequest,
  DateTime,
  ModifyAppointmentInformation,
  ModifyAppointmentRequest,
  ModifyAppointmentType,
} from "@timelish/types";
import { AutoSkeleton, toast } from "@timelish/ui";
import { DateTime as LuxonDateTime } from "luxon";
import React, { useMemo } from "react";
import { useCustomerProfile } from "../../customer-profile-context";
import {
  getAppointmentByIdAction,
  getModifyInformationAction,
} from "../../actions";
import { CabinetModifyContext, StepType } from "./context";
import { CabinetModifyLayout } from "./layout";

export type CabinetModifyScreenProps = {
  appId: string;
  appointmentId: string;
  action: ModifyAppointmentType;
  scrollToTop?: boolean;
  className?: string;
  isEditor?: boolean;
};

export const CabinetModifyScreen: React.FC<CabinetModifyScreenProps> = ({
  appId,
  appointmentId,
  action,
  scrollToTop,
  className,
  isEditor,
}) => {
  const i18n = useI18n("translation");

  const errors = React.useMemo(
    () => ({
      fetchTitle: i18n("booking.availability.fetchFailedTitle"),
      fetchDescription: i18n("booking.availability.fetchFailedDescription"),
      fetchPaymentInformationTitle: i18n(
        "booking.payment.informationFetchFailedTitle",
      ),
      fetchPaymentInformationDescription: i18n(
        "booking.payment.informationFetchFailedDescription",
      ),
      submitTitle: i18n(`modification.submitFailed.${action}.title`),
      submitDescription: i18n(
        `modification.submitFailed.${action}.description`,
      ),
      timeNotAvailableDescription: i18n(
        "booking.submitEvent.timeNotAvailableDescription",
      ),
    }),
    [i18n, action],
  );

  const customerProfile = useCustomerProfile();
  const contact = React.useMemo(() => {
    if (customerProfile?.email) return { type: "email" as const, email: customerProfile.email };
    if (customerProfile?.phone) return { type: "phone" as const, phone: customerProfile.phone };
    return undefined;
  }, [customerProfile]);

  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  const [currentStep, setCurrentStep] = React.useState<StepType>(
    action === "reschedule" ? "calendar" : "review",
  );
  const [dateTime, setDateTime] = React.useState<DateTime | undefined>(
    undefined,
  );
  const [appointment, setAppointment] = React.useState<
    ModifyAppointmentInformation | undefined
  >(undefined);
  const [availability, setAvailability] = React.useState<Availability>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [paymentInformation, setPaymentInformation] =
    React.useState<CollectPayment | null>();
  const [giftCards, setGiftCards] =
    React.useState<ApplyGiftCardsSuccessResponse["giftCards"]>();
  const [isModificationConfirmed, setIsModificationConfirmed] =
    React.useState(false);

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

  const fetchAvailability = async (
    appt: ModifyAppointmentInformation | undefined,
  ) => {
    if (!appt || !appt.allowed || !appt.duration) return;
    setIsLoading(true);
    try {
      const data = await clientApi.availability.getAvailability({
        duration: appt.duration,
      });
      setAvailability(data);
    } catch (e) {
      console.error(e);
      setAvailability([]);
      toast.error(errors.fetchTitle, { description: errors.fetchDescription });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const apptRes = await getAppointmentByIdAction(appId, appointmentId);

        if (!mounted) return;

        const appt = apptRes.appointment;

        const contactFields = contact
          ? { ...contact, dateTime: new Date(appt.dateTime) }
          : null;

        if (!contactFields) return;

        const modifyInfo = await getModifyInformationAction({
          type: action,
          fields: contactFields,
        });

        if (!mounted) return;
        setAppointment(modifyInfo);

        if (action === "reschedule" && modifyInfo?.allowed) {
          await fetchAvailability(modifyInfo);
        }
      } catch {
        if (mounted) {
          toast.error(errors.fetchTitle, {
            description: errors.fetchDescription,
          });
        }
      } finally {
        if (mounted) setIsInitialLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [appId, appointmentId, action, contact]);

  const applyGiftCards = async (
    codes: string[],
    amount: number,
  ): Promise<ApplyGiftCardsSuccessResponse["giftCards"] | undefined> => {
    const data = await clientApi.giftCards.applyGiftCards({ codes, amount });
    if (data.success) {
      setGiftCards(data.giftCards);
      return data.giftCards;
    }
    throw new Error(data.error);
  };

  const getFields = ():
    | { type: "email"; email: string; dateTime: Date }
    | { type: "phone"; phone: string; dateTime: Date }
    | null => {
    if (!contact || !appointment) return null;
    const dt = new Date(appointment.dateTime);
    if (contact.type === "email") {
      return { type: "email", email: contact.email, dateTime: dt };
    }
    return { type: "phone", phone: contact.phone, dateTime: dt };
  };

  const fetchPaymentInformation =
    async (): Promise<CollectPayment | null> => {
      const fields = getFields();
      if (!fields) throw new Error("Contact info not available");
      const intentId = paymentInformation?.intent?._id;

      try {
        let request: ModifyAppointmentRequest;
        if (action === "reschedule") {
          if (!newDateTime) throw new Error("Date time is required");
          request = {
            dateTime: newDateTime.toUTC().toJSDate(),
            type: action,
            fields,
            giftCards: giftCards?.map((g) => g.code),
          } satisfies ModifyAppointmentRequest;
        } else {
          request = {
            type: action,
            fields,
            giftCards: giftCards?.map((g) => g.code),
          } satisfies ModifyAppointmentRequest;
        }

        const body = {
          request,
          type: action === "reschedule" ? "rescheduleFee" : "cancellationFee",
        } satisfies CreateOrUpdatePaymentIntentRequest;

        setIsLoading(true);
        const response = await (intentId
          ? clientApi.payments.updatePaymentIntent(intentId, body)
          : clientApi.payments.createPaymentIntent(body));

        return response;
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
    if (!appointment || !appointment.allowed) return;
    const fields = getFields();
    if (!fields) return;

    setIsLoading(true);
    try {
      await clientApi.events.modifyAppointment(appointment.id, {
        type: action,
        dateTime: newDateTime?.toUTC().toJSDate() as Date,
        fields,
        paymentIntentId: paymentInformation?.intent?._id,
        giftCards: giftCards?.map((g) => g.code),
      } satisfies ModifyAppointmentRequest);

      setIsModificationConfirmed(true);
    } catch (e: any) {
      if (e instanceof ClientApiError && e.status === 400) {
        const error = await e.response.json();
        if (error.error === "time_not_available") {
          toast.error(errors.submitTitle, {
            description: errors.timeNotAvailableDescription,
          });
          await fetchAvailability(appointment);
          setDateTime(undefined);
          setCurrentStep(action === "reschedule" ? "calendar" : "review");
          return;
        }
      }

      console.error(e);
      toast.error(errors.submitTitle, {
        description: errors.submitDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AutoSkeleton loading={isInitialLoading}>
      <CabinetModifyContext.Provider
        value={{
          appId,
          type: action,
          contact,
          appointment,
          setAppointment,
          currentStep,
          setCurrentStep,
          fetchAvailability,
          dateTime,
          setDateTime,
          newDateTime,
          availability,
          onSubmit,
          paymentInformation,
          setPaymentInformation,
          fetchPaymentInformation,
          isModificationConfirmed,
          isLoading,
          setIsLoading,
          giftCards,
          setGiftCards,
          applyGiftCards,
          className,
          isEditor,
        }}
      >
        <CabinetModifyLayout scrollToTop={scrollToTop} className={className} />
      </CabinetModifyContext.Provider>
    </AutoSkeleton>
  );
};

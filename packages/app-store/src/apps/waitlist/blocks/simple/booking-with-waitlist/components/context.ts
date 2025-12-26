import {
  ApplyDiscountResponse,
  AppointmentAddon,
  AppointmentChoice,
  AppointmentFields,
  Availability,
  CheckDuplicateAppointmentsResponse,
  CollectPayment,
  DateTime,
  Fields,
  WithLabelFieldData,
} from "@timelish/types";
import { DateTime as LuxonDateTime } from "luxon";
import { createContext, FC, ReactNode, useContext } from "react";
import { WaitlistDate } from "../../../../models/waitlist";

export type StepType =
  | "duration"
  | "addons"
  | "calendar"
  | "form"
  | "payment"
  | "confirmation"
  | "duplicate-appointments-confirmation"
  | "waitlist-form"
  | "waitlist-confirmation";

export type StepDirectionButton = {
  action: (ctx: ScheduleContextProps) => void | Promise<void>;
  isEnabled: (ctx: ScheduleContextProps) => boolean;
  show: (ctx: ScheduleContextProps) => boolean;
};

export type Step = {
  next: StepDirectionButton;
  prev: StepDirectionButton;
  Content: FC | (() => ReactNode);
};

export type ScheduleContextProps = {
  appointmentOption: AppointmentChoice;

  selectedAddons: AppointmentAddon[];
  setSelectedAddons: (addons: AppointmentAddon[]) => void;

  duration?: number;
  setDuration: (duration?: number) => void;

  dateTime?: DateTime;
  setDateTime: (dateTime?: DateTime) => void;

  fields: AppointmentFields;
  setFields: (fields: AppointmentFields) => void;
  formFields: Fields<WithLabelFieldData>;

  isFormValid: boolean;
  setIsFormValid: (isValid: boolean) => void;

  waitlistTimes: { asSoonAsPossible: boolean; dates?: WaitlistDate[] };
  setWaitlistTimes: (times: {
    asSoonAsPossible: boolean;
    dates?: WaitlistDate[];
  }) => void;

  availability: Availability;
  fetchAvailability: () => Promise<void>;

  checkDuplicateAppointments: () => Promise<CheckDuplicateAppointmentsResponse>;
  closestDuplicateAppointment?: LuxonDateTime;
  duplicateAppointmentDoNotAllowScheduling?: boolean;
  setClosestDuplicateAppointment: (closestAppointment?: Date) => void;
  setDuplicateAppointmentDoNotAllowScheduling: (
    doNotAllowScheduling: boolean,
  ) => void;

  confirmDuplicateAppointment: boolean;
  setConfirmDuplicateAppointment: (
    confirmDuplicateAppointment: boolean,
  ) => void;

  showPromoCode?: boolean;
  discount?: ApplyDiscountResponse;
  setDiscount: (promoCode?: ApplyDiscountResponse) => void;

  step: StepType;
  setStep: (step: StepType) => void;

  goBack?: () => void;

  onSubmit: () => void;

  waitlistAppId: string;

  paymentInformation?: CollectPayment | null;
  setPaymentInformation: (form?: CollectPayment | null) => void;
  fetchPaymentInformation: () => Promise<CollectPayment | null>;

  onWaitlistSubmit: () => Promise<void>;

  isOnlyWaitlist: boolean;

  className?: string;

  isEditor?: boolean;
};

export const ScheduleContext = createContext<ScheduleContextProps>(null as any);

const getAppointmentDuration = ({
  duration,
  appointmentOption,
  selectedAddons,
}: ScheduleContextProps) => {
  let baseDuration = duration;
  if (!baseDuration && appointmentOption) {
    if (appointmentOption.durationType === "fixed") {
      baseDuration = appointmentOption.duration;
    } else {
      baseDuration = appointmentOption.durationMin;
    }
  }

  if (!baseDuration) return 0;

  return (
    baseDuration +
    (selectedAddons || []).reduce(
      (sum, addon) => sum + (addon.duration || 0),
      0,
    )
  );
};

const getAppointmentBasePrice = ({
  appointmentOption,
  selectedAddons,
  duration,
}: ScheduleContextProps) => {
  let basePrice = 0;
  if (appointmentOption) {
    if (appointmentOption.durationType === "fixed") {
      basePrice = appointmentOption.price || 0;
    } else {
      basePrice =
        ((appointmentOption.pricePerHour || 0) / 60) * (duration || 0);
    }
  }

  return (
    basePrice +
    (selectedAddons || []).reduce((sum, addon) => sum + (addon.price || 0), 0)
  );
};

const getAppointmentDiscountAmount = ({
  discount: promoCode,
  ...rest
}: ScheduleContextProps) => {
  if (!promoCode) return 0;

  const basePrice = getAppointmentBasePrice(rest);

  switch (promoCode.type) {
    case "amount":
      return Math.min(basePrice, promoCode.value);
    case "percentage":
      return Math.min(
        basePrice,
        parseFloat(((basePrice * promoCode.value) / 100).toFixed(2)),
      );
  }
};

const getAppointmentPrice = (ctx: ScheduleContextProps) => {
  return Math.max(
    0,
    getAppointmentBasePrice(ctx) - getAppointmentDiscountAmount(ctx),
  );
};

export const useScheduleContext = () => {
  const ctx = useContext(ScheduleContext);

  const baseDuration =
    ctx.duration ||
    (ctx.appointmentOption?.durationType === "fixed"
      ? ctx.appointmentOption?.duration
      : ctx.appointmentOption?.durationMin);

  const baseCtx = {
    ...ctx,
    baseDuration,
    duration: getAppointmentDuration(ctx),
  };

  return {
    ...baseCtx,
    basePrice: getAppointmentBasePrice(baseCtx),
    discountAmount: getAppointmentDiscountAmount(baseCtx),
    price: getAppointmentPrice(baseCtx),
  };
};

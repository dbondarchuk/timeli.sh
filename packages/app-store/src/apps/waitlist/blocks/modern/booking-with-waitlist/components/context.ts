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
import { createContext, FC, ReactNode, useContext, useMemo } from "react";
import { WaitlistDate } from "../../../../models/waitlist";
import { WaitlistPublicKeys } from "../../../../translations/types";
import { BOOKING_STEPS, ScheduleSteps, WAITLIST_STEPS } from "./steps";

export type StepType =
  | "option"
  | "addons"
  | "calendar"
  | "form"
  | "payment"
  | "review"
  // | "duplicate-appointments-confirmation"
  | "waitlist-form"
  | "waitlist-review";

export type FlowType = "booking" | "waitlist";

export type StepDirectionButton = {
  action: (ctx: ScheduleContextProps) => void | Promise<void>;
  isEnabled: (ctx: ScheduleContextProps) => boolean;
  show: (ctx: ScheduleContextProps) => boolean;
  text?: WaitlistPublicKeys;
};

export type Step = {
  next: StepDirectionButton;
  prev: StepDirectionButton;
  Content: FC | (() => ReactNode);
  icon: React.ComponentType<{ className?: string }>;
};

export type ScheduleContextProps = {
  appointmentOptions: AppointmentChoice[];
  areAppointmentOptionsLoading: boolean;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;

  flow: FlowType;
  setFlow: (flow: FlowType) => void;

  selectedAppointmentOption?: AppointmentChoice;
  setSelectedAppointmentOption: (option?: AppointmentChoice) => void;

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

  currentStep: StepType;
  setCurrentStep: (step: StepType) => void;

  isBookingConfirmed: boolean;

  onSubmit: () => void;

  waitlistAppId?: string;

  paymentInformation?: CollectPayment | null;
  setPaymentInformation: (form?: CollectPayment | null) => void;
  fetchPaymentInformation: () => Promise<CollectPayment | null>;

  onWaitlistSubmit: () => Promise<void>;

  handleNewBooking: () => void;

  isOnlyWaitlist: boolean;

  isEditor?: boolean;
};

export const ScheduleContext = createContext<ScheduleContextProps>(null as any);

const getAppointmentDuration = ({
  duration,
  selectedAppointmentOption,
  selectedAddons,
}: ScheduleContextProps) => {
  let baseDuration = duration;
  if (!baseDuration && selectedAppointmentOption) {
    if (selectedAppointmentOption.durationType === "fixed") {
      baseDuration = selectedAppointmentOption.duration;
    } else {
      baseDuration = selectedAppointmentOption.durationMin;
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
  selectedAppointmentOption,
  selectedAddons,
  duration,
}: ScheduleContextProps) => {
  let basePrice = 0;
  if (selectedAppointmentOption) {
    if (selectedAppointmentOption.durationType === "fixed") {
      basePrice = selectedAppointmentOption.price || 0;
    } else {
      basePrice =
        ((selectedAppointmentOption.pricePerHour || 0) / 60) * (duration || 0);
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
  const steps = useMemo(
    () => (ctx.flow === "booking" ? BOOKING_STEPS : WAITLIST_STEPS),
    [ctx.flow],
  );

  const currentStepIndex = steps.indexOf(ctx.currentStep);
  const step = ScheduleSteps[ctx.currentStep];

  const baseDuration =
    ctx.duration ||
    (ctx.selectedAppointmentOption?.durationType === "fixed"
      ? ctx.selectedAppointmentOption?.duration
      : ctx.selectedAppointmentOption?.durationMin);

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
    currentStepIndex,
    steps,
    step,
  };
};

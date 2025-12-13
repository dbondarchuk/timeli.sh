import { TranslationKeys } from "@timelish/i18n";
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
import { BOOKING_STEPS, ScheduleSteps } from "./steps";

export type StepType =
  | "option"
  | "addons"
  | "calendar"
  | "form"
  | "payment"
  | "review";

export type StepDirectionButton = {
  action: (ctx: ScheduleContextProps) => void | Promise<void>;
  isEnabled: (ctx: ScheduleContextProps) => boolean;
  show: (ctx: ScheduleContextProps) => boolean;
  text?: TranslationKeys;
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

  paymentInformation?: CollectPayment | null;
  setPaymentInformation: (form?: CollectPayment | null) => void;
  fetchPaymentInformation: () => Promise<CollectPayment | null>;

  handleNewBooking: () => void;

  isEditor?: boolean;
};

export const ScheduleContext = createContext<ScheduleContextProps>(null as any);

const getAppointmentDuration = ({
  duration,
  selectedAppointmentOption,
  selectedAddons,
}: ScheduleContextProps) => {
  const baseDuration = duration || selectedAppointmentOption?.duration;
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
}: ScheduleContextProps) => {
  return (
    (selectedAppointmentOption?.price || 0) +
    (selectedAddons || []).reduce((sum, addon) => sum + (addon.price || 0), 0)
  );
};

const getAppointmentDiscountAmount = ({
  discount: promoCode,
  ...rest
}: ScheduleContextProps) => {
  if (!promoCode) return 0;

  switch (promoCode.type) {
    case "amount":
      return promoCode.value;
    case "percentage":
      return parseFloat(
        ((getAppointmentBasePrice(rest) * promoCode.value) / 100).toFixed(2),
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
  const steps = BOOKING_STEPS;
  const currentStepIndex = steps.indexOf(ctx.currentStep);
  const step = ScheduleSteps[ctx.currentStep];

  return {
    ...ctx,
    baseDuration: ctx.duration || ctx.selectedAppointmentOption?.duration,
    duration: getAppointmentDuration(ctx),
    basePrice: getAppointmentBasePrice(ctx),
    discountAmount: getAppointmentDiscountAmount(ctx),
    price: getAppointmentPrice(ctx),
    currentStepIndex,
    steps,
    step,
  };
};

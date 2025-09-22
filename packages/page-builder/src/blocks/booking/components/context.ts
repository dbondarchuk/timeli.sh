import {
  ApplyDiscountResponse,
  AppointmentAddon,
  AppointmentChoice,
  AppointmentFields,
  Availability,
  CollectPayment,
  DateTime,
  Fields,
  WithLabelFieldData,
} from "@vivid/types";
import { DateTime as LuxonDateTime } from "luxon";
import { createContext, FC, ReactNode, useContext } from "react";
import { CheckDuplicateAppointmentsResponse } from "./types";

export type StepType =
  | "duration"
  | "addons"
  | "calendar"
  | "form"
  | "payment"
  | "confirmation"
  | "duplicate-appointments-confirmation";

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

  availability: Availability;
  fetchAvailability: () => Promise<void>;

  checkDuplicateAppointments: () => Promise<CheckDuplicateAppointmentsResponse>;
  closestDuplicateAppointment?: LuxonDateTime;
  setClosestDuplicateAppointment: (closestAppointment?: LuxonDateTime) => void;

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

  timeZone: string;

  paymentInformation?: CollectPayment | null;
  setPaymentInformation: (form?: CollectPayment | null) => void;
  fetchPaymentInformation: () => Promise<CollectPayment | null>;

  className?: string;

  isEditor?: boolean;
};

export const ScheduleContext = createContext<ScheduleContextProps>(null as any);

const getAppointmentDuration = ({
  duration,
  appointmentOption,
  selectedAddons,
}: ScheduleContextProps) => {
  const baseDuration = duration || appointmentOption.duration;
  if (!baseDuration) return undefined;

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
}: ScheduleContextProps) => {
  return (
    (appointmentOption.price || 0) +
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

  return {
    duration: getAppointmentDuration(ctx),
    basePrice: getAppointmentBasePrice(ctx),
    discountAmount: getAppointmentDiscountAmount(ctx),
    price: getAppointmentPrice(ctx),
    ...ctx,
  };
};

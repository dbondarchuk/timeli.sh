import {
  AppointmentAddon,
  AppointmentChoice,
  AppointmentFields,
} from "@vivid/types";
import { createContext, FC, ReactNode, useContext } from "react";

import { WaitlistDate } from "../../../models/waitlist";

export type StepType =
  | "duration"
  | "addons"
  | "waitlist-form"
  | "waitlist-confirmation";

export type StepDirectionButton = {
  action: (ctx: WaitlistContextProps) => void | Promise<void>;
  isEnabled: (ctx: WaitlistContextProps) => boolean;
  show: (ctx: WaitlistContextProps) => boolean;
};

export type Step = {
  next: StepDirectionButton;
  prev: StepDirectionButton;
  Content: FC | (() => ReactNode);
};

export type WaitlistContextProps = {
  appointmentOption: AppointmentChoice;

  selectedAddons: AppointmentAddon[];
  setSelectedAddons: (addons: AppointmentAddon[]) => void;

  duration?: number;
  setDuration: (duration?: number) => void;

  fields: AppointmentFields;
  setFields: (fields: AppointmentFields) => void;

  waitlistTimes: { asSoonAsPossible: boolean; dates?: WaitlistDate[] };
  setWaitlistTimes: (times: {
    asSoonAsPossible: boolean;
    dates?: WaitlistDate[];
  }) => void;

  isFormValid: boolean;
  setIsFormValid: (isValid: boolean) => void;

  step: StepType;
  setStep: (step: StepType) => void;

  goBack?: () => void;

  onWaitlistSubmit: () => void;

  waitlistAppId: string;

  className?: string;
  isEditor?: boolean;
};

export const WaitlistContext = createContext<WaitlistContextProps>(null as any);

const getAppointmentDuration = ({
  duration,
  appointmentOption,
  selectedAddons,
}: WaitlistContextProps) => {
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
}: WaitlistContextProps) => {
  return (
    (appointmentOption.price || 0) +
    (selectedAddons || []).reduce((sum, addon) => sum + (addon.price || 0), 0)
  );
};

const getAppointmentPrice = (ctx: WaitlistContextProps) => {
  return Math.max(0, getAppointmentBasePrice(ctx));
};

export const useScheduleContext = () => {
  const ctx = useContext(WaitlistContext);

  return {
    duration: getAppointmentDuration(ctx),
    basePrice: getAppointmentBasePrice(ctx),
    price: getAppointmentPrice(ctx),
    ...ctx,
  };
};

import { AddonsCard } from "./addons-card";
import { Step, StepType } from "./context";
import { DurationCard } from "./duration-card";
import { WaitlistConfirmationCard } from "./waitlist-confirmation-card";
import { WaitlistFormCard } from "./waitlist-form-card";

export const WaitlistSteps: Record<StepType, Step> = {
  duration: {
    prev: {
      show: ({ goBack }) => !!goBack,
      isEnabled: () => true,
      action: ({ goBack }) => goBack?.(),
    },
    next: {
      show: () => true,
      isEnabled: ({ duration: optionDuration }) => !!optionDuration,
      action: ({ setStep, appointmentOption }) => {
        setStep(appointmentOption.addons?.length ? "addons" : "waitlist-form");
      },
    },
    Content: DurationCard,
  },
  addons: {
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ appointmentOption, goBack, setStep }) => {
        if (appointmentOption.duration && !!goBack) {
          goBack();
        } else {
          setStep("duration");
        }
      },
    },
    next: {
      show: () => true,
      isEnabled: () => true,
      action: ({ setStep }) => {
        setStep("waitlist-form");
      },
    },
    Content: AddonsCard,
  },
  "waitlist-form": {
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ setStep, appointmentOption, goBack }) => {
        if (appointmentOption.addons?.length) {
          setStep("addons");
          return;
        }

        if (appointmentOption.duration && !!goBack) {
          goBack();
          return;
        }

        setStep("duration");
      },
    },
    next: {
      show: () => true,
      isEnabled: ({ isFormValid }) => isFormValid,
      action: ({ onWaitlistSubmit }) => onWaitlistSubmit(),
    },
    Content: WaitlistFormCard,
  },
  "waitlist-confirmation": {
    prev: {
      show: () => false,
      isEnabled: () => false,
      action: () => {},
    },
    next: {
      show: () => false,
      isEnabled: () => false,
      action: () => {},
    },
    Content: WaitlistConfirmationCard,
  },
};

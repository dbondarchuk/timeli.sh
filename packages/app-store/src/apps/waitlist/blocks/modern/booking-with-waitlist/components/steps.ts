import {
  Calendar,
  CheckCircle2,
  CreditCard,
  HeartPlus,
  Sparkles,
  User,
} from "lucide-react";
import { AddonsCard } from "./addons-card";
import { CalendarCard } from "./calendar-card";
import { ScheduleContextProps, Step, StepType } from "./context";
import { FormCard } from "./form-card";
import { AppointmentOptionCard } from "./option-card";
import { PaymentCard } from "./payment-card";
import { ReviewCard } from "./review-card";
import { WaitlistFormCard } from "./waitlist-form-card";
import { WaitlistReviewCard } from "./waitlist-review-card";

export const BOOKING_STEPS: StepType[] = [
  "option",
  "addons",
  "calendar",
  "form",
  "review",
  "payment",
];

export const WAITLIST_STEPS: StepType[] = [
  "option",
  "addons",
  "waitlist-form",
  "waitlist-review",
];

const handleGoToPayment = async (ctx: ScheduleContextProps) => {
  try {
    const payment = await ctx.fetchPaymentInformation();
    ctx.setPaymentInformation(payment);

    if (!payment || payment.intent?.status === "paid") {
      ctx.onSubmit();
    } else {
      ctx.setCurrentStep("payment");
    }
  } catch (e) {
    console.error(e);
  }
};

export const ScheduleSteps: Record<StepType, Step> = {
  option: {
    icon: Sparkles,
    prev: {
      show: () => false,
      isEnabled: () => false,
      action: () => {},
    },
    next: {
      show: () => true,
      isEnabled: (ctx) => !!ctx.selectedAppointmentOption && !!ctx.duration,
      action: async (ctx) => {
        if (ctx.selectedAppointmentOption?.addons?.length) {
          ctx.setCurrentStep("addons");
          return;
        }

        if (ctx.flow === "waitlist") {
          ctx.setCurrentStep("waitlist-form");
          return;
        }

        ctx.setCurrentStep("calendar");
        await ctx.fetchAvailability();
      },
    },
    Content: AppointmentOptionCard,
  },
  addons: {
    icon: HeartPlus,
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ setCurrentStep }) => {
        setCurrentStep("option");
      },
    },
    next: {
      show: () => true,
      isEnabled: () => true,
      action: async ({ fetchAvailability, setCurrentStep, flow }) => {
        if (flow === "waitlist") {
          setCurrentStep("waitlist-form");
          return;
        }

        setCurrentStep("calendar");
        await fetchAvailability();
      },
    },
    Content: AddonsCard,
  },
  calendar: {
    icon: Calendar,
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ selectedAppointmentOption, setCurrentStep }) => {
        if (selectedAppointmentOption?.addons?.length) {
          setCurrentStep("addons");
          return;
        }

        setCurrentStep("option");
      },
    },
    next: {
      show: () => true,
      isEnabled: ({ dateTime }) => !!dateTime,
      action: ({ setCurrentStep }) => setCurrentStep("form"),
    },
    Content: CalendarCard,
  },
  form: {
    icon: User,
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ setCurrentStep }) => setCurrentStep("calendar"),
    },
    next: {
      show: () => true,
      isEnabled: ({ isFormValid, isEditor }) => isFormValid && !isEditor,
      action: async (ctx) => {
        const optionNeedsDuplicateAppointmentsConfirmation =
          ctx.selectedAppointmentOption?.duplicateAppointmentCheck?.enabled;
        if (optionNeedsDuplicateAppointmentsConfirmation) {
          const closeAppointments = await ctx.checkDuplicateAppointments();
          if (closeAppointments.hasDuplicateAppointments) {
            ctx.setClosestDuplicateAppointment(
              closeAppointments.closestAppointment,
            );
            ctx.setDuplicateAppointmentDoNotAllowScheduling(
              closeAppointments.doNotAllowScheduling,
            );
          }
        }

        ctx.setCurrentStep("review");
      },
    },
    Content: FormCard,
  },
  payment: {
    icon: CreditCard,
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ setCurrentStep }) => setCurrentStep("review"),
    },
    next: {
      show: () => false,
      isEnabled: () => false,
      action: () => {},
    },
    Content: PaymentCard,
  },
  review: {
    icon: CheckCircle2,
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ setCurrentStep }) => setCurrentStep("form"),
    },
    next: {
      show: () => true,
      isEnabled: (ctx) => {
        return (
          !ctx.selectedAppointmentOption?.duplicateAppointmentCheck?.enabled ||
          !ctx.closestDuplicateAppointment ||
          ctx.confirmDuplicateAppointment
        );
      },

      action: (ctx) => handleGoToPayment(ctx),
      text: "block.buttons.confirm",
    },
    Content: ReviewCard,
  },
  "waitlist-form": {
    icon: User,
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ setCurrentStep, selectedAppointmentOption }) => {
        if (selectedAppointmentOption?.addons?.length) {
          setCurrentStep("addons");
          return;
        }

        setCurrentStep("option");
      },
    },
    next: {
      show: () => true,
      isEnabled: ({ isFormValid }) => isFormValid,
      action: ({ setCurrentStep }) => setCurrentStep("waitlist-review"),
    },
    Content: WaitlistFormCard,
  },
  "waitlist-review": {
    icon: CheckCircle2,
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ setCurrentStep }) => setCurrentStep("waitlist-form"),
    },
    next: {
      show: () => true,
      isEnabled: ({ isFormValid }) => isFormValid,
      action: ({ onWaitlistSubmit }) => onWaitlistSubmit(),
    },
    Content: WaitlistReviewCard,
  },
};

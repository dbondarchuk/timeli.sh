import { AddonsCard } from "./addons-card";
import { CalendarCard } from "./calendar-card";
import { ConfirmationCard } from "./confirmation-card";
import { ScheduleContextProps, Step, StepType } from "./context";
import { DuplicateAppointmentConfirmationCard } from "./duplicate-appointment-confirmation-card";
import { DurationCard } from "./duration-card";
import { FormCard } from "./form-card";
import { PaymentCard } from "./payment-card";

const handleGoToPayment = async (ctx: ScheduleContextProps) => {
  try {
    const payment = await ctx.fetchPaymentInformation();
    ctx.setPaymentInformation(payment);

    if (!payment || payment.intent?.status === "paid") {
      ctx.onSubmit();
    } else {
      ctx.setStep("payment");
    }
  } catch (e) {
    console.error(e);
  }
};

export const ScheduleSteps: Record<StepType, Step> = {
  duration: {
    prev: {
      show: ({ goBack }) => !!goBack,
      isEnabled: () => true,
      action: ({ goBack }) => goBack?.(),
    },
    next: {
      show: () => true,
      isEnabled: ({ duration: optionDuration }) => !!optionDuration,
      action: async ({ setStep, appointmentOption, fetchAvailability }) => {
        if (appointmentOption.addons?.length) {
          setStep("addons");
          return;
        }

        await fetchAvailability();
        setStep("calendar");
      },
    },
    Content: DurationCard,
  },
  addons: {
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ appointmentOption, goBack, setStep }) => {
        if (
          appointmentOption.durationType === "fixed" &&
          appointmentOption.duration &&
          !!goBack
        ) {
          goBack();
        } else {
          setStep("duration");
        }
      },
    },
    next: {
      show: () => true,
      isEnabled: () => true,
      action: ({ fetchAvailability, setStep }) => {
        fetchAvailability();
        setStep("calendar");
      },
    },
    Content: AddonsCard,
  },
  calendar: {
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ appointmentOption, goBack, setStep }) => {
        if (appointmentOption.addons?.length) {
          setStep("addons");
          return;
        }

        if (
          appointmentOption.durationType === "fixed" &&
          appointmentOption.duration &&
          goBack
        ) {
          goBack();
          return;
        }

        setStep("duration");
      },
    },
    next: {
      show: () => true,
      isEnabled: ({ dateTime }) => !!dateTime,
      action: ({ setStep }) => setStep("form"),
    },
    Content: CalendarCard,
  },
  form: {
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ setStep }) => setStep("calendar"),
    },
    next: {
      show: () => true,
      isEnabled: ({ isFormValid, isEditor }) => isFormValid && !isEditor,
      action: async (ctx) => {
        const optionNeedsDuplicateAppointmentsConfirmation =
          ctx.appointmentOption.duplicateAppointmentCheck?.enabled;
        if (optionNeedsDuplicateAppointmentsConfirmation) {
          const closeAppointments = await ctx.checkDuplicateAppointments();
          if (closeAppointments.hasDuplicateAppointments) {
            ctx.setClosestDuplicateAppointment(
              closeAppointments.closestAppointment,
            );
            ctx.setDuplicateAppointmentDoNotAllowScheduling(
              closeAppointments.doNotAllowScheduling,
            );
            ctx.setStep("duplicate-appointments-confirmation");
            return;
          }
        }

        handleGoToPayment(ctx);
      },
    },
    Content: FormCard,
  },
  payment: {
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ setStep }) => setStep("form"),
    },
    next: {
      show: () => false,
      isEnabled: () => false,
      action: () => {},
    },
    Content: PaymentCard,
  },
  confirmation: {
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
    Content: ConfirmationCard,
  },
  "duplicate-appointments-confirmation": {
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ setStep }) => setStep("form"),
    },
    next: {
      show: () => true,
      isEnabled: ({
        duplicateAppointmentDoNotAllowScheduling,
        confirmDuplicateAppointment,
      }) =>
        !duplicateAppointmentDoNotAllowScheduling &&
        confirmDuplicateAppointment,
      action: (ctx) => handleGoToPayment(ctx),
    },
    Content: DuplicateAppointmentConfirmationCard,
  },
};

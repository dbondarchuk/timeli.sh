import {
  Calendar,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  User,
} from "lucide-react";
import { CalendarCard } from "./calendar-card";
import { ModifyAppointmentFormContextProps, Step, StepType } from "./context";
import { FormCard } from "./form-card";
import { PaymentCard } from "./payment-card";
import { ReviewCard } from "./review-card";
import { TypeCard } from "./type-card";

export const CANCELLATIION_STEPS: StepType[] = [
  "type",
  "form",
  "review",
  "payment",
];

export const RESCHEDULE_STEPS: StepType[] = [
  "type",
  "form",
  "calendar",
  "review",
  "payment",
];

const handleGoToPayment = async (ctx: ModifyAppointmentFormContextProps) => {
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

export const CancelOrRescheduleSteps: Record<StepType, Step> = {
  type: {
    prev: {
      show: () => false,
      isEnabled: () => false,
      action: () => {},
    },
    next: {
      show: () => true,
      isEnabled: ({ type }) => !!type,
      action: ({ setCurrentStep: setStep }) => {
        setStep("form");
      },
    },
    Content: TypeCard,
    icon: RefreshCw,
  },
  form: {
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ setCurrentStep: setStep }) => {
        setStep("type");
      },
    },
    next: {
      show: () => true,
      isEnabled: ({ isFormValid }) => isFormValid,
      action: async ({
        fetchAppointment,
        setAppointment,
        setCurrentStep: setStep,
        fetchAvailability,
        type,
        setSearchError,
      }) => {
        setSearchError(undefined);
        const appointment = await fetchAppointment();
        setAppointment(appointment);

        if (!appointment) {
          setSearchError("notFound");
          return;
        }

        if (!appointment.allowed) {
          setSearchError("notAllowed");
          return;
        }

        if (type === "cancel") {
          setStep("review");
          return;
        }

        await fetchAvailability(appointment);
        setStep("calendar");
      },
    },
    Content: FormCard,
    icon: User,
  },
  calendar: {
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ setCurrentStep: setStep, setDateTime, setAppointment }) => {
        setDateTime(undefined);
        setAppointment(undefined);
        setStep("form");
      },
    },
    next: {
      show: () => true,
      isEnabled: ({ dateTime, isEditor }) => !!dateTime && !isEditor,
      action: ({ setCurrentStep: setStep }) => setStep("review"),
    },
    Content: CalendarCard,
    icon: Calendar,
  },
  review: {
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ setCurrentStep: setStep, setAppointment, type }) => {
        if (type === "cancel") {
          setStep("form");
          setAppointment(undefined);
          return;
        }

        setStep("calendar");
      },
    },
    next: {
      show: () => true,
      isEnabled: () => true,
      action: (ctx) => {
        handleGoToPayment(ctx);
      },
      text: "modification.review.confirm",
    },
    Content: ReviewCard,
    icon: CheckCircle2,
  },
  payment: {
    prev: {
      show: () => true,
      isEnabled: () => true,
      action: ({ setCurrentStep: setStep }) => setStep("review"),
    },
    next: {
      show: () => false,
      isEnabled: () => false,
      action: () => {},
    },
    Content: PaymentCard,
    icon: CreditCard,
  },
};

import { useI18n, useLocale } from "@timelish/i18n";
import { Button, cn, Spinner } from "@timelish/ui";
import { durationToTime, formatAmountString } from "@timelish/utils";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useRef } from "react";
import {
  WaitlistPublicKeys,
  WaitlistPublicNamespace,
  waitlistPublicNamespace,
} from "../../../../translations/types";
import { ConfirmationCard } from "./confirmation-card";
import { useScheduleContext } from "./context";
import { ScheduleSteps } from "./steps";

export const BookingWithWaitlistLayout = ({
  scrollToTop,
  hideTitle,
  hideSteps,
  className,
  ...props
}: {
  scrollToTop?: boolean;
  hideTitle?: boolean;
  hideSteps?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const ctx = useScheduleContext();
  const {
    flow,
    currentStep,
    isBookingConfirmed,
    paymentInformation,
    selectedAppointmentOption,
    dateTime,
    duration,
    price,
    steps,
    currentStepIndex,
    step,
    isLoading,
    areAppointmentOptionsLoading,
  } = ctx;

  const locale = useLocale();

  const topRef = useRef<HTMLDivElement>(null);
  const scrollToTopRef = useRef(!!scrollToTop);
  useEffect(() => {
    scrollToTopRef.current = !!scrollToTop;
  }, [scrollToTop]);

  const i18n = useI18n("translation");
  const t = useI18n<WaitlistPublicNamespace, WaitlistPublicKeys>(
    waitlistPublicNamespace,
  );

  const StepContent = step.Content;

  useEffect(() => {
    if (scrollToTopRef.current) {
      topRef?.current?.scrollIntoView();
    }
  }, [step]);

  return (
    <div className={className} {...props}>
      <div ref={topRef} />
      <div className="max-w-3xl mx-auto booking-container">
        {!hideTitle && (
          <div className="text-center mb-8 title-container">
            <h1 className="text-xl font-semibold text-foreground mb-2 title-text">
              {t(`block.layout.${flow}.title`)}
            </h1>
            <p className="text-sm text-muted-foreground description-text">
              {t(`block.layout.${flow}.description`)}
            </p>
          </div>
        )}

        {/* Progress Steps */}
        {!hideSteps && (
          <div className="mb-8 flex items-center justify-center flex-wrap steps-container">
            {steps
              .map((step, index) => ({ step, index }))
              .filter(({ step }) => {
                if (
                  flow === "booking" &&
                  !paymentInformation?.intent?._id &&
                  step === "payment"
                ) {
                  return false;
                }

                if (
                  step === "addons" &&
                  !selectedAppointmentOption?.addons?.length
                ) {
                  return false;
                }

                return true;
              })
              .map(({ step, index }, jndex, filteredSteps) => {
                const Icon = ScheduleSteps[step].icon;
                const isCompleted =
                  isBookingConfirmed || currentStepIndex > jndex;

                const isCurrent = !isBookingConfirmed && currentStep === step;

                return (
                  <div key={step} className="flex items-start">
                    <div className="flex flex-col items-center w-20">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                          isCompleted && "bg-primary text-primary-foreground",
                          isCurrent &&
                            "bg-primary text-primary-foreground ring-4 ring-primary/20",
                          !isCompleted &&
                            !isCurrent &&
                            "bg-muted text-muted-foreground",
                        )}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs mt-2 font-medium text-center",
                          isCurrent
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {t(`block.steps.${step}`)}
                      </span>
                    </div>
                    {jndex < filteredSteps.length - 1 && (
                      <div
                        className={cn(
                          "w-8 h-0.5 mt-5 -mx-4 transition-colors duration-500",
                          isBookingConfirmed ||
                            steps.indexOf(currentStep) > steps.indexOf(step)
                            ? "bg-primary"
                            : "bg-muted",
                        )}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* <StepCard /> */}
        {isBookingConfirmed ? (
          <ConfirmationCard />
        ) : (
          <div className="mb-6 relative step-content-container">
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Spinner className="w-8 h-8 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {i18n("loading_aria")}
                  </span>
                </div>
              </div>
            )}
            <StepContent />
          </div>
        )}

        {/* Summary & Navigation - Hide when booking is confirmed */}
        {!isBookingConfirmed && !areAppointmentOptionsLoading && (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-card border rounded-lg p-4 mt-6 summary-container">
            {!!selectedAppointmentOption && (
              <div className="flex flex-col md:flex-row gap-2 w-full">
                {!!price && (
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground amount-label">
                      {i18n("booking.summary.estimates.amount")}
                    </p>
                    <p className="text-sm font-bold text-foreground flex items-center gap-2 amount-value">
                      ${formatAmountString(price)}
                    </p>
                  </div>
                )}
                {selectedAppointmentOption && (
                  <div
                    className={cn(
                      "text-left",
                      !!price &&
                        "border-t pt-2 md:border-t-0 md:border-l md:pl-2 md:pt-0",
                    )}
                  >
                    <p className="text-xs text-muted-foreground duration-label">
                      {i18n("booking.summary.estimates.duration")}
                    </p>
                    <p className="text-sm font-bold text-foreground flex items-center gap-2 duration-value">
                      {i18n(
                        "duration_hour_min_format",
                        durationToTime(duration),
                      )}
                    </p>
                  </div>
                )}
                {flow === "booking" && !!dateTime && (
                  <div className="text-left border-t pt-2 md:border-t-0 md:border-l md:pl-2 md:pt-0">
                    <p className="text-xs text-muted-foreground">
                      {i18n("booking.summary.estimates.dateTime")}
                    </p>
                    <p className="text-sm font-bold text-foreground flex items-center gap-2 duration-value">
                      {DateTime.fromJSDate(dateTime.date)
                        .set({
                          hour: dateTime.time.hour,
                          minute: dateTime.time.minute,
                        })
                        .setZone(dateTime.timeZone)
                        .toLocaleString(DateTime.DATETIME_FULL, { locale })}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div
              className={cn(
                "w-full lg:w-auto flex justify-between gap-2 buttons-container",
                !step.prev.show(ctx) && "justify-end",
                !selectedAppointmentOption && "lg:w-full",
              )}
            >
              {step.prev.show(ctx) && (
                <Button
                  variant="outline"
                  className="back-button"
                  onClick={() => step.prev.action(ctx)}
                  disabled={
                    !step.prev.isEnabled(ctx) ||
                    isLoading ||
                    areAppointmentOptionsLoading
                  }
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {t(step.prev.text ?? "block.buttons.steps.back")}
                </Button>
              )}
              {step.next.show(ctx) && (
                <Button
                  className="next-button"
                  onClick={() => step.next.action(ctx)}
                  disabled={
                    !step.next.isEnabled(ctx) ||
                    isLoading ||
                    areAppointmentOptionsLoading
                  }
                >
                  {t(step.next.text ?? "block.buttons.steps.next")}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

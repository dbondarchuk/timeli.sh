import { useI18n, useLocale } from "@timelish/i18n";
import { Button, cn, Spinner, usePrevious } from "@timelish/ui";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useRef } from "react";
import { ConfirmationCard } from "./confirmation-card";
import { useModifyAppointmentFormContext } from "./context";
import { CancelOrRescheduleSteps } from "./steps";

export const ModifyAppointmentFormLayout = ({
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
  const ctx = useModifyAppointmentFormContext();
  const {
    currentStep,
    step,
    isLoading,
    steps,
    paymentInformation,
    type,
    isModificationConfirmed,
    currentStepIndex,
    appointment,
    newDateTime,
  } = ctx;

  const locale = useLocale();

  const topRef = useRef<HTMLDivElement>(null);
  const scrollToTopRef = useRef(!!scrollToTop);
  useEffect(() => {
    scrollToTopRef.current = !!scrollToTop;
  }, [scrollToTop]);

  const t = useI18n("translation");

  const StepContent = step.Content;

  const previousStep = usePrevious(step, step);
  useEffect(() => {
    if (scrollToTopRef.current && previousStep !== step) {
      topRef?.current?.scrollIntoView();
    }
  }, [previousStep, step]);

  return (
    <div className={className} {...props}>
      <div ref={topRef} />
      <div className="max-w-3xl mx-auto booking-container">
        {!hideTitle && (
          <div className="text-center mb-8 title-container">
            <h1 className="text-xl font-semibold text-foreground mb-2 title-text">
              {t(`modification.title`)}
            </h1>
            <p className="text-sm text-muted-foreground description-text">
              {t(`modification.description`)}
            </p>
          </div>
        )}

        {/* Progress Steps */}
        {!hideSteps && (
          <div className="mb-8 flex items-center justify-center flex-wrap steps-container">
            {steps
              .map((step, index) => ({ step, index }))
              .filter(({ step }) => {
                if (!paymentInformation?.intent?._id && step === "payment") {
                  return false;
                }

                if (type === "cancel" && step === "calendar") {
                  return false;
                }

                return true;
              })
              .map(({ step, index }, jndex, filteredSteps) => {
                const Icon = CancelOrRescheduleSteps[step].icon;
                const isCompleted =
                  isModificationConfirmed || currentStepIndex > jndex;

                const isCurrent =
                  !isModificationConfirmed && currentStep === step;

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
                        {t(`modification.steps.${step}`)}
                      </span>
                    </div>
                    {jndex < filteredSteps.length - 1 && (
                      <div
                        className={cn(
                          "w-8 h-0.5 mt-5 -mx-4 transition-colors duration-500",
                          isModificationConfirmed ||
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
        {isModificationConfirmed ? (
          <ConfirmationCard />
        ) : (
          <div className="mb-6 relative step-content-container">
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Spinner className="w-8 h-8 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {t("loading_aria")}
                  </span>
                </div>
              </div>
            )}
            <StepContent />
          </div>
        )}

        {/* Summary & Navigation - Hide when booking is confirmed */}
        {!isModificationConfirmed && (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-card border rounded-lg p-4 mt-6 summary-container">
            {!!appointment && (
              <div className="flex flex-col md:flex-row gap-2 w-full">
                {!!appointment.price && (
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground amount-label">
                      {t("modification.summary.estimates.dateTime")}
                    </p>
                    <p className="text-sm font-bold text-foreground flex items-center gap-2 line-through date-time-value">
                      {DateTime.fromJSDate(appointment.dateTime)
                        .setZone(appointment.timeZone)
                        .toLocaleString(DateTime.DATETIME_FULL, { locale })}
                    </p>
                  </div>
                )}
                {type === "reschedule" && !!newDateTime && (
                  <div className="text-left border-t pt-2 md:border-t-0 md:border-l md:pl-2 md:pt-0">
                    <p className="text-xs text-muted-foreground">
                      {t("modification.summary.estimates.newDateTime")}
                    </p>
                    <p className="text-sm font-bold text-foreground flex items-center gap-2 new-date-time-value">
                      {newDateTime.toLocaleString(DateTime.DATETIME_FULL, {
                        locale,
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div
              className={cn(
                "w-full lg:w-auto flex justify-between gap-2 buttons-container",
                !step.prev.show(ctx) && "justify-end",
                !appointment && "lg:w-full",
              )}
            >
              {step.prev.show(ctx) && (
                <Button
                  variant="outline"
                  className="back-button"
                  onClick={() => step.prev.action(ctx)}
                  disabled={!step.prev.isEnabled(ctx) || isLoading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {t(step.prev.text ?? "back_button")}
                </Button>
              )}
              {step.next.show(ctx) && (
                <Button
                  className="next-button"
                  onClick={() => step.next.action(ctx)}
                  disabled={!step.next.isEnabled(ctx) || isLoading}
                >
                  {t(step.next.text ?? "next_button")}
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

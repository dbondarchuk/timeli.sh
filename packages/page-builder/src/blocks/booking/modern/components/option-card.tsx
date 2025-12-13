import { useI18n } from "@timelish/i18n";
import { AppointmentChoice } from "@timelish/types";
import { cn, Markdown, Skeleton } from "@timelish/ui";
import { durationToTime, formatAmountString } from "@timelish/utils";
import { Clock, Minus, Plus } from "lucide-react";
import { useScheduleContext } from "./context";

export const AppointmentOptionCard: React.FC = () => {
  const {
    appointmentOptions,
    selectedAppointmentOption,
    setSelectedAppointmentOption,
    areAppointmentOptionsLoading,
    setDiscount,
    setDateTime,
    baseDuration,
    setDuration,
  } = useScheduleContext();

  const t = useI18n("translation");

  const onClick = (option: AppointmentChoice): void => {
    setSelectedAppointmentOption(option);
    setDiscount(undefined);
    setDateTime(undefined);
  };

  return (
    <div className="space-y-4 option-card card-container">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground option-card-title card-title">
          {t("booking.option.title")}
        </h2>
        <p className="text-xs text-muted-foreground option-card-description card-description">
          {t("booking.option.description")}
        </p>
      </div>
      <div className="grid gap-3 option-list">
        {areAppointmentOptionsLoading ? (
          <>
            <Skeleton className="w-full h-36 rounded-lg" />
            <Skeleton className="w-full h-36 rounded-lg" />
            <Skeleton className="w-full h-36 rounded-lg" />
          </>
        ) : (
          <>
            {appointmentOptions.map((option) => {
              const isSelected = selectedAppointmentOption?._id === option._id;
              const currentDuration = option?.duration;
              const currentPrice = option?.price;

              return (
                <div
                  key={option._id}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 transition-all duration-200",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent/50",
                  )}
                >
                  <button
                    onClick={() => onClick(option)}
                    className="w-full text-left cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-foreground">
                          {option.name}
                        </h3>
                        <Markdown
                          markdown={option.description}
                          prose="simple"
                          className="text-xs text-muted-foreground [&_p]:my-0.5 [&_p]:leading-6"
                        />
                      </div>
                      {(!!currentPrice || !!currentDuration) && (
                        <div className="text-right flex-shrink-0">
                          {!!currentPrice && (
                            <p className="text-sm font-semibold text-foreground">
                              ${formatAmountString(currentPrice)}
                            </p>
                          )}
                          {!!currentDuration && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                              <Clock className="w-3 h-3" />{" "}
                              {t(
                                "duration_hour_min_format",
                                durationToTime(currentDuration),
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                  {!option.duration && isSelected && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex flex-row gap-2 items-center justify-between">
                        <div className="flex flex-col gap-2">
                          <div className="text-xs font-medium text-foreground">
                            {t("booking.option.duration.custom.title")}
                          </div>
                          <p className="hidden sm:block text-xs text-muted-foreground">
                            {/* ${service.pricePerHour}/hour •  */}
                            {t("booking.option.duration.custom.min_max", {
                              min: t(
                                "duration_hour_min_format",
                                durationToTime(15),
                              ),
                              max: t(
                                "duration_hour_min_format",
                                durationToTime(240),
                              ),
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDuration(baseDuration ? baseDuration - 15 : 0);
                            }}
                            disabled={
                              baseDuration ? baseDuration - 15 <= 0 : false
                            }
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center border transition-colors",
                              !baseDuration || baseDuration <= 15
                                ? "border-muted text-muted-foreground cursor-not-allowed"
                                : "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
                            )}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-28 text-center font-semibold text-foreground">
                            {t(
                              "duration_hour_min_format",
                              durationToTime(baseDuration || 0),
                            )}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDuration(
                                baseDuration ? baseDuration + 15 : 15,
                              );
                            }}
                            disabled={
                              baseDuration ? baseDuration >= 240 : false
                            }
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center border transition-colors",
                              baseDuration && baseDuration >= 240
                                ? "border-muted text-muted-foreground cursor-not-allowed"
                                : "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
                            )}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="sm:hidden text-xs text-muted-foreground mt-2">
                        {/* ${service.pricePerHour}/hour •  */}
                        {t("booking.option.duration.custom.min_max", {
                          min: t(
                            "duration_hour_min_format",
                            durationToTime(15),
                          ),
                          max: t(
                            "duration_hour_min_format",
                            durationToTime(240),
                          ),
                        })}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

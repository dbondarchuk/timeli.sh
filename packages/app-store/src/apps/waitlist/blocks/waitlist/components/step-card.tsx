import { useI18n } from "@vivid/i18n";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Spinner,
} from "@vivid/ui";
import { durationToTime, formatAmountString } from "@vivid/utils";
import { DollarSign, Timer } from "lucide-react";
import React from "react";
import {
  WaitlistPublicKeys,
  waitlistPublicNamespace,
  WaitlistPublicNamespace,
} from "../../../translations/types";
import { useScheduleContext } from "./context";
import { WaitlistSteps } from "./steps";

export const StepCard: React.FC = () => {
  const t = useI18n<WaitlistPublicNamespace, WaitlistPublicKeys>(
    waitlistPublicNamespace,
  );

  const ctx = useScheduleContext();
  const { duration, price, appointmentOption, step: stepType } = ctx;

  const [isPrevLoading, setIsPrevLoading] = React.useState(false);
  const [isNextLoading, setIsNextLoading] = React.useState(false);

  const step = WaitlistSteps[stepType];

  const isLoading = isPrevLoading || isNextLoading;

  const onClick = React.useCallback(
    async (dir: "prev" | "next") => {
      const setIsLoadingFn =
        dir === "prev" ? setIsPrevLoading : setIsNextLoading;
      const { action } = dir === "prev" ? step.prev : step.next;

      setIsLoadingFn(true);
      try {
        await action(ctx);
      } finally {
        setIsLoadingFn(false);
      }
    },
    [step, ctx],
  );

  const StepContent = WaitlistSteps[stepType].Content;

  return (
    <Card className="sm:min-w-min md:w-full bg-transparent text-foreground">
      <CardHeader className="text-center flex flex-col gap-2">
        <CardTitle>{appointmentOption.name}</CardTitle>
        {(!!duration || !!price) && (
          <CardDescription className="flex flex-row gap-2 justify-center place-items-center text-foreground">
            {duration && (
              <div className="flex flex-row items-center">
                <Timer className="mr-1" />
                {t("block.durationHourMinFormat", durationToTime(duration))}
              </div>
            )}
            {!!price && (
              <div className="flex flex-row items-center">
                <DollarSign className="mr-1" />
                {formatAmountString(price)}
              </div>
            )}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <StepContent />
      </CardContent>
      <CardFooter className="w-100 flex justify-between">
        <div>
          {step.prev.show(ctx) && (
            <Button
              variant={"outline"}
              disabled={isLoading || !step.prev.isEnabled(ctx)}
              onClick={() => onClick("prev")}
            >
              {isPrevLoading && <Spinner />}
              {t("block.buttons.steps.back")}
            </Button>
          )}
        </div>
        <div>
          {step.next.show(ctx) && (
            <Button
              variant={"outline"}
              disabled={isLoading || !step.next.isEnabled(ctx)}
              onClick={() => onClick("next")}
            >
              {isNextLoading && <Spinner />}
              {t("block.buttons.steps.next")}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

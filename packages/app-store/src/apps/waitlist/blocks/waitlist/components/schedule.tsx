"use client";

import { useI18n } from "@vivid/i18n";
import type {
  AppointmentAddon,
  AppointmentChoice,
  AppointmentFields,
  FieldSchema,
} from "@vivid/types";
import { Spinner, toast } from "@vivid/ui";
import React from "react";
import { WaitlistDate, WaitlistRequest } from "../../../models/waitlist";
import {
  WaitlistPublicKeys,
  waitlistPublicNamespace,
  WaitlistPublicNamespace,
} from "../../../translations/types";
import { StepType, WaitlistContext } from "./context";
import { StepCard } from "./step-card";

export type ScheduleProps = {
  appointmentOption: AppointmentChoice;
  goBack?: () => void;
  successPage?: string;
  fieldsSchema: Record<string, FieldSchema>;
  timeZone: string;
  showPromoCode?: boolean;
  waitlistAppId: string;
  className?: string;
  id?: string;
  isEditor?: boolean;
};

export const Schedule: React.FC<
  ScheduleProps & React.HTMLAttributes<HTMLDivElement>
> = ({
  appointmentOption,
  goBack,
  successPage,
  fieldsSchema,
  timeZone,
  showPromoCode,
  waitlistAppId,
  className,
  id,
  isEditor,
  ...props
}) => {
  const t = useI18n<WaitlistPublicNamespace, WaitlistPublicKeys>(
    waitlistPublicNamespace,
  );

  const errors = React.useMemo(
    () => ({
      submitWaitlistTitle: t("block.errors.submit.title"),
      submitWaitlistDescription: t("block.errors.submit.description"),
    }),
    [t],
  );

  const topRef = React.createRef<HTMLDivElement>();

  const appointmentOptionDuration = appointmentOption.duration;
  const [duration, setDuration] = React.useState<number | undefined>(
    appointmentOptionDuration,
  );

  React.useEffect(() => {
    setDuration(appointmentOptionDuration);
  }, [appointmentOptionDuration, setDuration]);

  let initialStep: StepType = "duration";
  if (appointmentOption.addons && appointmentOption.addons.length) {
    initialStep = "addons";
  } else if (appointmentOption.duration) initialStep = "waitlist-form";

  const [step, setStep] = React.useState<StepType>(initialStep);

  const [selectedAddons, setSelectedAddons] = React.useState<
    AppointmentAddon[]
  >([]);

  const [isLoading, setIsLoading] = React.useState(false);
  const [fields, setFields] = React.useState<AppointmentFields>({
    name: "",
    email: "",
    phone: "",
  });

  const [waitlistTimes, setWaitlistTimes] = React.useState<{
    asSoonAsPossible: boolean;
    dates?: WaitlistDate[];
  }>({
    asSoonAsPossible: true,
    dates: [],
  });

  const [isFormValid, setIsFormValid] = React.useState(false);

  const onWaitlistSubmit = async () => {
    if (!waitlistAppId) return;

    setIsLoading(true);

    try {
      const waitlistBody: WaitlistRequest = {
        dates: waitlistTimes.asSoonAsPossible
          ? (undefined as any)
          : waitlistTimes.dates,
        asSoonAsPossible: waitlistTimes.asSoonAsPossible,
        email: fields.email,
        name: fields.name,
        phone: fields.phone,
        optionId: appointmentOption._id,
        addonsIds: selectedAddons?.map((addon) => addon._id),
        duration: duration,
      };

      const response = await fetch(`/api/apps/${waitlistAppId}/waitlist`, {
        method: "POST",
        body: JSON.stringify(waitlistBody),
      });

      if (response.status >= 400) {
        throw new Error(response.statusText);
      }

      setStep("waitlist-confirmation");
    } catch (e) {
      toast.error(errors.submitWaitlistTitle, {
        description: errors.submitWaitlistDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    topRef?.current?.scrollIntoView();
  }, [step]);

  return (
    <div className="relative" id={id} {...props}>
      <div ref={topRef} />
      <WaitlistContext.Provider
        value={{
          selectedAddons,
          appointmentOption,
          duration,
          step,
          setStep,
          fields,
          setFields,
          onWaitlistSubmit,
          setDuration,
          setSelectedAddons,
          goBack,
          isFormValid,
          setIsFormValid,
          className,
          isEditor,
          waitlistAppId,
          waitlistTimes,
          setWaitlistTimes,
        }}
      >
        <StepCard />
      </WaitlistContext.Provider>

      {isLoading && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-white opacity-50">
          <div role="status">
            <Spinner className="w-20 h-20" />
            <span className="sr-only">{t("block.loadingPlaceholder")}</span>
          </div>
        </div>
      )}
    </div>
  );
};

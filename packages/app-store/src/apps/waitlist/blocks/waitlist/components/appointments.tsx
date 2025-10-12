"use client";

import { AppointmentChoice, FieldSchema } from "@vivid/types";
import { cn } from "@vivid/ui";
import { useSearchParams } from "next/navigation";
import React from "react";
import { AppointmentsCard } from "./appointments-card";
import { Schedule } from "./schedule";

export type AppointmentsProps = {
  options: AppointmentChoice[];
  optionsClassName?: string;
  successPage?: string;
  fieldsSchema: Record<string, FieldSchema>;
  timeZone: string;
  showPromoCode?: boolean;
  waitlistAppId: string;
  className?: string;
  id?: string;
  isEditor?: boolean;
};

export const Appointments: React.FC<
  AppointmentsProps & React.HTMLAttributes<HTMLDivElement>
> = ({
  options,
  optionsClassName,
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
  const fromQuery = useSearchParams().get("option");
  const [option, setOption] = React.useState<string | null>(fromQuery);
  const selected = options.find((m) => m._id === option);

  return (
    <>
      {!selected ? (
        <AppointmentsCard
          options={options}
          onSelectOption={setOption}
          className={cn(className, optionsClassName)}
          id={id}
          {...props}
        />
      ) : (
        <Schedule
          className={cn(className)}
          appointmentOption={selected}
          successPage={successPage}
          goBack={() => setOption(null)}
          fieldsSchema={fieldsSchema}
          timeZone={timeZone}
          showPromoCode={showPromoCode}
          waitlistAppId={waitlistAppId}
          id={id}
          isEditor={isEditor}
          {...props}
        />
      )}
    </>
  );
};

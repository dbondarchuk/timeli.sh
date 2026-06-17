"use client";

import {
  AppointmentChoice,
  BookingRestriction,
  FieldSchema,
  isBookingLimitRestriction,
} from "@timelish/types";
import { cn } from "@timelish/ui";
import { useSearchParams } from "next/navigation";
import React from "react";
import { BookingRestrictionBanner } from "../../../../components/booking-restriction-banner";
import { AppointmentsCard } from "./appointments-card";
import { Schedule } from "./schedule";

export type AppointmentsProps = {
  options: AppointmentChoice[];
  optionsClassName?: string;
  successPage?: string;
  fieldsSchema: Record<string, FieldSchema>;
  showPromoCode?: boolean;
  bookingRestriction?: BookingRestriction;
  className?: string;
  id?: string;
  isEditor?: boolean;
  appId?: string;
  isOnlyWaitlist: boolean;
};

export const Appointments: React.FC<
  AppointmentsProps & React.HTMLAttributes<HTMLDivElement>
> = ({
  options,
  optionsClassName,
  successPage,
  fieldsSchema,
  showPromoCode,
  bookingRestriction,
  className,
  id,
  isEditor,
  appId,
  isOnlyWaitlist,
  ...props
}) => {
  const fromQuery = useSearchParams().get("option");
  const [option, setOption] = React.useState<string | null>(fromQuery);
  const selected = options.find((m) => m._id === option);
  const isBookingRestricted =
    !isOnlyWaitlist && isBookingLimitRestriction(bookingRestriction);

  return (
    <>
      {!selected ? (
        <>
          {isBookingRestricted && (
            <BookingRestrictionBanner className={cn("mb-4", className)} />
          )}
          <AppointmentsCard
            options={options}
            onSelectOption={setOption}
            className={cn(className, optionsClassName)}
            id={id}
            isBookingRestricted={isBookingRestricted}
            {...props}
          />
        </>
      ) : (
        <Schedule
          className={cn(className)}
          appointmentOption={selected}
          successPage={successPage}
          goBack={() => setOption(null)}
          fieldsSchema={fieldsSchema}
          showPromoCode={showPromoCode}
          bookingRestriction={bookingRestriction}
          id={id}
          waitlistAppId={appId}
          isEditor={isEditor}
          isOnlyWaitlist={isOnlyWaitlist}
          {...props}
        />
      )}
    </>
  );
};

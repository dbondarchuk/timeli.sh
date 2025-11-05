"use client";
import { clientApi } from "@timelish/api-sdk";
import { GetAppointmentOptionsResponse } from "@timelish/types";
import { Skeleton } from "@timelish/ui";
import React from "react";
import { Appointments } from "./appointments";
import { demoBookingOptionsResponse } from "./fixtures";
import { BookingProps } from "./types";

export const Booking: React.FC<
  BookingProps & {
    id?: string;
    isEditor?: boolean;
  } & React.HTMLAttributes<HTMLDivElement>
> = ({ successPage, className, id, isEditor, ...props }) => {
  const [response, setResponse] =
    React.useState<GetAppointmentOptionsResponse | null>(null);

  React.useEffect(() => {
    const loadOptions = async () => {
      const data = await clientApi.booking.getBookingOptions();
      setResponse(data);
    };

    if (!isEditor) {
      loadOptions();
    } else {
      setResponse(demoBookingOptionsResponse);
    }
  }, [isEditor]);

  if (!response)
    return (
      <div className={className} id={id} {...props}>
        <Skeleton className="w-full h-48" />
        <Skeleton className="w-full h-48" />
        <Skeleton className="w-full h-48" />
      </div>
    );

  return (
    <Appointments
      id={id}
      {...props}
      className={className}
      options={response.options}
      successPage={successPage ?? undefined}
      fieldsSchema={response.fieldsSchema}
      showPromoCode={response.showPromoCode}
      isEditor={isEditor}
    />
  );
};

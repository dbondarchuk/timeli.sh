"use client";
import { clientApi } from "@vivid/api-sdk";
import { GetAppointmentOptionsResponse } from "@vivid/types";
import { Skeleton } from "@vivid/ui";
import React from "react";
import { Appointments } from "./appointments";
import { demoBookingOptionsResponse } from "./fixtures";
import { BookingWithWaitlistProps } from "./types";

export const BookingWithWaitlist: React.FC<
  BookingWithWaitlistProps & {
    id?: string;
    isEditor?: boolean;
    appId?: string;
    isOnlyWaitlist?: boolean;
  } & React.HTMLAttributes<HTMLDivElement>
> = ({
  successPage,
  className,
  id,
  isEditor,
  appId,
  isOnlyWaitlist,
  ...props
}) => {
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

  if (!response || !appId)
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
      appId={appId}
      isOnlyWaitlist={isOnlyWaitlist ?? false}
    />
  );
};

"use client";

import { GetAppointmentOptionsResponse } from "@vivid/types";
import { Skeleton } from "@vivid/ui";
import React from "react";
import { Appointments } from "./appointments";
import { demoBookingOptionsResponse } from "./fixtures";
import { WaitlistProps } from "./types";

export const Waitlist: React.FC<
  WaitlistProps & {
    id?: string;
    isEditor?: boolean;
    appId?: string;
  } & React.HTMLAttributes<HTMLDivElement>
> = ({ className, id, isEditor, appId, ...props }) => {
  const [response, setResponse] =
    React.useState<GetAppointmentOptionsResponse | null>(null);

  React.useEffect(() => {
    const loadOptions = async () => {
      const response = await fetch("/api/booking/options");
      const data = await response.json();
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
      fieldsSchema={response.fieldsSchema}
      timeZone={response.timeZone}
      showPromoCode={response.showPromoCode}
      waitlistAppId={appId}
      isEditor={isEditor}
    />
  );
};

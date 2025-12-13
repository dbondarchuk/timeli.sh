"use client";
import { clientApi } from "@timelish/api-sdk";
import { GetAppointmentOptionsResponse } from "@timelish/types";
import React from "react";
import { demoBookingOptionsResponse } from "../../../../components/fixtures";
import { Schedule } from "./schedule";

export type BookingWithWaitlistProps = {
  successPage?: string | null;
  className?: string;
  scrollToTop?: boolean | null;
  hideTitle?: boolean | null;
  hideSteps?: boolean | null;
};

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
  scrollToTop,
  hideTitle,
  hideSteps,
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

  if (!appId) return null;

  return (
    <Schedule
      id={id}
      {...props}
      appointmentOptions={response?.options ?? []}
      areAppointmentOptionsLoading={!response}
      successPage={successPage ?? undefined}
      fieldsSchema={response?.fieldsSchema ?? {}}
      showPromoCode={response?.showPromoCode ?? false}
      isEditor={isEditor}
      waitlistAppId={appId}
      isOnlyWaitlist={isOnlyWaitlist ?? false}
      className={className}
      scrollToTop={scrollToTop ?? false}
      hideTitle={hideTitle ?? false}
      hideSteps={hideSteps ?? false}
    />
  );
};

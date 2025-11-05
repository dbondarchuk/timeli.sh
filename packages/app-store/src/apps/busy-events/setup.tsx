import { ComplexAppPageProps } from "@timelish/types";
import React from "react";
import { BusyEventsForm } from "./components/form";

export const BusyEventsAppSetup: React.FC<ComplexAppPageProps> = ({
  appId,
}) => {
  return <BusyEventsForm appId={appId} />;
};

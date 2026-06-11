import React from "react";
import { BusyEventsForm } from "./components/form";

export const BusyEventsAppSetup: React.FC<{ appId: string }> = ({ appId }) => {
  return <BusyEventsForm appId={appId} />;
};

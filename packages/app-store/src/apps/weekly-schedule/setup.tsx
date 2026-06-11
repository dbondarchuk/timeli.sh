"use client";

import React from "react";
import { WeeklyScheduleForm } from "./components/form";

export const WeeklyScheduleAppSetup: React.FC<{ appId: string }> = ({
  appId,
}) => {
  return <WeeklyScheduleForm appId={appId} />;
};

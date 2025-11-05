"use client";

import { ComplexAppPageProps } from "@timelish/types";
import React from "react";
import { WeeklyScheduleForm } from "./components/form";

export const WeeklyScheduleAppSetup: React.FC<ComplexAppPageProps> = ({
  appId,
}) => {
  return <WeeklyScheduleForm appId={appId} />;
};

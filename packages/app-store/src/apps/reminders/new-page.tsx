"use client";

import { ReminderForm } from "./form";

export const NewReminderPage: React.FC<{ appId: string }> = ({ appId }) => {
  return <ReminderForm appId={appId} />;
};

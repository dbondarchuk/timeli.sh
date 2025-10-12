"use client";

import { FollowUpForm } from "./form";

export const NewFollowUpPage: React.FC<{ appId: string }> = ({ appId }) => {
  return <FollowUpForm appId={appId} />;
};

"use client";

import { useActivityFeedStore } from "@/notifications/store";
import { adminApi } from "@timelish/api-sdk";
import React, { useEffect } from "react";

export const MarkAsReadEffect: React.FC<{
  uniqueKey: string | number;
}> = ({ uniqueKey }) => {
  const { clearSeverity } = useActivityFeedStore();
  useEffect(() => {
    void adminApi.activities.markActivityFeedRead().then(() => {
      clearSeverity();
    });
  }, [uniqueKey]);

  return null;
};

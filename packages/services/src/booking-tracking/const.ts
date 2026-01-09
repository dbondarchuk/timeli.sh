// Constants
export const BOOKING_TRACKING_APP_ID = "booking-tracking";

export const ABANDON_AFTER_SECONDS = 30 * 60; // 30 minutes
export const ABANDONED_BOOKINGS_JOB_SCHEDULE_INTERVAL_SECONDS = 15 * 60; // 15 minutes
export const ABANDONED_BOOKINGS_JOB_ID = "booking-tracking-process-abandoned";
export const ABANDONED_BOOKINGS_JOB_TYPE = "processAbandonedBookings";

export const REDIS_TTL_SECONDS = 60 * 60 * 24 * 2; // 2 days
export const REDIS_KEY_PREFIX = "booking:session";

export const getRedisKey = (companyId: string, sessionId: string): string => {
  return `${REDIS_KEY_PREFIX}:${companyId}:${sessionId}`;
};

export const getAbandonedBookingsJobId = (companyId: string): string => {
  return `${ABANDONED_BOOKINGS_JOB_ID}-${companyId}`;
};

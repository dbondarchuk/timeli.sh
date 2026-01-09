import { getLoggerFactory } from "@timelish/logger";
import {
  BOOKING_TRACKING_STEP_EVENT_TYPE,
  BookingStep,
  BookingTrackingEventData,
  BookingTrackingMetadata,
  IEventHook,
} from "@timelish/types";
import { NextRequest } from "next/server";
import { getServicesContainer } from "./utils";

/**
 * Tracks a booking step in core service and calls booking-tracking-hook apps
 * Handles step revisiting (updates lastSeenAt but doesn't duplicate steps)
 */
export async function trackBookingStep(
  request: NextRequest,
  step: BookingStep,
  metadata?: BookingTrackingMetadata,
): Promise<void> {
  const logger = getLoggerFactory("BookingTracking")("trackBookingStep");

  try {
    // Extract session ID from headers (set by with-logger middleware)
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      logger.debug("No session ID found, skipping tracking");
      return;
    }

    // Get services container
    const servicesContainer = await getServicesContainer();
    const eventData: BookingTrackingEventData = {
      sessionId,
      step,
      metadata,
    };

    // Also call hooks asynchronously for apps that want to react (don't block the request)
    // This will enqueue a job that calls all apps with booking-tracking-hook scope
    await servicesContainer.jobService.enqueueHook<IEventHook, "onEvent">(
      "event-hook",
      "onEvent",
      BOOKING_TRACKING_STEP_EVENT_TYPE,
      eventData,
    );

    logger.debug(
      { sessionId, step, metadata },
      "Booking step tracked in core service and hooks enqueued",
    );
  } catch (error) {
    // Don't fail the request if tracking fails
    logger.error({ error, step }, "Failed to track booking step");
  }
}

/**
 * Tracks a booking step with customer info extracted from appointment request
 */
export async function trackBookingStepWithCustomer(
  request: NextRequest,
  step: BookingStep,
  appointmentRequest?: {
    fields?: {
      email: string;
      name: string;
      phone: string;
    };
    optionId?: string;
    dateTime?: Date;
    addonsIds?: string[];
  },
  metadata?: BookingTrackingMetadata,
): Promise<void> {
  // Try to find customer by email if available
  let customerId: string | undefined;
  if (appointmentRequest?.fields?.email && appointmentRequest?.fields?.phone) {
    try {
      const servicesContainer = await getServicesContainer();
      const customer = await servicesContainer.customersService.findCustomer(
        appointmentRequest.fields.email,
        appointmentRequest.fields.phone,
      );
      customerId = customer?._id;
    } catch (error) {
      // Ignore errors - customer might not exist yet
    }
  }

  const enhancedMetadata: BookingTrackingMetadata = {
    ...metadata,
    optionId: appointmentRequest?.optionId || metadata?.optionId,
    customerEmail: appointmentRequest?.fields?.email,
    customerName: appointmentRequest?.fields?.name,
    customerId,
  };

  return trackBookingStep(request, step, enhancedMetadata);
}

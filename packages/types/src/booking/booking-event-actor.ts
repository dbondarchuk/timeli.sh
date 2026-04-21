import type { EventSource } from "../events/envelope";

/** Who initiated a booking-side appointment mutation (used for event envelope source). */
export type BookingEventActor =
  | { type: "customer" }
  | { type: "user"; userId: string };

export function bookingActorToEventSource(
  actor: BookingEventActor,
  opts?: { customerId?: string },
): EventSource {
  if (actor.type === "user") {
    return { actor: "user", actorId: actor.userId };
  }
  return {
    actor: "customer",
    ...(opts?.customerId ? { actorId: opts.customerId } : {}),
  };
}

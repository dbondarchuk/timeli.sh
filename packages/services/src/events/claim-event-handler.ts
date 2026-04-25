import type { Redis } from "ioredis";

const HANDLER_TTL_SEC = 60 * 60 * 24 * 7;

/** Per-handler idempotency so retries only re-run failed side effects. */
export async function claimEventHandler(
  redis: Redis,
  organizationId: string,
  eventId: string,
  handler: string,
): Promise<boolean> {
  const key = `event:h:${organizationId}:${eventId}:${handler}`;
  const ok = await redis.set(key, "1", "EX", HANDLER_TTL_SEC, "NX");
  return ok === "OK";
}

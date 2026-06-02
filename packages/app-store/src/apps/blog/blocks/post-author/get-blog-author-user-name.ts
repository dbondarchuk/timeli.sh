import { cache } from "react";

const inflightUserNames = new Map<string, Promise<string | null>>();

const inflightKey = (organizationId: string, userId: string) =>
  `${organizationId}:${userId}`;

async function fetchBlogAuthorUserName(
  organizationId: string,
  userId: string,
): Promise<string | null> {
  const key = inflightKey(organizationId, userId);
  const pending = inflightUserNames.get(key);
  if (pending) {
    return pending;
  }

  const promise = (async () => {
    const { ServicesContainer } = await import("@timelish/services");
    const user =
      await ServicesContainer(organizationId).userService.getUser(userId);
    return user?.name ?? null;
  })();

  inflightUserNames.set(key, promise);

  try {
    return await promise;
  } finally {
    if (inflightUserNames.get(key) === promise) {
      inflightUserNames.delete(key);
    }
  }
}

/** Cached per-request; concurrent lookups for the same user reuse one in-flight promise. */
export const getBlogAuthorUserName = cache(fetchBlogAuthorUserName);

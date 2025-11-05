import { v4, v5 } from "uuid";
const NAMESPACE = "d80b729d-984c-4a30-ad90-70ae466a08a1";

export function generateId(seed?: string) {
  const uuid = seed ? v5(seed, NAMESPACE) : v4();
  return `block-${uuid}`;
}

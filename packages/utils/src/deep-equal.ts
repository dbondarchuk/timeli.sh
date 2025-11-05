import { deepEqual as fastDeepEqual } from "fast-equals";

export const deepEqual = (a: any, b: any) => {
  return fastDeepEqual(a, b);
};

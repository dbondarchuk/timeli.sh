import { Polar } from "@polar-sh/sdk";
import { PolarConfig } from "./types";

let polarSingleton: Polar | null = null;

export function getPolarClient({ accessToken, server }: PolarConfig): Polar {
  if (!polarSingleton) {
    polarSingleton = new Polar({
      accessToken,
      server,
    });
  }

  return polarSingleton!;
}

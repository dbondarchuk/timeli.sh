"use server";

import { joinWaitlist as joinWaitlistService } from "@/services/waitlist";

export async function joinWaitlist(email: string) {
  return joinWaitlistService(email);
}

import { ConnectedAppData } from "@timelish/types";
import { WaitlistEntry } from "./waitlist";

export interface IWaitlistHook {
  onWaitlistEntryCreated?: (
    appData: ConnectedAppData,
    waitlistEntry: WaitlistEntry,
  ) => Promise<void>;
  onWaitlistEntryDismissed?: (
    appData: ConnectedAppData,
    waitlistEntries: WaitlistEntry[],
  ) => Promise<void>;
}

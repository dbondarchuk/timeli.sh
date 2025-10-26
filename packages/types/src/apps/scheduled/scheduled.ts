import { JobRequest } from "../../jobs";
import { ConnectedAppData } from "../connected-app.data";

export interface IScheduled {
  processJob?(appData: ConnectedAppData, jobData: JobRequest): Promise<void>;
}

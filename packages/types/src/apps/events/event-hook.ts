import { ConnectedAppData } from "../connected-app.data";

export interface IEventHook {
  onEvent: (
    appData: ConnectedAppData,
    event: string,
    data: any,
  ) => Promise<void>;
}

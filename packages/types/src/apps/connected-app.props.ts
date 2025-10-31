import type { Db } from "mongodb";
import type { IServicesContainer } from "../services/container";
import type { ConnectedAppUpdateModel } from "./connected-app.data";

export type IConnectedAppProps = {
  companyId: string;
  update: (updateMode: ConnectedAppUpdateModel) => Promise<void>;
  services: IServicesContainer;
  getDbConnection: () => Promise<Db>;
};

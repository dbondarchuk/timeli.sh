import {
  CommunicationChannel,
  CommunicationDirection,
  CommunicationLog,
  CommunicationLogEntity,
  CommunicationParticipantType,
} from "../communication";
import { Query, WithTotal } from "../database";
import { DateRange } from "../general";

export interface ICommunicationLogsService {
  log(
    log: Omit<CommunicationLogEntity, "dateTime" | "_id" | "companyId">,
  ): Promise<void>;
  getCommunicationLogs(
    query: Query & {
      direction?: CommunicationDirection[];
      channel?: CommunicationChannel[];
      participantType?: CommunicationParticipantType[];
      range?: DateRange;
      customerId?: string | string[];
      appointmentId?: string;
    },
  ): Promise<WithTotal<CommunicationLog>>;
  clearAllLogs(): Promise<void>;
  clearSelectedLogs(ids: string[]): Promise<void>;
  clearOldLogs(maxDate: Date): Promise<void>;
}

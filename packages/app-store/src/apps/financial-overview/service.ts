import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  ConnectedAppData,
  ConnectedAppStatusWithText,
  IConnectedApp,
  IConnectedAppProps,
} from "@timelish/types";

export default class FinancialOverviewService implements IConnectedApp {
  protected readonly loggerFactory: LoggerFactory;

  public constructor(protected readonly props: IConnectedAppProps) {
    this.loggerFactory = getLoggerFactory(
      "FinancialOverviewService",
      props.companyId,
    );
  }

  public async processRequest(
    appData: ConnectedAppData,
    data: any,
  ): Promise<ConnectedAppStatusWithText> {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      { appId: appData._id },
      "Processing Financial Overview connection request",
    );

    const status: ConnectedAppStatusWithText = {
      status: "connected",
      statusText: "app_financial-overview_admin.statusText.successfully_set_up",
    };

    this.props.update({
      ...status,
    });

    logger.info(
      { appId: appData._id, status: status.status },
      "Successfully set up financial overview",
    );

    return status;
  }
}

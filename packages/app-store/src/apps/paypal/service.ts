import { Environment } from "@paypal/paypal-server-sdk";
import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  ApiRequest,
  ApiResponse,
  ConnectedAppData,
  ConnectedAppError,
  ConnectedAppStatusWithText,
  IConnectedApp,
  IConnectedAppProps,
  IPaymentProcessor,
  Payment,
  PaymentFee,
} from "@timelish/types";
import { decrypt, encrypt, maskify } from "@timelish/utils";
import { PaypalClient } from "./client";
import { PAYPAL_APP_NAME } from "./const";
import {
  CaptureOrderRequest,
  captureOrderRequestSchema,
  CreateOrderRequest,
  createOrderRequestSchema,
  PaypalConfiguration,
  paypalConfigurationSchema,
  PaypalFormProps,
} from "./models";
import {
  PaypalAdminAllKeys,
  PaypalAdminKeys,
  PaypalAdminNamespace,
} from "./translations/types";

export const MASKED_SECRET_KEY = "this-is-a-masked-secret-key";

class PaypalConnectedApp
  implements IConnectedApp<PaypalConfiguration>, IPaymentProcessor
{
  protected readonly loggerFactory: LoggerFactory;

  public constructor(protected readonly props: IConnectedAppProps) {
    this.loggerFactory = getLoggerFactory(
      "PaypalConnectedApp",
      props.companyId,
    );
  }

  public async processAppData(
    appData: PaypalConfiguration,
  ): Promise<PaypalConfiguration> {
    return {
      ...appData,
      secretKey: appData.secretKey ? MASKED_SECRET_KEY : "",
      clientId: appData.clientId ? MASKED_SECRET_KEY : "",
    };
  }

  public async processRequest(
    appData: ConnectedAppData,
    data: PaypalConfiguration,
  ): Promise<
    ConnectedAppStatusWithText<PaypalAdminNamespace, PaypalAdminKeys>
  > {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      { appId: appData._id },
      "Processing PayPal configuration request",
    );

    if (data.secretKey === MASKED_SECRET_KEY && appData?.data?.secretKey) {
      data.secretKey = appData.data.secretKey;
    } else if (data.secretKey) {
      data.secretKey = encrypt(data.secretKey);
    }

    if (data.clientId === MASKED_SECRET_KEY && appData?.data?.clientId) {
      data.clientId = appData.data.clientId;
    } else if (data.clientId) {
      data.clientId = encrypt(data.clientId);
    }

    try {
      if (!paypalConfigurationSchema.safeParse(data).success) {
        logger.error(
          { appId: appData._id },
          "Invalid PayPal configuration data",
        );
        throw new ConnectedAppError(
          "app_paypal_admin.statusText.invalid_configuration_data" satisfies PaypalAdminAllKeys,
        );
      }

      logger.debug({ appId: appData._id }, "Validating PayPal configuration");

      const client = await this.getSimplifiedClient({ data });
      await client.getAccessToken();

      logger.debug(
        { appId: appData._id },
        "Successfully obtained PayPal access token",
      );

      const status: ConnectedAppStatusWithText<
        PaypalAdminNamespace,
        PaypalAdminKeys
      > = {
        status: "connected",
        statusText: "app_paypal_admin.statusText.successfully_connected",
      };

      const decryptedClientId = decrypt(data.clientId);

      this.props.update({
        account: {
          username: maskify(decryptedClientId),
        },
        data,
        ...status,
      });

      logger.info(
        { appId: appData._id, clientId: maskify(decryptedClientId) },
        "Successfully connected to PayPal account",
      );

      return status;
    } catch (e: any) {
      logger.error(
        { appId: appData._id, error: e?.message || e?.toString() },
        "Error processing PayPal configuration request",
      );

      const status: ConnectedAppStatusWithText<
        PaypalAdminNamespace,
        PaypalAdminKeys
      > = {
        status: "failed",
        statusText:
          e instanceof ConnectedAppError
            ? (e.key as PaypalAdminAllKeys)
            : ("app_paypal_admin.statusText.error_processing_configuration" satisfies PaypalAdminAllKeys),
      };

      this.props.update({
        ...status,
      });

      return status;
    }
  }

  public async processAppCall(
    appData: ConnectedAppData,
    slug: string[],
    request: ApiRequest,
  ): Promise<ApiResponse | undefined> {
    const logger = this.loggerFactory("processAppCall");
    logger.debug(
      { appId: appData._id, slug, method: request.method },
      "Processing PayPal app call",
    );

    if (
      slug.length === 1 &&
      slug[0] === "orders" &&
      request.method.toUpperCase() === "POST"
    ) {
      logger.debug({ appId: appData._id }, "Creating PayPal order");

      try {
        const body = await request.json();
        const { data, success, error } =
          createOrderRequestSchema.safeParse(body);
        if (!success) {
          logger.error(
            { appId: appData._id, error },
            "Invalid create order request data",
          );
          return Response.json({ success: false, error }, { status: 400 });
        }

        logger.debug(
          { appId: appData._id, paymentIntentId: data.paymentIntentId },
          "Creating PayPal order",
        );

        return await this.createOrder(appData, data);
      } catch (error: any) {
        logger.error(
          { appId: appData._id, error: error?.message || error?.toString() },
          "Error creating PayPal order",
        );
        throw error;
      }
    } else if (
      slug.length === 2 &&
      slug[0] === "orders" &&
      slug[1] === "capture" &&
      request.method.toUpperCase() === "POST"
    ) {
      logger.debug({ appId: appData._id }, "Capturing PayPal order");

      try {
        const body = await request.json();
        const { data, success, error } =
          captureOrderRequestSchema.safeParse(body);
        if (!success) {
          logger.error(
            { appId: appData._id, error },
            "Invalid capture order request data",
          );
          return Response.json({ success: false, error }, { status: 400 });
        }

        logger.debug(
          {
            appId: appData._id,
            orderId: data.orderId,
            paymentIntentId: data.paymentIntentId,
          },
          "Capturing PayPal order",
        );

        return await this.captureOrder(appData, data);
      } catch (error: any) {
        logger.error(
          { appId: appData._id, error: error?.message || error?.toString() },
          "Error capturing PayPal order",
        );
        throw error;
      }
    }

    logger.debug(
      { appId: appData._id, slug },
      "No matching PayPal app call handler found",
    );

    return undefined;
  }

  // protected getClient({
  //   data,
  //   token: dbToken,
  // }: Pick<ConnectedAppData, "data" | "token">): Client {
  //   const client = new Client({
  //     environment:
  //       process.env.PAYPAL_ENVIRONMENT?.toLocaleLowerCase() === "sandbox"
  //         ? Environment.Sandbox
  //         : Environment.Production,
  //     clientCredentialsAuthCredentials: {
  //       oAuthClientId: data.clientId,
  //       oAuthClientSecret: data.secretKey,

  //       oAuthOnTokenUpdate: (token: OAuthToken) => {
  //         // Add the callback handler to perform operations like save to DB or file etc.
  //         // It will be triggered whenever the token gets updated
  //         this.props.update({
  //           token,
  //         });
  //       },
  //       oAuthTokenProvider: (
  //         lastOAuthToken: OAuthToken | undefined,
  //         authManager: ClientCredentialsAuthManager
  //       ) => {
  //         // Add the callback handler to provide a new OAuth token
  //         // It will be triggered whenever the lastOAuthToken is undefined or expired
  //         return dbToken ?? authManager.fetchToken();
  //       },
  //     },
  //   });

  //   return client;
  // }

  public getFormProps(
    appData: ConnectedAppData<PaypalConfiguration>,
  ): PaypalFormProps {
    if (!appData.data)
      throw new ConnectedAppError(
        "app_paypal_admin.statusText.app_not_configured" satisfies PaypalAdminAllKeys,
      );
    const { secretKey, clientId, ...rest } = appData.data;

    return {
      ...rest,
      clientId: decrypt(clientId),
      isSandbox: this.environment === Environment.Sandbox,
    };
  }

  protected async createOrder(
    appData: ConnectedAppData,
    request: CreateOrderRequest,
  ) {
    const logger = this.loggerFactory("createOrder");
    logger.debug(
      { appId: appData._id, paymentIntentId: request.paymentIntentId },
      "Creating PayPal order",
    );

    try {
      const intent = await this.props.services.paymentsService.getIntent(
        request.paymentIntentId,
      );

      if (!intent) {
        logger.error(
          { appId: appData._id, paymentIntentId: request.paymentIntentId },
          "Payment intent not found",
        );
        return Response.json({ error: "intent_not_found" }, { status: 400 });
      }

      logger.debug(
        {
          appId: appData._id,
          paymentIntentId: request.paymentIntentId,
          amount: intent.amount,
        },
        "Retrieved payment intent, creating PayPal order",
      );

      const client = await this.getSimplifiedClient(appData);
      // const ordersController = new OrdersController(client);
      // const { result: order, ...httpResponse } =
      //   await ordersController.createOrder({
      //     body: {
      //       intent: CheckoutPaymentIntent.Capture,
      //       purchaseUnits: [
      //         {
      //           amount: {
      //             currencyCode: "USD",
      //             value: formatAmountString(intent.amount),
      //           },
      //         },
      //       ],
      //     },
      //   });

      const { order, error } = await client.createOrder({
        amount: intent.amount,
        currency: "USD",
        intent: "CAPTURE",
      });

      if (error) {
        logger.error(
          {
            appId: appData._id,
            paymentIntentId: request.paymentIntentId,
            statusCode: error.statusCode,
          },
          "Failed to create PayPal order",
        );
        return Response.json(
          { error: "create_order_failed" },
          { status: error.statusCode || 500 },
        );
      }

      logger.debug(
        {
          appId: appData._id,
          paymentIntentId: request.paymentIntentId,
          orderId: order.id,
        },
        "Successfully created PayPal order, updating payment intent",
      );

      await this.props.services.paymentsService.updateIntent(intent._id, {
        externalId: order.id,
      });

      logger.info(
        {
          appId: appData._id,
          paymentIntentId: request.paymentIntentId,
          orderId: order.id,
        },
        "Successfully created PayPal order",
      );

      return Response.json(order);
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          paymentIntentId: request.paymentIntentId,
          error: error?.message || error?.toString(),
        },
        "Error creating PayPal order",
      );
      throw error;
    }
  }

  protected async captureOrder(
    appData: ConnectedAppData,
    request: CaptureOrderRequest,
  ) {
    const logger = this.loggerFactory("captureOrder");
    logger.debug(
      {
        appId: appData._id,
        orderId: request.orderId,
        paymentIntentId: request.paymentIntentId,
      },
      "Capturing PayPal order",
    );

    try {
      const intent =
        await this.props.services.paymentsService.getIntentByExternalId(
          request.orderId,
        );

      if (!intent) {
        logger.error(
          { appId: appData._id, orderId: request.orderId },
          "Payment intent not found by external ID",
        );
        return Response.json({ error: "intent_not_found" }, { status: 400 });
      }

      if (intent._id !== request.paymentIntentId) {
        logger.error(
          {
            appId: appData._id,
            orderId: request.orderId,
            intentId: intent._id,
            requestIntentId: request.paymentIntentId,
          },
          "Payment intent ID mismatch",
        );
        return Response.json({ error: "intent_id_not_match" }, { status: 400 });
      }

      logger.debug(
        {
          appId: appData._id,
          orderId: request.orderId,
          paymentIntentId: request.paymentIntentId,
        },
        "Retrieved payment intent, capturing PayPal order",
      );

      const client = await this.getSimplifiedClient(appData);
      // const ordersController = new OrdersController(client);
      // const { result: order, ...httpResponse } =
      //   await ordersController.captureOrder({
      //     id: request.orderId,
      //   });

      const { order, error } = await client.captureOrder(request.orderId);

      if (error) {
        logger.error(
          {
            appId: appData._id,
            orderId: request.orderId,
            statusCode: error.statusCode,
          },
          "Failed to capture PayPal order",
        );

        await this.props.services.paymentsService.updateIntent(intent._id, {
          status: "failed",
        });

        return Response.json(
          { error: "capture_order_failed" },
          { status: error.statusCode || 500 },
        );
      }

      logger.debug(
        {
          appId: appData._id,
          orderId: request.orderId,
          paymentIntentId: request.paymentIntentId,
        },
        "Successfully captured PayPal order, updating payment intent status",
      );

      const platformFees: PaymentFee[] =
        order.purchase_units?.[0].payments?.captures?.[0]?.seller_receivable_breakdown?.platform_fees?.map(
          (fee) => ({
            type: "platform",
            amount: parseFloat(fee.amount.value) || 0,
          }),
        ) || [];

      const paypalFees: PaymentFee[] = order.purchase_units?.[0].payments
        ?.captures?.[0]?.seller_receivable_breakdown?.paypal_fee
        ? [
            {
              type: "transaction",
              amount:
                parseFloat(
                  order.purchase_units?.[0].payments?.captures?.[0]
                    ?.seller_receivable_breakdown?.paypal_fee.value,
                ) || 0,
            },
          ]
        : [];

      const fees = [...platformFees, ...paypalFees];

      await this.props.services.paymentsService.updateIntent(intent._id, {
        status: "paid",
        fees,
      });

      logger.info(
        {
          appId: appData._id,
          orderId: request.orderId,
          paymentIntentId: request.paymentIntentId,
        },
        "Successfully captured PayPal order",
      );

      return Response.json(order);
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          orderId: request.orderId,
          paymentIntentId: request.paymentIntentId,
          error: error?.message || error?.toString(),
        },
        "Error capturing PayPal order",
      );
      throw error;
    }
  }

  public async refundPayment(
    appData: ConnectedAppData,
    payment: Payment,
    amount: number,
  ): Promise<{ success: boolean; error?: string }> {
    const logger = this.loggerFactory("refundPayment");
    logger.debug(
      {
        appId: appData._id,
        paymentId: payment._id,
        paymentType: payment.type,
        paymentMethod: payment.method,
        amount,
        ...(payment.method === "online" && {
          appName: (payment as any).appName,
          externalId: (payment as any).externalId,
        }),
      },
      "Processing PayPal refund",
    );

    if (
      payment.method !== "online" ||
      (payment as any).appName !== PAYPAL_APP_NAME ||
      !(payment as any).externalId
    ) {
      logger.debug(
        { appId: appData._id, paymentId: payment._id },
        "Payment not supported for refund",
      );
      return { success: false, error: "not_supported" };
    }

    const externalId = (payment as any).externalId;

    try {
      logger.debug(
        { appId: appData._id, paymentId: payment._id, externalId },
        "Retrieving PayPal order for refund",
      );

      const client = await this.getSimplifiedClient(appData);
      // const ordersController = new OrdersController(client);
      // const { result: order, ...httpResponse } =
      //   await ordersController.getOrder({
      //     id: externalId,
      //   });

      const { order, error } = await client.getOrder(externalId);

      if (error) {
        logger.error(
          {
            appId: appData._id,
            paymentId: payment._id,
            externalId,
            statusCode: error.statusCode,
          },
          "Failed to retrieve PayPal order for refund",
        );
        return {
          success: false,
          error: JSON.stringify(error),
        };
      }

      const captureId = order?.purchase_units?.[0].payments?.captures?.[0].id;
      if (!captureId) {
        logger.error(
          { appId: appData._id, paymentId: payment._id, externalId },
          "Failed to get capture ID from PayPal order",
        );
        return { success: false, error: "failed_to_get_capture_id" };
      }

      logger.debug(
        { appId: appData._id, paymentId: payment._id, captureId },
        "Processing PayPal refund with capture ID",
      );

      // const clientRefund = this.getClient(appData);
      // const paymentsController = new PaymentsController(clientRefund);
      // const { result, ...refundHttpResponse } =
      //   await paymentsController.refundCapturedPayment({ captureId });

      const { ok: refundOk, error: refundError } = await client.refundPayment(
        captureId,
        amount,
      );

      if (!refundOk || refundError) {
        logger.error(
          {
            appId: appData._id,
            paymentId: payment._id,
            captureId,
            statusCode: refundError.statusCode,
          },
          "Failed to refund PayPal payment",
        );
        return {
          success: false,
          error: JSON.stringify(refundError),
        };
      }

      logger.info(
        { appId: appData._id, paymentId: payment._id, captureId },
        "Successfully refunded PayPal payment",
      );

      return { success: true };
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          paymentId: payment._id,
          error: error?.message || error?.toString(),
        },
        "Error processing PayPal refund",
      );
      throw error;
    }
  }

  protected async getSimplifiedClient({
    data,
    token: dbToken,
  }: Pick<
    ConnectedAppData<PaypalConfiguration>,
    "data" | "token"
  >): Promise<PaypalClient> {
    const logger = this.loggerFactory("getSimplifiedClient");
    const environment = this.environment;

    const clientId = data?.clientId ? decrypt(data.clientId) : undefined;
    const secretKey = data?.secretKey ? decrypt(data.secretKey) : undefined;

    logger.debug(
      {
        clientId: clientId ? maskify(clientId) : undefined,
        environment,
      },
      "Creating simplified PayPal client",
    );

    if (!data || !clientId || !secretKey) {
      logger.error("No PayPal configuration data provided");
      throw new ConnectedAppError(
        "app_paypal_admin.statusText.no_data" satisfies PaypalAdminAllKeys,
      );
    }

    try {
      // const { url } = await this.props.services
      //   .ConfigurationService()
      //   .getConfiguration("general");

      logger.debug(
        { clientId: maskify(clientId) },
        "Created simplified PayPal client",
      );

      return new PaypalClient(
        clientId,
        secretKey,
        environment === Environment.Production,
      );
    } catch (error: any) {
      logger.error(
        {
          clientId: maskify(clientId),
          error: error?.message || error?.toString(),
        },
        "Error creating simplified PayPal client",
      );
      throw error;
    }
  }

  // protected getClient({
  //   data,
  //   token: dbToken,
  // }: Pick<ConnectedAppData<PaypalConfiguration>, "data" | "token">) {
  //   const logger = this.loggerFactory("getClient");

  //   const clientId = data?.clientId ? decrypt(data.clientId) : undefined;
  //   const secretKey = data?.secretKey ? decrypt(data.secretKey) : undefined;

  //   logger.debug(
  //     {
  //       clientId: clientId ? maskify(clientId) : undefined,
  //       environment: this.environment,
  //     },
  //     "Creating PayPal client"
  //   );

  //   if (!data || !clientId || !secretKey) {
  //     logger.error("No PayPal configuration data provided");
  //     throw new ConnectedAppError("paypal.statusText.no_data");
  //   }

  //   logger.debug(
  //     { clientId: maskify(clientId), environment: this.environment },
  //     "Created PayPal client"
  //   );

  //   return new Client({
  //     environment: this.environment,
  //     clientCredentialsAuthCredentials: {
  //       oAuthClientId: clientId,
  //       oAuthClientSecret: secretKey,
  //       oAuthOnTokenUpdate: async (token) => {
  //         logger.debug(
  //           { clientId: maskify(clientId) },
  //           "Updating PayPal OAuth token"
  //         );
  //         await this.props.update({
  //           token,
  //         });
  //       },
  //       oAuthTokenProvider: (lastOAuthToken, authManager) => {
  //         logger.debug(
  //           { clientId: maskify(clientId), hasExistingToken: !!dbToken },
  //           "Providing PayPal OAuth token"
  //         );
  //         const oAuthToken = dbToken;
  //         if (oAuthToken != null && !authManager.isExpired(oAuthToken)) {
  //           logger.debug(
  //             { clientId: maskify(clientId) },
  //             "Using existing PayPal OAuth token"
  //           );
  //           return oAuthToken;
  //         }

  //         logger.debug(
  //           { clientId: maskify(clientId) },
  //           "Fetching new PayPal OAuth token"
  //         );
  //         return authManager.fetchToken();
  //       },
  //     },
  //   });
  // }

  protected get environment() {
    return process.env.PAYPAL_ENV === "production"
      ? Environment.Production
      : process.env.NODE_ENV === "development" ||
          process.env.PAYPAL_ENVIRONMENT?.toLocaleLowerCase() === "sandbox"
        ? Environment.Sandbox
        : Environment.Production;
  }
}

export default PaypalConnectedApp;

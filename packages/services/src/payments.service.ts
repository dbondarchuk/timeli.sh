import {
  IConnectedAppsService,
  IJobService,
  IPaymentHook,
  IPaymentProcessor,
  IPaymentsService,
  Payment,
  PaymentIntent,
  PaymentIntentUpdateModel,
  PaymentUpdateModel,
} from "@timelish/types";
import { ObjectId } from "mongodb";
import {
  PAYMENT_INTENTS_COLLECTION_NAME,
  PAYMENTS_COLLECTION_NAME,
} from "./collections";
import { getDbConnection } from "./database";
import { BaseService } from "./services/base.service";

export class PaymentsService extends BaseService implements IPaymentsService {
  public constructor(
    companyId: string,
    protected readonly connectedAppsService: IConnectedAppsService,
    protected readonly jobService: IJobService,
  ) {
    super("PaymentsService", companyId);
  }

  public async createIntent(
    intent: Omit<PaymentIntentUpdateModel, "status">,
  ): Promise<PaymentIntent> {
    const logger = this.loggerFactory("createIntent");
    logger.debug(
      {
        intent: {
          amount: intent.amount,
          appId: intent.appId,
          appointmentId: intent.appointmentId,
          customerId: intent.customerId,
          appName: intent.appName,
          type: intent.type,
        },
      },
      "Creating payment intent",
    );

    const db = await getDbConnection();
    const intents = db.collection<PaymentIntent>(
      PAYMENT_INTENTS_COLLECTION_NAME,
    );

    const dbIntent = {
      ...intent,
      companyId: this.companyId,
      _id: new ObjectId().toString(),
      status: "created",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PaymentIntent;

    await intents.insertOne(dbIntent);

    logger.debug(
      {
        intentId: dbIntent._id,
        amount: dbIntent.amount,
        appId: dbIntent.appId,
        appointmentId: dbIntent.appointmentId,
        customerId: dbIntent.customerId,
        appName: dbIntent.appName,
        type: dbIntent.type,
      },
      "Successfully created payment intent",
    );

    return dbIntent;
  }

  public async getIntent(id: string): Promise<PaymentIntent | null> {
    const logger = this.loggerFactory("getIntent");
    logger.debug({ intentId: id }, "Getting payment intent by id");

    const db = await getDbConnection();
    const intents = db.collection<PaymentIntent>(
      PAYMENT_INTENTS_COLLECTION_NAME,
    );

    const intent = await intents.findOne({
      _id: id,
      companyId: this.companyId,
    });

    if (!intent) {
      logger.warn({ intentId: id }, "Payment intent not found");
    } else {
      logger.debug(
        {
          intentId: id,
          status: intent.status,
          amount: intent.amount,
          appId: intent.appId,
          appointmentId: intent.appointmentId,
          customerId: intent.customerId,
          appName: intent.appName,
        },
        "Payment intent found",
      );
    }

    return intent;
  }

  public async getIntentByExternalId(
    externalId: string,
  ): Promise<PaymentIntent | null> {
    const logger = this.loggerFactory("getIntentByExternalId");
    logger.debug({ externalId }, "Getting payment intent by external id");

    const db = await getDbConnection();
    const intents = db.collection<PaymentIntent>(
      PAYMENT_INTENTS_COLLECTION_NAME,
    );

    const intent = await intents.findOne({
      externalId,
      companyId: this.companyId,
    });

    if (!intent) {
      logger.warn({ externalId }, "Payment intent not found by external id");
    } else {
      logger.debug(
        {
          externalId,
          intentId: intent._id,
          status: intent.status,
          amount: intent.amount,
          appId: intent.appId,
          type: intent.type,
        },
        "Payment intent found by external id",
      );
    }

    return intent;
  }

  public async updateIntent(
    id: string,
    update: Partial<PaymentIntentUpdateModel>,
  ): Promise<PaymentIntent> {
    const logger = this.loggerFactory("updateIntent");
    logger.debug({ intentId: id, update }, "Updating payment intent");

    const {
      _id: _,
      companyId: __,
      paidAt,
      ...updateObj
    } = update as PaymentIntent; // Remove fields in case it slips here
    const db = await getDbConnection();
    const intents = db.collection<PaymentIntent>(
      PAYMENT_INTENTS_COLLECTION_NAME,
    );

    const $set: Partial<PaymentIntent> = {
      ...updateObj,
      updatedAt: new Date(),
    };

    if (updateObj.status === "paid") {
      $set.paidAt = new Date();
    }

    await intents.updateOne(
      {
        _id: id,
        companyId: this.companyId,
      },
      {
        $set,
      },
    );

    const updatedIntent = await intents.findOne({
      _id: id,
      companyId: this.companyId,
    });

    if (!updatedIntent) {
      logger.error({ intentId: id }, "Failed to fetch updated intent");
      throw new Error("Failed to fetch updated intent");
    }

    logger.debug(
      { intentId: id, status: updatedIntent.status },
      "Successfully updated payment intent",
    );
    return updatedIntent;
  }

  public async createPayment(payment: PaymentUpdateModel): Promise<Payment> {
    const logger = this.loggerFactory("createPayment");
    logger.debug(
      {
        payment: {
          amount: payment.amount,
          method: payment.method,
          type: payment.type,
          appId: "appId" in payment ? payment.appId : undefined,
          appName: "appName" in payment ? payment.appName : undefined,
          appointmentId: payment.appointmentId,
          customerId: payment.customerId,
        },
      },
      "Creating payment",
    );

    const db = await getDbConnection();
    const payments = db.collection<Payment>(PAYMENTS_COLLECTION_NAME);

    const dbPayment: Payment = {
      ...payment,
      companyId: this.companyId,
      _id: new ObjectId().toString(),
      updatedAt: new Date(),
    };

    await payments.insertOne(dbPayment);

    logger.debug(
      { paymentId: dbPayment._id, amount: dbPayment.amount },
      "Successfully created payment, executing hooks",
    );

    // Execute payment hooks
    await this.jobService.enqueueHook<IPaymentHook, "onPaymentCreated">(
      "payment-hook",
      "onPaymentCreated",
      dbPayment,
    );

    return dbPayment;
  }

  public async getPayment(id: string): Promise<Payment | null> {
    const logger = this.loggerFactory("getPayment");
    logger.debug({ paymentId: id }, "Getting payment by id");

    const db = await getDbConnection();
    const payments = db.collection<Payment>(PAYMENTS_COLLECTION_NAME);

    const payment = await payments.findOne({
      _id: id,
      companyId: this.companyId,
    });

    if (!payment) {
      logger.warn({ paymentId: id }, "Payment not found");
    } else {
      logger.debug(
        {
          paymentId: id,
          status: payment.status,
          amount: payment.amount,
          method: payment.method,
          type: payment.type,
          appId: "appId" in payment ? payment.appId : undefined,
          appName: "appName" in payment ? payment.appName : undefined,
          appointmentId: payment.appointmentId,
          customerId: payment.customerId,
        },
        "Payment found",
      );
    }

    return payment;
  }

  public async getAppointmentPayments(
    appointmentId: string,
  ): Promise<Payment[]> {
    const logger = this.loggerFactory("getAppointmentPayments");
    logger.debug({ appointmentId }, "Getting appointment payments");

    const db = await getDbConnection();

    const paymentsCollection = db.collection<Payment>(PAYMENTS_COLLECTION_NAME);
    const payments = await paymentsCollection
      .find({ appointmentId, companyId: this.companyId })
      .toArray();

    if (payments.length === 0) {
      logger.warn({ appointmentId }, "No payments found for appointment");
    } else {
      logger.debug(
        { appointmentId, count: payments.length },
        "Successfully retrieved appointment payments",
      );
    }

    return payments;
  }

  public async updatePayment(
    id: string,
    update: Partial<PaymentUpdateModel>,
  ): Promise<Payment> {
    const logger = this.loggerFactory("updatePayment");
    logger.debug({ paymentId: id, update }, "Updating payment");

    const { _id: _, companyId: __, ...updateObj } = update as Payment; // Remove fields in case it slips here
    const db = await getDbConnection();
    const payments = db.collection<Payment>(PAYMENTS_COLLECTION_NAME);

    const $set: Partial<Payment> = {
      ...updateObj,
      updatedAt: new Date(),
    };

    await payments.updateOne(
      {
        _id: id,
        companyId: this.companyId,
      },
      {
        $set,
      },
    );

    const updatedPayment = await payments.findOne({
      _id: id,
      companyId: this.companyId,
    });

    if (!updatedPayment) {
      logger.error({ paymentId: id }, "Failed to fetch updated payment");
      throw new Error("Failed to fetch updated intent");
    }

    logger.debug(
      { paymentId: id, status: updatedPayment.status },
      "Successfully updated payment, executing hooks",
    );

    // Execute payment hooks
    await this.jobService.enqueueHook<IPaymentHook, "onPaymentUpdated">(
      "payment-hook",
      "onPaymentUpdated",
      updatedPayment,
      update,
    );

    return updatedPayment;
  }

  public async deletePayment(id: string): Promise<Payment | null> {
    const logger = this.loggerFactory("deletePayment");
    logger.debug({ paymentId: id }, "Deleting payment");

    const db = await getDbConnection();
    const payments = db.collection<Payment>(PAYMENTS_COLLECTION_NAME);

    const payment = await payments.findOneAndDelete({
      _id: id,
      companyId: this.companyId,
    });
    if (!payment) {
      logger.warn({ paymentId: id }, "Payment not found");
      return null;
    }

    logger.debug(
      { paymentId: id },
      "Successfully deleted payment, executing hooks",
    );

    // Execute payment hooks
    await this.jobService.enqueueHook<IPaymentHook, "onPaymentDeleted">(
      "payment-hook",
      "onPaymentDeleted",
      payment,
    );

    return payment;
  }

  public async refundPayment(
    id: string,
    amount: number,
  ): Promise<
    | { success: false; error: string; status: number }
    | { success: true; updatedPayment: Payment }
  > {
    const logger = this.loggerFactory("refundPayment");
    logger.debug({ paymentId: id, amount }, "Processing payment refund");

    const payment = await this.getPayment(id);
    if (!payment) {
      logger.warn({ paymentId: id, amount }, "Payment not found for refund");
      return { success: false, error: "payment_not_found", status: 404 };
    }

    if (payment.method !== "online") {
      logger.error(
        { paymentId: id, method: payment.method, amount },
        "Only online payments supported for refund",
      );

      return {
        success: false,
        error: "only_online_payments_supported",
        status: 405,
      };
    }

    // if (payment.status !== "paid") {
    //   logger.error(
    //     { paymentId: id, status: payment.status, amount },
    //     "Wrong payment status for refund"
    //   );

    //   return { success: false, error: "wrong_payment_status", status: 405 };
    // }

    const totalRefunded =
      (payment.refunds || [])?.reduce(
        (acc, refund) => acc + refund.amount,
        0,
      ) || 0;

    if (totalRefunded + amount > payment.amount) {
      logger.error(
        {
          paymentId: id,
          amount,
          totalRefunded: payment.refunds?.reduce(
            (acc, refund) => acc + refund.amount,
            0,
          ),
        },
        "Refund amount exceeds payment amount",
      );
      return {
        success: false,
        error: "refund_amount_exceeds_payment_amount",
        status: 405,
      };
    }

    try {
      const { app, service } =
        await this.connectedAppsService.getAppService<IPaymentProcessor>(
          payment.appId,
        );
      if (!service.refundPayment) {
        logger.error(
          { paymentId: id, appId: payment.appId, amount },
          "Refund not supported by payment app",
        );

        throw new Error("refund_not_supported");
      }

      const result = await service.refundPayment(app, payment, amount);
      if (result.success) {
        const updatedPayment = await this.updatePayment(id, {
          status: "refunded",
          refunds: [
            ...(payment.refunds || []),
            { amount, refundedAt: new Date() },
          ],
        });

        logger.debug(
          { paymentId: id, amount },
          "Successfully processed payment refund, executing hooks",
        );

        // Execute payment hooks
        await this.jobService.enqueueHook<IPaymentHook, "onPaymentRefunded">(
          "payment-hook",
          "onPaymentRefunded",
          updatedPayment,
          amount,
        );

        return { success: true, updatedPayment };
      }

      logger.error(
        { paymentId: id, error: result.error, amount },
        "Payment app refund failed",
      );

      return {
        success: false,
        status: 400,
        error: result.error || "app_does_not_support_refund",
      };
    } catch (error) {
      logger.error(
        { paymentId: id, error, amount },
        "Payment app does not support refund",
      );

      return {
        success: false,
        error: "app_does_not_support_refund",
        status: 405,
      };
    }
  }
}

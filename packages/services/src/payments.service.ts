import { getLoggerFactory } from "@vivid/logger";
import {
  CustomerDataPoint,
  DateRange,
  FinancialMetrics,
  IConnectedAppsService,
  IPaymentProcessor,
  IPaymentsService,
  Payment,
  PaymentIntent,
  PaymentIntentUpdateModel,
  PaymentSummary,
  PaymentUpdateModel,
  RevenueDataPoint,
  ServiceDataPoint,
  TimeGrouping,
} from "@vivid/types";
import { Filter, ObjectId } from "mongodb";
import { getDbConnection } from "./database";

export const PAYMENT_INTENTS_COLLECTION_NAME = "payment-intents";
export const PAYMENTS_COLLECTION_NAME = "payments";

export class PaymentsService implements IPaymentsService {
  protected readonly loggerFactory = getLoggerFactory("PaymentsService");

  public constructor(
    protected readonly connectedAppsService: IConnectedAppsService,
  ) {}
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
        },
      },
      "Creating payment intent",
    );

    const db = await getDbConnection();
    const intents = db.collection<PaymentIntent>(
      PAYMENT_INTENTS_COLLECTION_NAME,
    );

    const dbIntent: PaymentIntent = {
      ...intent,
      _id: new ObjectId().toString(),
      status: "created",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await intents.insertOne(dbIntent);

    logger.debug(
      {
        intentId: dbIntent._id,
        amount: dbIntent.amount,
        appId: dbIntent.appId,
        appointmentId: dbIntent.appointmentId,
        customerId: dbIntent.customerId,
        appName: dbIntent.appName,
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

    const { _id: _, paidAt, ...updateObj } = update as PaymentIntent; // Remove fields in case it slips here
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
      },
      {
        $set,
      },
    );

    const updatedIntent = await intents.findOne({
      _id: id,
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
      _id: new ObjectId().toString(),
      updatedAt: new Date(),
    };

    await payments.insertOne(dbPayment);

    logger.debug(
      { paymentId: dbPayment._id, amount: dbPayment.amount },
      "Successfully created payment",
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
    });

    if (!payment) {
      logger.warn({ paymentId: id }, "Payment not found");
    } else {
      logger.debug(
        {
          paymentId: id,
          status: payment.status,
          amount: payment.amount,
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

  public async updatePayment(
    id: string,
    update: Partial<PaymentUpdateModel>,
  ): Promise<Payment> {
    const logger = this.loggerFactory("updatePayment");
    logger.debug({ paymentId: id, update }, "Updating payment");

    const { _id: _, ...updateObj } = update as Payment; // Remove fields in case it slips here
    const db = await getDbConnection();
    const payments = db.collection<Payment>(PAYMENTS_COLLECTION_NAME);

    const $set: Partial<Payment> = {
      ...updateObj,
      updatedAt: new Date(),
    };

    await payments.updateOne(
      {
        _id: id,
      },
      {
        $set,
      },
    );

    const updatedPayment = await payments.findOne({
      _id: id,
    });

    if (!updatedPayment) {
      logger.error({ paymentId: id }, "Failed to fetch updated payment");
      throw new Error("Failed to fetch updated intent");
    }

    logger.debug(
      { paymentId: id, status: updatedPayment.status },
      "Successfully updated payment",
    );

    return updatedPayment;
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

    if (payment.type !== "online") {
      logger.error(
        { paymentId: id, type: payment.type, amount },
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
          "Successfully processed payment refund",
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

  public async getFinancialMetrics(
    dateRange?: DateRange,
  ): Promise<FinancialMetrics> {
    const logger = this.loggerFactory("getFinancialMetrics");
    logger.debug({ dateRange }, "Getting financial metrics");

    const db = await getDbConnection();
    const appointments = db.collection("appointments");

    // Build match criteria for date filtering
    const $and: any[] = [];

    if (dateRange?.start || dateRange?.end) {
      if (dateRange.start) {
        $and.push({
          dateTime: {
            $gte: dateRange.start,
          },
        });
      }
      if (dateRange.end) {
        $and.push({
          dateTime: {
            $lte: dateRange.end,
          },
        });
      }
    }

    const pipeline = [
      ...($and.length > 0 ? [{ $match: { $and } }] : []),
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "appointmentId",
          as: "payments",
        },
      },
      {
        $addFields: {
          totalPaidAmount: {
            $sum: {
              $map: {
                input: "$payments",
                as: "payment",
                in: "$$payment.amount",
              },
            },
          },
          totalRefundedAmount: {
            $sum: {
              $map: {
                input: "$payments",
                as: "payment",
                in: {
                  $cond: [
                    { $eq: ["$$payment.status", "refunded"] },
                    "$$payment.amount",
                    0,
                  ],
                },
              },
            },
          },
          netPaymentAmount: {
            $sum: {
              $map: {
                input: "$payments",
                as: "payment",
                in: {
                  $subtract: [
                    "$$payment.amount",
                    {
                      $sum: {
                        $map: {
                          input: { $ifNull: ["$$payment.refunds", []] },
                          as: "refund",
                          in: "$$refund.amount",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          estimatedRevenue: {
            $cond: [
              // If appointment is confirmed or pending, use totalPrice
              { $in: ["$status", ["confirmed", "pending"]] },
              "$totalPrice",
              // If appointment is declined but has non-fully refunded payments
              {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "declined"] },
                      { $gt: ["$netPaymentAmount", 0] },
                    ],
                  },
                  "$netPaymentAmount",
                  0,
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          estimatedRevenue: { $sum: "$estimatedRevenue" },
          totalPayments: { $sum: "$totalPaidAmount" },
          netPayments: { $sum: "$netPaymentAmount" },
          activeAppointments: {
            $sum: {
              $cond: [{ $in: ["$status", ["confirmed", "pending"]] }, 1, 0],
            },
          },
          declinedAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "declined"] }, 1, 0] },
          },
        },
      },
    ];

    const result = await appointments.aggregate(pipeline).toArray();
    const metrics = result[0] || {
      estimatedRevenue: 0,
      totalPayments: 0,
      netPayments: 0,
      activeAppointments: 0,
      declinedAppointments: 0,
    };

    const financialMetrics: FinancialMetrics = {
      estimatedRevenue: metrics.estimatedRevenue || 0,
      totalPayments: metrics.totalPayments || 0,
      netPayments: metrics.netPayments || 0,
      activeAppointments: metrics.activeAppointments || 0,
      declinedAppointments: metrics.declinedAppointments || 0,
    };

    logger.debug(
      { financialMetrics },
      "Successfully retrieved financial metrics",
    );

    return financialMetrics;
  }

  public async getRecentPayments(
    limit: number = 10,
    dateRange?: DateRange,
  ): Promise<PaymentSummary[]> {
    const logger = this.loggerFactory("getRecentPayments");
    logger.debug({ limit, dateRange }, "Getting recent payments");

    const db = await getDbConnection();
    const payments = db.collection<Payment>(PAYMENTS_COLLECTION_NAME);

    // Build match criteria for date filtering
    const $and: Filter<Payment>[] = [];

    if (dateRange?.start || dateRange?.end) {
      if (dateRange.start) {
        $and.push({
          paidAt: {
            $gte: dateRange.start,
          },
        });
      }
      if (dateRange.end) {
        $and.push({
          paidAt: {
            $lte: dateRange.end,
          },
        });
      }
    }

    const pipeline = [
      ...($and.length > 0 ? [{ $match: { $and } }] : []),
      {
        $lookup: {
          from: "appointments",
          localField: "appointmentId",
          foreignField: "_id",
          as: "appointment",
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $addFields: {
          serviceName: { $arrayElemAt: ["$appointment.option.name", 0] },
          customerName: { $arrayElemAt: ["$customer.name", 0] },
          appointment: "$$REMOVE",
        },
      },
      {
        $sort: { paidAt: -1 },
      },
      {
        $limit: limit,
      },
    ];

    const paymentSummaries = (await payments
      .aggregate(pipeline)
      .toArray()) as PaymentSummary[];

    logger.debug(
      { count: paymentSummaries.length },
      "Successfully retrieved recent payments",
    );

    return paymentSummaries;
  }

  private getTimeGroupingFormat(
    timeGrouping: "day" | "week" | "month",
  ): string {
    switch (timeGrouping) {
      case "week":
        return "%Y-W%U";
      case "month":
        return "%Y-%m";
      case "day":
      default:
        return "%Y-%m-%d";
    }
  }

  public async getRevenueOverTime(
    dateRange?: DateRange,
    timeGrouping: TimeGrouping = "day",
  ): Promise<RevenueDataPoint[]> {
    const logger = this.loggerFactory("getRevenueOverTime");
    logger.debug({ dateRange, timeGrouping }, "Getting revenue over time");

    const db = await getDbConnection();
    const appointments = db.collection("appointments");

    // Build match criteria for date filtering
    const $and: any[] = [];

    if (dateRange?.start || dateRange?.end) {
      if (dateRange.start) {
        $and.push({
          dateTime: {
            $gte: dateRange.start,
          },
        });
      }
      if (dateRange.end) {
        $and.push({
          dateTime: {
            $lte: dateRange.end,
          },
        });
      }
    }

    const pipeline = [
      ...($and.length > 0 ? [{ $match: { $and } }] : []),
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "appointmentId",
          as: "payments",
        },
      },
      {
        $addFields: {
          totalPaidAmount: {
            $sum: {
              $map: {
                input: "$payments",
                as: "payment",
                in: "$$payment.amount",
              },
            },
          },
          totalRefundedAmount: {
            $sum: {
              $map: {
                input: "$payments",
                as: "payment",
                in: {
                  $cond: [
                    { $eq: ["$$payment.status", "refunded"] },
                    "$$payment.amount",
                    0,
                  ],
                },
              },
            },
          },
          netPaymentAmount: {
            $sum: {
              $map: {
                input: "$payments",
                as: "payment",
                in: {
                  $subtract: [
                    "$$payment.amount",
                    {
                      $sum: {
                        $map: {
                          input: { $ifNull: ["$$payment.refunds", []] },
                          as: "refund",
                          in: "$$refund.amount",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          estimatedRevenue: {
            $cond: [
              // If appointment is confirmed or pending, use totalPrice
              { $in: ["$status", ["confirmed", "pending"]] },
              "$totalPrice",
              // If appointment is declined but has non-fully refunded payments
              {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "declined"] },
                      { $gt: ["$netPaymentAmount", 0] },
                    ],
                  },
                  "$netPaymentAmount",
                  0,
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: this.getTimeGroupingFormat(timeGrouping),
              date: "$dateTime",
            },
          },
          estimatedRevenue: { $sum: "$estimatedRevenue" },
          totalPayments: { $sum: "$totalPaidAmount" },
          netPayments: { $sum: "$netPaymentAmount" },
          activeAppointments: {
            $sum: {
              $cond: [{ $in: ["$status", ["confirmed", "pending"]] }, 1, 0],
            },
          },
          declinedAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "declined"] }, 1, 0] },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          estimatedRevenue: 1,
          totalPayments: 1,
          netPayments: 1,
          activeAppointments: 1,
          declinedAppointments: 1,
        },
      },
    ];

    const revenueData = await appointments
      .aggregate<RevenueDataPoint>(pipeline)
      .toArray();

    logger.debug(
      { count: revenueData.length },
      "Successfully retrieved revenue over time",
    );

    return revenueData;
  }

  public async getServiceDistribution(
    dateRange?: DateRange,
  ): Promise<ServiceDataPoint[]> {
    const logger = this.loggerFactory("getServiceDistribution");
    logger.debug({ dateRange }, "Getting service distribution");

    const db = await getDbConnection();
    const appointments = db.collection("appointments");

    // Build match criteria for date filtering
    const $and: any[] = [];

    if (dateRange?.start || dateRange?.end) {
      if (dateRange.start) {
        $and.push({
          dateTime: {
            $gte: dateRange.start,
          },
        });
      }
      if (dateRange.end) {
        $and.push({
          dateTime: {
            $lte: dateRange.end,
          },
        });
      }
    }

    const pipeline = [
      ...($and.length > 0 ? [{ $match: { $and } }] : []),
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "appointmentId",
          as: "payments",
        },
      },
      {
        $addFields: {
          totalPaidAmount: {
            $sum: {
              $map: {
                input: "$payments",
                as: "payment",
                in: "$$payment.amount",
              },
            },
          },
          netPaymentAmount: {
            $sum: {
              $map: {
                input: "$payments",
                as: "payment",
                in: {
                  $subtract: [
                    "$$payment.amount",
                    {
                      $sum: {
                        $map: {
                          input: { $ifNull: ["$$payment.refunds", []] },
                          as: "refund",
                          in: "$$refund.amount",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          estimatedRevenue: {
            $cond: [
              // If appointment is confirmed or pending, use totalPrice
              { $in: ["$status", ["confirmed", "pending"]] },
              "$totalPrice",
              // If appointment is declined but has non-fully refunded payments
              {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "declined"] },
                      { $gt: ["$netPaymentAmount", 0] },
                    ],
                  },
                  "$netPaymentAmount",
                  0,
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$option.name",
          count: { $sum: 1 },
          revenue: { $sum: "$estimatedRevenue" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          serviceName: "$_id",
          count: 1,
          revenue: 1,
        },
      },
    ];

    const serviceDistribution = await appointments
      .aggregate<{
        serviceName: string;
        count: number;
        revenue: number;
      }>(pipeline)
      .toArray();

    logger.debug(
      { count: serviceDistribution.length },
      "Successfully retrieved service distribution",
    );

    return serviceDistribution;
  }

  public async getCustomerData(
    dateRange?: DateRange,
    timeGrouping: TimeGrouping = "day",
  ): Promise<CustomerDataPoint[]> {
    const logger = this.loggerFactory("getCustomerData");
    logger.debug({ dateRange }, "Getting customer data");

    const db = await getDbConnection();
    const appointments = db.collection("appointments");

    // Build match criteria for date filtering
    const $and: any[] = [];

    if (dateRange?.start || dateRange?.end) {
      if (dateRange.start) {
        $and.push({
          dateTime: {
            $gte: dateRange.start,
          },
        });
      }
      if (dateRange.end) {
        $and.push({
          dateTime: {
            $lte: dateRange.end,
          },
        });
      }
    }

    const pipeline = [
      ...($and.length > 0 ? [{ $match: { $and } }] : []),
      {
        $lookup: {
          from: "appointments",
          let: { customerId: "$customerId", currentDate: "$dateTime" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$customerId", "$$customerId"] },
                    { $lt: ["$dateTime", "$$currentDate"] },
                  ],
                },
              },
            },
          ],
          as: "previousAppointments",
        },
      },
      {
        $addFields: {
          isNewCustomer: {
            $cond: [{ $eq: [{ $size: "$previousAppointments" }, 0] }, 1, 0],
          },
          isReturningCustomer: {
            $cond: [{ $gt: [{ $size: "$previousAppointments" }, 0] }, 1, 0],
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: this.getTimeGroupingFormat(timeGrouping),
              date: "$dateTime",
            },
          },
          newCustomers: { $sum: "$isNewCustomer" },
          returningCustomers: { $sum: "$isReturningCustomer" },
          totalCustomers: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          newCustomers: 1,
          returningCustomers: 1,
          totalCustomers: 1,
        },
      },
    ];

    const customerData = await appointments
      .aggregate<{
        date: string;
        newCustomers: number;
        returningCustomers: number;
        totalCustomers: number;
      }>(pipeline)
      .toArray();

    logger.debug(
      { count: customerData.length },
      "Successfully retrieved customer data",
    );

    return customerData;
  }
}

import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  DateRange,
  IConnectedAppProps,
  Payment,
  PaymentSummary,
} from "@timelish/types";
import { Filter } from "mongodb";
import {
  CustomerDataPoint,
  FinancialMetrics,
  RevenueDataPoint,
  ServiceDataPoint,
  TimeGrouping,
} from "./models";

const PAYMENTS_COLLECTION_NAME = "payments";

export default class FinancialOverviewService {
  protected readonly loggerFactory: LoggerFactory;

  public constructor(
    protected readonly companyId: string,
    protected readonly getDbConnection: IConnectedAppProps["getDbConnection"],
    protected readonly services: IConnectedAppProps["services"],
  ) {
    this.loggerFactory = getLoggerFactory(
      "FinancialOverviewService",
      companyId,
    );
  }

  public async getFinancialMetrics(
    dateRange?: DateRange,
  ): Promise<FinancialMetrics> {
    const logger = this.loggerFactory("getFinancialMetrics");
    logger.debug({ dateRange }, "Getting financial metrics");

    const db = await this.getDbConnection();
    const appointments = db.collection("appointments");

    // Build match criteria for date filtering
    const $and: any[] = [
      {
        companyId: this.companyId,
      },
    ];

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
      { $match: { $and } },
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
                      $add: [
                        {
                          $sum: {
                            $map: {
                              input: { $ifNull: ["$$payment.refunds", []] },
                              as: "refund",
                              in: "$$refund.amount",
                            },
                          },
                        },
                        {
                          $sum: {
                            $map: {
                              input: { $ifNull: ["$$payment.fees", []] },
                              as: "fee",
                              in: "$$fee.amount",
                            },
                          },
                        },
                      ],
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

    const db = await this.getDbConnection();
    const payments = db.collection<Payment>(PAYMENTS_COLLECTION_NAME);

    // Build match criteria for date filtering
    const $and: Filter<Payment>[] = [
      {
        companyId: this.companyId,
      },
    ];

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
      { $match: { $and } },
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

    const db = await this.getDbConnection();
    const appointments = db.collection("appointments");

    // Build match criteria for date filtering
    const $and: any[] = [
      {
        companyId: this.companyId,
      },
    ];

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
      { $match: { $and } },
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
                      $add: [
                        {
                          $sum: {
                            $map: {
                              input: { $ifNull: ["$$payment.refunds", []] },
                              as: "refund",
                              in: "$$refund.amount",
                            },
                          },
                        },
                        {
                          $sum: {
                            $map: {
                              input: { $ifNull: ["$$payment.fees", []] },
                              as: "fee",
                              in: "$$fee.amount",
                            },
                          },
                        },
                      ],
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

    const db = await this.getDbConnection();
    const appointments = db.collection("appointments");

    // Build match criteria for date filtering
    const $and: any[] = [
      {
        companyId: this.companyId,
      },
    ];

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
      { $match: { $and } },
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
                      $add: [
                        {
                          $sum: {
                            $map: {
                              input: { $ifNull: ["$$payment.refunds", []] },
                              as: "refund",
                              in: "$$refund.amount",
                            },
                          },
                        },
                        {
                          $sum: {
                            $map: {
                              input: { $ifNull: ["$$payment.fees", []] },
                              as: "fee",
                              in: "$$fee.amount",
                            },
                          },
                        },
                      ],
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

    const db = await this.getDbConnection();
    const appointments = db.collection("appointments");

    // Build match criteria for date filtering
    const $and: any[] = [
      {
        companyId: this.companyId,
      },
    ];

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
      { $match: { $and } },
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

import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  BookingStep,
  BookingTrackingEvent,
  DateRange,
  IConnectedAppProps,
  Payment,
  PaymentSummary,
} from "@timelish/types";
import { Filter } from "mongodb";
import {
  BookingConversionStats,
  BookingStatsOverTime,
  BookingStepBreakdown,
  CustomerDataPoint,
  FinancialMetrics,
  RevenueDataPoint,
  ServiceDataPoint,
  TimeGrouping,
} from "./models";

const PAYMENTS_COLLECTION_NAME = "payments";
const BOOKING_TRACKING_COLLECTION_NAME = "booking-tracking";

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

  /**
   * Get booking completion statistics
   * Aggregates data directly from MongoDB
   */
  public async getBookingCompletionStats(dateRange?: DateRange): Promise<{
    total: number;
    abandoned: number;
    converted: number;
    abandonmentRate: number;
    conversionRate: number;
  }> {
    const logger = this.loggerFactory("getBookingCompletionStats");
    logger.debug({ dateRange }, "Getting booking completion stats");

    const db = await this.getDbConnection();
    const collection = db.collection<BookingTrackingEvent>(
      BOOKING_TRACKING_COLLECTION_NAME,
    );

    // Build match filter
    const matchFilter: Filter<BookingTrackingEvent> = {
      companyId: this.companyId,
      // Exclude entries that only requested options
      lastStep: { $ne: "OPTIONS_REQUESTED" },
    };

    if (dateRange?.start || dateRange?.end) {
      matchFilter.startedAt = {};
      if (dateRange.start) {
        matchFilter.startedAt.$gte = dateRange.start;
      }
      if (dateRange.end) {
        matchFilter.startedAt.$lte = dateRange.end;
      }
    }

    // Aggregate statistics using MongoDB aggregation
    const pipeline = [
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          abandoned: {
            $sum: { $cond: [{ $eq: ["$status", "abandoned"] }, 1, 0] },
          },
          converted: {
            $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] },
          },
        },
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();
    const stats = result[0] || { total: 0, abandoned: 0, converted: 0 };

    const total = stats.total || 0;
    const abandoned = stats.abandoned || 0;
    const converted = stats.converted || 0;
    const abandonmentRate = total > 0 ? (abandoned / total) * 100 : 0;
    const conversionRate = total > 0 ? (converted / total) * 100 : 0;

    return {
      total,
      abandoned,
      converted,
      abandonmentRate,
      conversionRate,
    };
  }

  /**
   * Get step-by-step breakdown of where users abandon
   * Aggregates data directly from MongoDB
   */
  public async getAbandonmentBookingStepBreakdown(
    dateRange?: DateRange,
  ): Promise<BookingStepBreakdown> {
    const logger = this.loggerFactory("getAbandonmentBookingStepBreakdown");
    logger.debug({ dateRange }, "Getting abandonment step breakdown");

    const db = await this.getDbConnection();
    const collection = db.collection<BookingTrackingEvent>(
      BOOKING_TRACKING_COLLECTION_NAME,
    );

    // Build match filter
    const matchFilter: Filter<BookingTrackingEvent> = {
      companyId: this.companyId,
      status: "abandoned",
      // Exclude entries that only requested options
      lastStep: { $ne: "OPTIONS_REQUESTED" },
    };

    if (dateRange?.start || dateRange?.end) {
      matchFilter.startedAt = {};
      if (dateRange.start) {
        matchFilter.startedAt.$gte = dateRange.start;
      }
      if (dateRange.end) {
        matchFilter.startedAt.$lte = dateRange.end;
      }
    }

    // Aggregate by lastStep
    const pipeline = [
      { $match: matchFilter },
      {
        $group: {
          _id: "$lastStep",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          step: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ];

    const result = await collection
      .aggregate<{ step: BookingStep; count: number }>(pipeline)
      .toArray();

    // Calculate total for percentage calculation
    const total = result.reduce((sum, item) => sum + item.count, 0);

    const breakdown: BookingStepBreakdown = result.map((item) => ({
      step: item.step,
      count: item.count,
      percentage: total > 0 ? (item.count / total) * 100 : 0,
    }));

    return breakdown;
  }

  /**
   * Get booking stats over time
   * Aggregates data directly from MongoDB
   */
  public async getBookingStatsOverTime(
    dateRange?: DateRange,
    timeGrouping: TimeGrouping = "day",
  ): Promise<BookingStatsOverTime> {
    const logger = this.loggerFactory("getBookingStatsOverTime");
    logger.debug(
      { dateRange, timeGrouping },
      "Getting booking stats over time",
    );

    const db = await this.getDbConnection();
    const collection = db.collection<BookingTrackingEvent>(
      BOOKING_TRACKING_COLLECTION_NAME,
    );

    // Build match filter
    const matchFilter: Filter<BookingTrackingEvent> = {
      companyId: this.companyId,
      // Exclude entries that only requested options
      lastStep: { $ne: "OPTIONS_REQUESTED" },
    };

    if (dateRange?.start || dateRange?.end) {
      matchFilter.startedAt = {};
      if (dateRange.start) {
        matchFilter.startedAt.$gte = dateRange.start;
      }
      if (dateRange.end) {
        matchFilter.startedAt.$lte = dateRange.end;
      }
    }

    // Get date format string for MongoDB
    const dateFormatMap = {
      day: "%Y-%m-%d",
      week: "%Y-W%U",
      month: "%Y-%m",
    };

    const dateFormat = dateFormatMap[timeGrouping];

    // Aggregate by time period
    const pipeline = [
      { $match: matchFilter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: "$startedAt",
            },
          },
          total: { $sum: 1 },
          abandoned: {
            $sum: { $cond: [{ $eq: ["$status", "abandoned"] }, 1, 0] },
          },
          converted: {
            $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          total: 1,
          abandoned: 1,
          converted: 1,
        },
      },
      { $sort: { date: 1 } },
    ];

    const statsOverTime = await collection
      .aggregate<BookingStatsOverTime[0]>(pipeline)
      .toArray();

    return statsOverTime;
  }

  /**
   * Get conversion statistics
   * Aggregates data directly from MongoDB
   */
  public async getBookingConversionStats(
    dateRange?: DateRange,
  ): Promise<BookingConversionStats> {
    const logger = this.loggerFactory("getBookingConversionStats");
    logger.debug({ dateRange }, "Getting conversion stats");

    const db = await this.getDbConnection();
    const collection = db.collection<BookingTrackingEvent>(
      BOOKING_TRACKING_COLLECTION_NAME,
    );

    // Build match filter
    const matchFilter: Filter<BookingTrackingEvent> = {
      companyId: this.companyId,
      status: "converted",
    };

    if (dateRange?.start || dateRange?.end) {
      matchFilter.startedAt = {};
      if (dateRange.start) {
        matchFilter.startedAt.$gte = dateRange.start;
      }
      if (dateRange.end) {
        matchFilter.startedAt.$lte = dateRange.end;
      }
    }

    // Get total count first
    const totalConverted = await collection.countDocuments(matchFilter);

    // Aggregate by convertedTo
    const byTypePipeline = [
      { $match: matchFilter },
      {
        $group: {
          _id: { $ifNull: ["$convertedTo", "unknown"] },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          convertedTo: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ];

    const byTypeResult = await collection
      .aggregate<{ convertedTo: string; count: number }>(byTypePipeline)
      .toArray();

    const byType = byTypeResult.map((item) => ({
      convertedTo: item.convertedTo,
      count: item.count,
      percentage: totalConverted > 0 ? (item.count / totalConverted) * 100 : 0,
    }));

    // Aggregate by convertedAppName
    const byAppPipeline = [
      { $match: matchFilter },
      {
        $group: {
          _id: { $ifNull: ["$convertedAppName", null] },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          convertedAppName: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ];

    const byAppResult = await collection
      .aggregate<{
        convertedAppName: string | null;
        count: number;
      }>(byAppPipeline)
      .toArray();

    const byApp = byAppResult.map((item) => ({
      convertedAppName: item.convertedAppName,
      count: item.count,
      percentage: totalConverted > 0 ? (item.count / totalConverted) * 100 : 0,
    }));

    return {
      totalConverted,
      byType,
      byApp,
    };
  }
}

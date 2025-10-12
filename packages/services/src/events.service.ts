import { getDbClient, getDbConnection } from "./database";

import { AvailableAppServices } from "@vivid/app-store/services";

import { getLoggerFactory } from "@vivid/logger";
import {
  Appointment,
  AppointmentEntity,
  AppointmentHistoryEntry,
  AppointmentTimeNotAvaialbleError,
  IPaymentsService,
  IServicesService,
  ModifyAppointmentInformationRequest,
  Payment,
  PaymentHistory,
  TimeSlot,
  type AppointmentEvent,
  type AppointmentStatus,
  type Asset,
  type Availability,
  type BookingConfiguration,
  type DateRange,
  type DaySchedule,
  type Event,
  type GeneralConfiguration,
  type IAppointmentHook,
  type IAssetsService,
  type ICalendarBusyTimeProvider,
  type IConfigurationService,
  type IConnectedAppsService,
  type ICustomersService,
  type IEventsService,
  type IScheduleService,
  type Period,
  type Query,
  type WithTotal,
} from "@vivid/types";
import {
  buildSearchQuery,
  escapeRegex,
  getAppointmentBucket,
  getAvailableTimeSlotsInCalendar,
  getAvailableTimeSlotsWithPriority,
  getIcsEventUid,
  parseTime,
} from "@vivid/utils";
import { DateTime } from "luxon";
import mimeType from "mime-type/with-db";
import { Filter, ObjectId, Sort } from "mongodb";
import { v4 } from "uuid";
import { ASSETS_COLLECTION_NAME } from "./assets.service";
import { CUSTOMERS_COLLECTION_NAME } from "./customers.service";
import { PAYMENTS_COLLECTION_NAME } from "./payments.service";

export const APPOINTMENTS_COLLECTION_NAME = "appointments";
export const APPOINTMENTS_HISTORY_COLLECTION_NAME = "appointments-history";
export const WAITLIST_COLLECTION_NAME = "waitlist";

export class EventsService implements IEventsService {
  protected readonly loggerFactory = getLoggerFactory("EventsService");

  constructor(
    private readonly configurationService: IConfigurationService,
    private readonly appsService: IConnectedAppsService,
    private readonly assetsService: IAssetsService,
    private readonly customersService: ICustomersService,
    private readonly scheduleService: IScheduleService,
    private readonly servicesService: IServicesService,
    private readonly paymentsService: IPaymentsService,
  ) {}

  public async getAvailability(duration: number): Promise<Availability> {
    const logger = this.loggerFactory("getAvailability");
    logger.debug({ duration }, "Getting availability");

    const { booking: config, general: generalConfig } =
      await this.configurationService.getConfigurations("booking", "general");

    const events = await this.getBusyEvents();

    const start = DateTime.now().plus({
      hours: config.minHoursBeforeBooking || 0,
    });

    const end = start.plus({ weeks: config.maxWeeksInFuture ?? 8 });

    const schedule = await this.scheduleService.getSchedule(
      start.toJSDate(),
      end.toJSDate(),
    );

    const availability = await this.getAvailableTimes(
      start,
      end,
      duration,
      events,
      config,
      generalConfig,
      schedule,
    );

    logger.debug(
      { duration, start, end, availableSlots: availability.length },
      "Availability retrieved",
    );

    return availability;
  }

  public async getBusyEventsInTimeFrame(
    start: Date,
    end: Date,
  ): Promise<Period[]> {
    const logger = this.loggerFactory("getBusyEventsInTimeFrame");
    logger.debug({ start, end }, "Getting busy events in time frame");

    const { booking: config, general: generalConfig } =
      await this.configurationService.getConfigurations("booking", "general");

    const events = await this.getBusyTimes(
      DateTime.fromJSDate(start),
      DateTime.fromJSDate(end),
      config,
      generalConfig,
    );

    logger.debug(
      { start, end, eventCount: events.length },
      "Busy events in time frame retrieved",
    );

    return events;
  }

  public async getBusyEvents(): Promise<Period[]> {
    const logger = this.loggerFactory("getBusyEvents");
    logger.debug("Getting busy events");

    const { booking: config, general: generalConfig } =
      await this.configurationService.getConfigurations("booking", "general");

    const start = DateTime.utc();
    const end = DateTime.utc().plus({ weeks: config.maxWeeksInFuture ?? 8 });

    const events = await this.getBusyTimes(start, end, config, generalConfig);

    logger.debug({ eventCount: events.length }, "Busy events retrieved");

    return events;
  }

  public async createEvent({
    event,
    confirmed: propsConfirmed,
    force = false,
    files,
    paymentIntentId,
    by,
  }: {
    event: AppointmentEvent;
    confirmed?: boolean;
    force?: boolean;
    files?: Record<string, File>;
    paymentIntentId?: string;
    by: "customer" | "user";
  }): Promise<Appointment> {
    const logger = this.loggerFactory("createEvent");
    logger.debug(
      {
        event: {
          dateTime: event.dateTime,
          totalDuration: event.totalDuration,
          customerName: event.fields.name,
          customerEmail: event.fields.email,
          customerPhone: event.fields.phone,
          optionName: event.option.name,
        },
        confirmed: propsConfirmed,
        force,
        fileCount: files ? Object.keys(files).length : 0,
        paymentIntentId,
      },
      "Creating event",
    );

    const { booking: config, general: generalConfig } =
      await this.configurationService.getConfigurations("booking", "general");

    if (!force) {
      const isAvailable = await this.verifyTimeAvailability(
        event.dateTime,
        event.totalDuration,
        config,
        generalConfig,
      );

      if (!isAvailable) {
        logger.error(
          { dateTime: event.dateTime, duration: event.totalDuration },
          "Event time is not available",
        );

        throw new AppointmentTimeNotAvaialbleError("Time is not available");
      }
    }

    const appointmentId = new ObjectId().toString();
    const assets: Asset[] = [];
    if (files) {
      logger.debug(
        { appointmentId, fileCount: Object.keys(files).length },
        "Processing files for event",
      );

      for (const [fieldId, file] of Object.entries(files)) {
        let fileType = mimeType.lookup(file.name);
        if (!fileType) {
          fileType = "application/octet-stream";
        } else if (Array.isArray(fileType)) {
          fileType = fileType[0];
        }

        const asset = await this.assetsService.createAsset(
          {
            filename: `${getAppointmentBucket(appointmentId)}/${fieldId}-${file.name}`,
            mimeType: fileType,
            appointmentId,
            description: `${event.fields.name} - ${event.option.name} - ${fieldId}`,
          },
          file,
        );

        assets.push(asset);
      }
    }

    const confirmed = propsConfirmed ?? config.autoConfirm ?? false;

    logger.debug(
      { appointmentId, confirmed, force, paymentIntentId },
      "Saving event",
    );

    const appointment = await this.saveEvent(
      appointmentId,
      event,
      by,
      assets.length ? assets : undefined,
      paymentIntentId,
      confirmed ? "confirmed" : "pending",
      force,
    );

    logger.debug(
      { appointmentId, confirmed, force, paymentIntentId },
      "Event saved, executing hooks",
    );

    await this.appsService.executeHooks<IAppointmentHook>(
      "appointment-hook",
      async (hook, service) => {
        await service.onAppointmentCreated?.(hook, appointment, confirmed);
      },
      {
        ignoreErrors: true,
      },
    );

    logger.debug(
      {
        appointmentId,
        customerName: appointment.customer.name,
        status: appointment.status,
        confirmed,
      },
      "Event created successfully",
    );

    return appointment;
  }

  public async updateEvent(
    appointmentId: string,
    {
      event,
      confirmed: propsConfirmed,
      files,
      doNotNotifyCustomer,
    }: {
      event: AppointmentEvent;
      confirmed?: boolean;
      files?: Record<string, File>;
      doNotNotifyCustomer?: boolean;
    },
  ): Promise<Appointment> {
    const logger = this.loggerFactory("updateEvent");
    logger.debug(
      {
        event: {
          dateTime: event.dateTime,
          totalDuration: event.totalDuration,
          customerName: event.fields.name,
          customerEmail: event.fields.email,
          customerPhone: event.fields.phone,
          optionName: event.option.name,
        },
        confirmed: propsConfirmed,
        fileCount: files ? Object.keys(files).length : 0,
        doNotNotifyCustomer,
      },
      "Updating event",
    );

    const appointment = await this.getAppointment(appointmentId);

    if (!appointment) {
      logger.error({ id: appointmentId }, "Appointment not found");
      throw new Error("Appointment not found");
    }

    if (appointment.status === "declined") {
      logger.error({ id: appointmentId }, "Appointment is declined");
      throw new Error("Appointment is declined");
    }

    const assets: Asset[] = [];
    if (files) {
      logger.debug(
        { appointmentId, fileCount: Object.keys(files).length },
        "Processing files for event",
      );

      for (const [fieldId, file] of Object.entries(files)) {
        let fileType = mimeType.lookup(file.name);
        if (!fileType) {
          fileType = "application/octet-stream";
        } else if (Array.isArray(fileType)) {
          fileType = fileType[0];
        }

        const asset = await this.assetsService.createAsset(
          {
            filename: `${getAppointmentBucket(appointmentId)}/${fieldId}-${file.name}`,
            mimeType: fileType,
            appointmentId,
            description: `${event.fields.name} - ${event.option.name} - ${fieldId}`,
          },
          file,
        );

        assets.push(asset);
      }
    }

    const confirmed = propsConfirmed ?? appointment.status === "confirmed";

    logger.debug({ appointmentId, confirmed }, "Saving event");

    await this.updateEventInDatabase(
      appointmentId,
      event,
      appointment,
      assets.length ? assets : undefined,
      confirmed,
    );

    logger.debug({ appointmentId, confirmed }, "Event saved");

    const updatedAppointment = await this.getAppointment(appointmentId);
    if (!updatedAppointment) {
      logger.error(
        { appointmentId },
        "Something went wrong - updated appointment not found",
      );
      throw new Error("Something went wrong - updated appointment not found");
    }

    logger.debug({ appointmentId }, "Event saved, executing hooks");
    await this.appsService.executeHooks<IAppointmentHook>(
      "appointment-hook",
      async (hook, service) => {
        await service.onAppointmentRescheduled?.(
          hook,
          updatedAppointment,
          event.dateTime,
          event.totalDuration,
          updatedAppointment.dateTime,
          updatedAppointment.totalDuration,
          doNotNotifyCustomer,
        );
      },
      {
        ignoreErrors: true,
      },
    );

    logger.debug(
      {
        appointmentId,
        customerName: updatedAppointment.customer.name,
        status: updatedAppointment.status,
        confirmed,
      },
      "Event updated successfully",
    );

    return updatedAppointment;
  }

  public async getPendingAppointmentsCount(after?: Date): Promise<number> {
    const logger = this.loggerFactory("getPendingAppointmentsCount");
    logger.debug({ after }, "Getting pending appointments count");

    const db = await getDbConnection();
    const filter: Filter<AppointmentEntity> = {
      status: "pending",
      dateTime: after
        ? {
            $gte: after,
          }
        : undefined,
    };

    const collection = db.collection<AppointmentEntity>(
      APPOINTMENTS_COLLECTION_NAME,
    );

    const count = await collection.countDocuments(filter);

    logger.debug({ after, count }, "Pending appointments count retrieved");

    return count;
  }

  public async getPendingAppointments(
    limit = 20,
    after?: Date,
  ): Promise<WithTotal<Appointment>> {
    const logger = this.loggerFactory("getPendingAppointments");
    logger.debug({ limit, after }, "Getting pending appointments");

    const db = await getDbConnection();
    const filter: Filter<Appointment> = {
      status: "pending",
      dateTime: after
        ? {
            $gte: after,
          }
        : undefined,
    };

    const [result] = await db
      .collection<AppointmentEntity>(APPOINTMENTS_COLLECTION_NAME)
      .aggregate([
        {
          $match: filter,
        },
        {
          $sort: { dateTime: 1 },
        },
        ...this.aggregateJoin,
        {
          $facet: {
            paginatedResults: [],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ])
      .toArray();

    const response = {
      total: result.totalCount?.[0]?.count || 0,
      items: result.paginatedResults || [],
    };

    logger.debug(
      {
        limit,
        after,
        result: { total: response.total, count: response.items.length },
      },
      "Pending appointments retrieved",
    );

    return response;
  }

  // public async getNextAppointments(date: Date, limit = 5) {
  //   const db = await getDbConnection();
  //   const appointments = db.collection<AppointmentEntity>(
  //     APPOINTMENTS_COLLECTION_NAME
  //   );

  //   const result = await appointments
  //     .find({
  //       dateTime: {
  //         $gte: date,
  //       },
  //       status: {
  //         $ne: "declined",
  //       },
  //     })
  //     .sort("dateTime", "ascending")
  //     .limit(limit)
  //     .toArray();

  //   return result;
  // }

  // This requires upgrade of MongoDB to at least 5.0
  public async getNextAppointments(date: Date, limit = 5) {
    const logger = this.loggerFactory("getNextAppointments");
    logger.debug({ date, limit }, "Getting next appointments");

    const db = await getDbConnection();
    const appointments = db.collection<AppointmentEntity>(
      APPOINTMENTS_COLLECTION_NAME,
    );

    const result = await appointments
      .aggregate([
        ...this.aggregateJoin,
        {
          $match: {
            endAt: {
              $gte: date,
            },
            status: {
              $ne: "declined",
            },
          },
        },
        {
          $sort: {
            dateTime: 1,
          },
        },
        { $limit: limit },
      ])
      .toArray();

    logger.debug(
      { date, limit, count: result.length },
      "Next appointments retrieved",
    );

    return result as Appointment[];
  }

  public async getAppointments(
    query: Query & {
      range?: DateRange;
      endRange?: DateRange;
      status?: AppointmentStatus[];
      optionId?: string | string[];
      customerId?: string | string[];
      discountId?: string | string[];
    },
  ): Promise<WithTotal<Appointment>> {
    const logger = this.loggerFactory("getAppointments");
    logger.info({ query }, "Getting appointments");

    const db = await getDbConnection();

    const sort: Sort = query.sort?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr.desc ? -1 : 1,
      }),
      {},
    ) || { dateTime: -1 };

    const filter: Filter<Appointment> = {};
    if (query.range?.start || query.range?.end) {
      filter.dateTime = {};

      if (query.range.start) {
        filter.dateTime.$gte = query.range.start;
      }

      if (query.range.end) {
        filter.dateTime.$lte = query.range.end;
      }
    }

    if (query.endRange?.start || query.endRange?.end) {
      filter.endAt = {};
      if (query.endRange.start) {
        filter.endAt.$gte = query.endRange.start;
      }

      if (query.endRange.end) {
        filter.endAt.$lte = query.endRange.end;
      }
    }

    if (query.status && query.status.length) {
      filter.status = {
        $in: query.status,
      };
    }

    if (query.customerId) {
      filter.customerId = {
        $in: Array.isArray(query.customerId)
          ? query.customerId
          : [query.customerId],
      };
    }

    if (query.optionId) {
      filter["option._id"] = {
        $in: Array.isArray(query.optionId) ? query.optionId : [query.optionId],
      };
    }

    if (query.discountId) {
      filter["discount.id"] = {
        $in: Array.isArray(query.discountId)
          ? query.discountId
          : [query.discountId],
      };
    }

    if (query.search) {
      const $regex = new RegExp(escapeRegex(query.search), "i");
      const queries = buildSearchQuery<Appointment>(
        { $regex },
        "option.name",
        "note",
        "addons.name",
        "addons.description",
        // @ts-ignore value
        "fields.v",
      );

      filter.$or = queries;
    }

    const [result] = await db
      .collection<AppointmentEntity>(APPOINTMENTS_COLLECTION_NAME)
      .aggregate([
        {
          $addFields: {
            fields: {
              $objectToArray: "$fields",
            },
          },
        },
        ...this.aggregateJoin,
        {
          $match: filter,
        },
        {
          $sort: sort,
        },
        {
          $addFields: {
            fields: {
              $arrayToObject: "$fields",
            },
          },
        },
        {
          $facet: {
            paginatedResults:
              query.limit === 0
                ? undefined
                : [
                    ...(typeof query.offset !== "undefined"
                      ? [{ $skip: query.offset }]
                      : []),
                    ...(typeof query.limit !== "undefined"
                      ? [{ $limit: query.limit }]
                      : []),
                  ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ])
      .toArray();

    const response = {
      total: result.totalCount?.[0]?.count || 0,
      items: result.paginatedResults || [],
    };

    logger.info(
      {
        result: { total: response.total, count: response.items.length },
        query,
      },
      "Fetched appointments",
    );

    return response;
  }

  public async getEvents(
    start: Date,
    end: Date,
    status: AppointmentStatus[],
  ): Promise<Event[]> {
    const logger = this.loggerFactory("getEvents");
    logger.debug({ start, end, status }, "Getting events");

    const appointments = await this.getAppointments({
      range: {
        start,
        end,
      },
      status,
    });

    const { booking: config, general: generalConfig } =
      await this.configurationService.getConfigurations("booking", "general");

    const apps = await this.appsService.getAppsData(
      config.calendarSources?.map((source) => source.appId) || [],
    );

    const skipUids = new Set(
      appointments.items.map((app) =>
        getIcsEventUid(app._id, generalConfig.url),
      ),
    );

    logger.debug(
      { appCount: apps.length },
      "Getting busy times from calendar apps",
    );

    const appsPromises = apps.map(async (app) => {
      const service = AvailableAppServices[app.name](
        this.appsService.getAppServiceProps(app._id),
      ) as any as ICalendarBusyTimeProvider;

      return await service.getBusyTimes(app, start, end);
    });

    const appsResponse = await Promise.all(appsPromises);
    const appsEvents: Event[] = appsResponse
      .flat()
      .map((event) => ({
        title: event.title || "Busy",
        dateTime: event.startAt,
        totalDuration: DateTime.fromJSDate(event.endAt).diff(
          DateTime.fromJSDate(event.startAt),
          "minutes",
        ).minutes,
        uid: event.uid,
      }))
      .filter((event) => !skipUids.has(event.uid));

    const result = [...appointments.items, ...appsEvents];

    logger.debug(
      {
        start,
        end,
        status,
        appointmentCount: appointments.items.length,
        appEventCount: appsEvents.length,
        totalEventCount: result.length,
      },
      "Events retrieved",
    );

    return result;
  }

  public async getAppointment(id: string): Promise<Appointment | null> {
    const logger = this.loggerFactory("getAppointment");
    logger.debug({ appointmentId: id }, "Getting appointment by id");

    const db = await getDbConnection();
    const appointments = db.collection<AppointmentEntity>(
      APPOINTMENTS_COLLECTION_NAME,
    );

    const result = await appointments
      .aggregate([
        {
          $match: {
            _id: id,
          },
        },
        ...this.aggregateJoin,
      ])
      .next();

    if (!result) {
      logger.warn({ appointmentId: id }, "Appointment not found");
    } else {
      logger.debug(
        {
          appointmentId: id,
          customerName: result.customer?.name,
          status: result.status,
        },
        "Appointment found",
      );
    }

    return result as Appointment | null;
  }

  public async findAppointment(
    fields: ModifyAppointmentInformationRequest["fields"],
    status?: AppointmentStatus[],
  ): Promise<Appointment | null> {
    const logger = this.loggerFactory("findAppointment");
    logger.debug({ fields }, "Finding appointment");

    const db = await getDbConnection();
    const appointments = db.collection<AppointmentEntity>(
      APPOINTMENTS_COLLECTION_NAME,
    );

    const dateTime = DateTime.fromJSDate(fields.dateTime);

    const filter: Filter<Appointment>[] = [
      {
        dateTime: {
          $gte: dateTime.startOf("minute").toJSDate(),
          $lte: dateTime.endOf("minute").toJSDate(),
        },
      },
    ];

    if (status && status.length) {
      filter.push({
        status: {
          $in: status,
        },
      });
    }

    if (fields.type === "email") {
      filter.push({ "fields.email": fields.email });
    } else if (fields.type === "phone") {
      filter.push({ "fields.phone": fields.phone });
    }

    const result = await appointments
      .aggregate([
        {
          $match: {
            $and: filter,
          },
        },
        ...this.aggregateJoin,
      ])
      .next();

    if (!result) {
      logger.warn({ fields }, "Appointment not found");
    } else {
      logger.debug(
        {
          appointmentId: result._id,
          customerName: result.customer?.name,
          status: result.status,
        },
        "Appointment found",
      );
    }

    return result as Appointment | null;
  }

  public async changeAppointmentStatus(
    id: string,
    newStatus: AppointmentStatus,
    by: "customer" | "user" = "user",
  ) {
    const logger = this.loggerFactory("changeAppointmentStatus");
    logger.debug(
      { appointmentId: id, newStatus },
      "Changing appointment status",
    );

    const appointment = await this.getAppointment(id);

    if (!appointment) {
      logger.warn(
        { appointmentId: id },
        "Appointment not found for status change",
      );
      return;
    }
    const oldStatus = appointment.status;

    if (oldStatus === newStatus) {
      logger.debug(
        { appointmentId: id, status: oldStatus },
        "Appointment status unchanged",
      );
      return;
    }

    const db = await getDbConnection();
    await db
      .collection<AppointmentEntity>(APPOINTMENTS_COLLECTION_NAME)
      .updateOne(
        {
          _id: id,
        },
        {
          $set: {
            status: newStatus,
          },
        },
      );

    logger.debug(
      { appointmentId: id, oldStatus, newStatus },
      "Appointment status changed",
    );

    appointment.status = newStatus;

    await this.addAppointmentHistory({
      appointmentId: id,
      type: "statusChanged",
      data: {
        oldStatus,
        newStatus,
        by,
      },
    });

    await this.appsService.executeHooks<IAppointmentHook>(
      "appointment-hook",
      async (hook, service) => {
        await service.onAppointmentStatusChanged?.(
          hook,
          appointment,
          newStatus,
          oldStatus,
          by,
        );
      },
      {
        ignoreErrors: true,
      },
    );

    logger.debug(
      { appointmentId: id, oldStatus, newStatus },
      "Appointment status changed successfully",
    );
  }

  public async updateAppointmentNote(id: string, note?: string) {
    const logger = this.loggerFactory("updateAppointmentNote");
    logger.debug(
      { appointmentId: id, noteLength: note?.length },
      "Updating appointment note",
    );

    const db = await getDbConnection();

    await db
      .collection<AppointmentEntity>(APPOINTMENTS_COLLECTION_NAME)
      .updateOne(
        {
          _id: id,
        },
        {
          $set: {
            note: note,
          },
        },
      );

    logger.debug(
      { appointmentId: id },
      "Appointment note updated successfully",
    );
  }

  public async addAppointmentFiles(
    appointmentId: string,
    files: File[],
  ): Promise<Asset[]> {
    const logger = this.loggerFactory("addAppointmentFiles");
    logger.debug(
      { appointmentId, fileCount: files.length },
      "Adding files to appointment",
    );

    const db = await getDbConnection();
    const event = await db
      .collection<AppointmentEntity>(APPOINTMENTS_COLLECTION_NAME)
      .findOne({
        _id: appointmentId,
      });

    if (!event) {
      logger.warn({ appointmentId }, "Appointment not found for file addition");
      return [];
    }

    const assets: Asset[] = [];
    if (files) {
      for (const file of files) {
        let fileType = mimeType.lookup(file.name);
        if (!fileType) {
          fileType = "application/octet-stream";
        } else if (Array.isArray(fileType)) {
          fileType = fileType[0];
        }

        logger.debug(
          { appointmentId, fileName: file.name, fileType },
          "Adding file to appointment",
        );

        const id = v4();
        const asset = await this.assetsService.createAsset(
          {
            filename: `${getAppointmentBucket(appointmentId)}/${id}-${file.name}`,
            mimeType: fileType,
            appointmentId,
            description: `${event.fields.name} - ${event.option.name}`,
          },
          file,
        );

        assets.push({ ...asset, appointment: event });
      }
    }

    logger.debug(
      { appointmentId, fileCount: files.length, assetCount: assets.length },
      "Files added to appointment successfully",
    );

    return assets;
  }

  public async rescheduleAppointment(
    id: string,
    newTime: Date,
    newDuration: number,
    doNotNotifyCustomer?: boolean,
    by: "customer" | "user" = "user",
  ) {
    const logger = this.loggerFactory("rescheduleAppointment");
    logger.debug(
      { appointmentId: id, newTime, newDuration, doNotNotifyCustomer },
      "Rescheduling appointment",
    );

    const appointment = await this.getAppointment(id);

    if (!appointment) {
      logger.warn(
        { appointmentId: id },
        "Appointment not found for rescheduling",
      );
      return;
    }

    const oldTime = appointment.dateTime;
    const oldDuration = appointment.totalDuration;

    const db = await getDbConnection();
    await db
      .collection<AppointmentEntity>(APPOINTMENTS_COLLECTION_NAME)
      .updateOne(
        {
          _id: id,
        },
        {
          $set: {
            dateTime: newTime,
            totalDuration: newDuration,
          },
        },
      );

    await this.addAppointmentHistory({
      appointmentId: id,
      type: "rescheduled",
      data: {
        oldDateTime: oldTime,
        newDateTime: newTime,
        by,
      },
    });

    logger.debug(
      { appointmentId: id, newTime, newDuration },
      "Appointment rescheduled in db",
    );

    logger.debug(
      { appointmentId: id, newTime, newDuration },
      "Appointment rescheduled in db",
    );

    await this.appsService.executeHooks<IAppointmentHook>(
      "appointment-hook",
      async (hook, service) => {
        await service.onAppointmentRescheduled?.(
          hook,
          appointment,
          newTime,
          newDuration,
          oldTime,
          oldDuration,
          doNotNotifyCustomer,
        );
      },
      {
        ignoreErrors: true,
      },
    );

    logger.debug(
      {
        appointmentId: id,
        oldTime,
        newTime,
        oldDuration,
        newDuration,
      },
      "Appointment rescheduled successfully",
    );
  }

  public async getAppointmentHistory(
    query: Query & {
      appointmentId: string;
      type?: AppointmentHistoryEntry["type"];
    },
  ): Promise<WithTotal<AppointmentHistoryEntry>> {
    const logger = this.loggerFactory("getAppointmentHistory");
    logger.debug({ query }, "Getting appointment history");

    const sort: Sort = query.sort?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr.desc ? -1 : 1,
      }),
      {},
    ) || { dateTime: -1 };

    const filter: Filter<AppointmentHistoryEntry> = {};
    if (query.appointmentId) {
      filter.appointmentId = query.appointmentId;
    }

    if (query.type) {
      filter.type = query.type;
    }

    if (query.search) {
      const $regex = new RegExp(escapeRegex(query.search), "i");
      const queries = buildSearchQuery<AppointmentHistoryEntry>(
        { $regex },
        "type",
      );

      filter.$or = queries;
    }

    const db = await getDbConnection();

    const [result] = await db
      .collection<AppointmentHistoryEntry>(APPOINTMENTS_HISTORY_COLLECTION_NAME)
      .aggregate([
        { $match: filter },
        { $sort: sort },
        {
          $facet: {
            paginatedResults:
              query.limit === 0
                ? undefined
                : [
                    ...(typeof query.offset !== "undefined"
                      ? [{ $skip: query.offset }]
                      : []),
                    ...(typeof query.limit !== "undefined"
                      ? [{ $limit: query.limit }]
                      : []),
                  ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ])
      .toArray();

    const response = {
      total: result.totalCount?.[0]?.count || 0,
      items: result.paginatedResults || [],
    };

    logger.debug(
      { total: response.total, items: response.items.length },
      "Appointment history retrieved",
    );

    return response;
  }

  public async addAppointmentHistory(
    entry: Omit<AppointmentHistoryEntry, "_id" | "dateTime">,
  ): Promise<string> {
    const logger = this.loggerFactory("addAppointmentHistory");
    logger.debug({ entry }, "Adding appointment history");

    const db = await getDbConnection();
    const historyEntry = {
      ...entry,
      _id: new ObjectId().toString(),
      dateTime: new Date(),
    } as AppointmentHistoryEntry;

    await db
      .collection<AppointmentHistoryEntry>(APPOINTMENTS_HISTORY_COLLECTION_NAME)
      .insertOne(historyEntry);

    logger.debug({ historyEntry }, "Appointment history added");

    return historyEntry._id;
  }

  public async verifyTimeAvailability(
    dateTime: Date,
    duration: number,
    propConfig?: BookingConfiguration,
    propGeneralConfig?: GeneralConfiguration,
  ): Promise<boolean> {
    const logger = this.loggerFactory("verifyTimeAvailability");
    logger.debug({ dateTime, duration }, "Verifying time availability");

    const config =
      propConfig ||
      (await this.configurationService.getConfiguration("booking"));
    const generalConfig =
      propGeneralConfig ||
      (await this.configurationService.getConfiguration("general"));

    const eventTime = DateTime.fromJSDate(dateTime, {
      zone: "utc",
    }).setZone(generalConfig.timeZone);

    if (eventTime < DateTime.now()) {
      logger.warn(
        { eventTime, now: DateTime.now() },
        "Event time is in the past",
      );

      return false;
    }

    const start = eventTime.startOf("day");
    const end = start.endOf("day");

    const events = await this.getBusyTimes(start, end, config, generalConfig);

    const schedule = await this.scheduleService.getSchedule(
      start.toJSDate(),
      end.toJSDate(),
    );

    const availability = await this.getAvailableTimes(
      start,
      end,
      duration,
      events,
      config,
      generalConfig,
      schedule,
    );

    if (!availability.find((time) => time === eventTime.toMillis())) {
      logger.warn(
        { eventTime, availability, start, end },
        "Event time is not available",
      );

      return false;
    }

    return true;
  }

  private async getAvailableTimes(
    start: DateTime,
    end: DateTime,
    duration: number,
    events: Period[],
    config: BookingConfiguration,
    generalConfig: GeneralConfiguration,
    schedule: Record<string, DaySchedule>,
  ) {
    const logger = this.loggerFactory("getAvailableTimes");

    const customSlots = config.customSlotTimes?.map((x) => parseTime(x));

    let results: TimeSlot[];
    if (!config.smartSchedule?.allowSmartSchedule) {
      logger.debug(
        { start, end, duration, events, config, schedule },
        "Getting available time slots in calendar",
      );

      results = getAvailableTimeSlotsInCalendar({
        calendarEvents: events.map((event) => ({
          ...event,
          startAt: DateTime.fromJSDate(event.startAt),
          endAt: DateTime.fromJSDate(event.endAt),
        })),
        configuration: {
          timeSlotDuration: duration,
          schedule,
          timeZone: generalConfig.timeZone || DateTime.now().zoneName!,
          minAvailableTimeAfterSlot: config.breakDuration ?? 0,
          minAvailableTimeBeforeSlot: config.breakDuration ?? 0,
          slotStart: config.slotStart ?? 15,
          customSlots,
        },
        from: start.toJSDate(),
        to: end.toJSDate(),
      });
    } else {
      // Smart schedule
      logger.debug(
        { start, end, duration, events, config, schedule },
        "Getting available time slots with priority",
      );

      let servicesDurations: number[] | undefined = undefined;
      if (config.smartSchedule?.maximizeForOption) {
        const service = await this.servicesService.getOption(
          config.smartSchedule.maximizeForOption,
        );
        if (service?.duration) {
          servicesDurations = [service.duration];
        }
      }

      results = getAvailableTimeSlotsWithPriority({
        events: events.map((event) => ({
          ...event,
          startAt: DateTime.fromJSDate(event.startAt),
          endAt: DateTime.fromJSDate(event.endAt),
        })),
        duration,
        schedule,
        configuration: {
          timeZone: generalConfig.timeZone || DateTime.now().zoneName!,
          breakDuration: config.breakDuration ?? 0,
          slotStart: config.slotStart ?? 15,
          allowSkipBreak: config.smartSchedule?.allowSkipBreak,
          filterLowPrioritySlots: true,
          lowerPriorityIfNoFollowingBooking: true,
          discourageLargeGaps: true,
          allowSmartSlotStarts: config.smartSchedule?.allowSmartSlotStarts,
          preferBackToBack: config.smartSchedule?.preferBackToBack,
          customSlots,
        },
        start,
        end,
        allServiceDurations: servicesDurations, //  servicesDurations
      });
    }

    logger.debug(
      { start, end, duration, results: results.length },
      "Available time slots retrieved",
    );

    return results.map((x) => x.startAt);
  }

  private async getBusyTimes(
    start: DateTime,
    end: DateTime,
    config: BookingConfiguration,
    generalConfig: GeneralConfiguration,
  ) {
    const logger = this.loggerFactory("getBusyTimes");

    logger.debug({ start, end }, "Getting busy times");

    const declinedAppointments = await this.getDbDeclinedEventIds(start, end);
    const declinedUids = new Set(
      declinedAppointments.map((id) => getIcsEventUid(id, generalConfig.url)),
    );

    logger.debug(
      { start, end, declinedAppointments, declinedUids },
      "Declined appointments retrieved",
    );

    const apps = await this.appsService.getAppsData(
      config.calendarSources?.map((source) => source.appId) || [],
    );

    const dbEventsPromise = this.getDbBusyTimes(start, end);
    const appsPromises = apps.map(async (app) => {
      logger.debug(
        { appId: app._id, appName: app.name, start, end },
        "Getting busy times from app",
      );

      const service = AvailableAppServices[app.name](
        this.appsService.getAppServiceProps(app._id),
      ) as any as ICalendarBusyTimeProvider;

      return service.getBusyTimes(app, start.toJSDate(), end.toJSDate());
    });

    const [dbEvents, ...appsEvents] = await Promise.all([
      dbEventsPromise,
      ...appsPromises,
    ]);

    logger.debug({ start, end, dbEvents, appsEvents }, "Busy times retrieved");

    const remoteEvents = appsEvents
      .flat()
      .filter((event) => !declinedUids.has(event.uid))
      .map(
        (event) =>
          ({
            startAt: event.startAt,
            endAt: event.endAt,
          }) satisfies Period,
      );

    logger.debug(
      {
        start,
        end,
        remoteEvents: remoteEvents.length,
        dbEvents: dbEvents.length,
        total: remoteEvents.length + dbEvents.length,
      },
      "Busy times retrieved",
    );

    return [...dbEvents, ...remoteEvents];
  }

  private async getDbBusyTimes(
    start: DateTime,
    end: DateTime,
  ): Promise<Period[]> {
    const logger = this.loggerFactory("getDbBusyTimes");

    const db = await getDbConnection();
    logger.debug({ start, end }, "Getting busy times from db");

    const events = await db
      .collection<AppointmentEntity>(APPOINTMENTS_COLLECTION_NAME)
      .find({
        dateTime: {
          $gte: start.minus({ days: 1 }).toJSDate(),
          $lte: end.plus({ days: 1 }).toJSDate(),
        },
        status: {
          $ne: "declined",
        },
      })
      .map(({ totalDuration: duration, dateTime }) => {
        return {
          duration,
          dateTime,
        };
      })
      .toArray();

    logger.debug(
      { start, end, events: events.length },
      "Busy times retrieved from db",
    );

    return events.map((x) => ({
      startAt: DateTime.fromJSDate(x.dateTime, { zone: "utc" }).toJSDate(),
      endAt: DateTime.fromJSDate(x.dateTime, { zone: "utc" })
        .plus({
          minutes: x.duration,
        })
        .toJSDate(),
    }));
  }

  private async getDbDeclinedEventIds(
    start: DateTime,
    end: DateTime,
  ): Promise<string[]> {
    const logger = this.loggerFactory("getDbDeclinedEventIds");

    const db = await getDbConnection();
    logger.debug({ start, end }, "Getting declined event ids from db");

    const ids = await db
      .collection<AppointmentEntity>(APPOINTMENTS_COLLECTION_NAME)
      .find({
        dateTime: {
          $gte: start.minus({ days: 1 }).toJSDate(),
          $lte: end.plus({ days: 1 }).toJSDate(),
        },
        status: {
          $eq: "declined",
        },
      })
      .map(({ _id }) => _id)
      .toArray();

    logger.debug(
      { start, end, ids: ids.length },
      "Declined event ids retrieved from db",
    );

    return ids;
  }

  private async saveEvent(
    id: string,
    event: AppointmentEvent,
    by: "customer" | "user",
    files?: Asset[],
    paymentIntentId?: string,
    status: AppointmentStatus = "pending",
    force?: boolean,
  ): Promise<Appointment> {
    const logger = this.loggerFactory("saveEvent");

    logger.debug(
      {
        appointmentId: id,
        customerName: event.fields.name,
        status,
        fileCount: files?.length || 0,
        paymentIntentId,
        force,
      },
      "Saving event",
    );

    const db = await getDbConnection();
    const client = await getDbClient();
    const session = client.startSession();
    try {
      return await session.withTransaction(async () => {
        const appointments = db.collection<AppointmentEntity>(
          APPOINTMENTS_COLLECTION_NAME,
        );

        const customer = await this.customersService.getOrUpsertCustomer(
          event.fields,
        );

        if (customer.dontAllowBookings && !force) {
          logger.error(
            { appointmentId: id, customerName: customer.name },
            "Customer is not allowed to make appointments",
          );
          console.error(
            `Customer ${customer.name} is not allowed to make appointments`,
          );
          throw new Error(
            `Customer ${customer.name} is not allowed to make appointments`,
          );
        }

        const dbEvent: AppointmentEntity = {
          _id: id,
          ...event,
          dateTime: DateTime.fromJSDate(event.dateTime)
            .startOf("minute")
            .toJSDate(),
          status,
          createdAt: DateTime.now().toJSDate(),
          customerId: customer._id,
        };

        await appointments.insertOne(dbEvent);

        let payments: Payment[] = [];
        if (paymentIntentId) {
          logger.debug(
            { appointmentId: id, paymentIntentId },
            "Processing payment for appointment",
          );

          const {
            amount,
            appId,
            appName,
            _id: intentId,
            paidAt,
            externalId,
            status,
            fees,
          } = await this.paymentsService.updateIntent(paymentIntentId, {
            appointmentId: id,
            customerId: customer._id,
          });

          if (status === "paid") {
            logger.debug(
              { appointmentId: id, paymentIntentId, amount },
              "Payment intent is paid, adding to payments",
            );
            const payment = await this.paymentsService.createPayment({
              appId,
              appName,
              amount,
              intentId,
              paidAt: paidAt ?? new Date(),
              appointmentId: id,
              customerId: customer._id,
              description:
                amount === event.totalPrice ? "full_payment" : "deposit",
              status: "paid",
              method: "online",
              type: "deposit",
              externalId: externalId,
              fees,
            });

            payments.push(payment);
          } else {
            logger.warn(
              { appointmentId: id, paymentIntentId, amount, status },
              "Payment intent is not paid. Skipping it",
            );
          }

          logger.debug(
            {
              appointmentId: id,
              paymentAmount: amount,
              paymentType:
                amount === event.totalPrice ? "full_payment" : "deposit",
            },
            "Payment processed for appointment",
          );
        }

        const result = {
          ...dbEvent,
          customer,
          files,
          payments,
          endAt: DateTime.fromJSDate(event.dateTime)
            .plus({
              minutes: dbEvent.totalDuration,
            })
            .toJSDate(),
        };

        const historyPayment: PaymentHistory | undefined = payments?.[0]
          ? {
              id: payments[0]._id,
              amount: payments[0].amount,
              status: payments[0].status,
              method: payments[0].method,
              type: payments[0].type,
              intentId:
                "intentId" in payments[0] ? payments[0].intentId : undefined,
              externalId:
                "externalId" in payments[0]
                  ? payments[0].externalId
                  : undefined,
              appName:
                "appName" in payments[0] ? payments[0].appName : undefined,
              appId: "appId" in payments[0] ? payments[0].appId : undefined,
            }
          : undefined;

        await this.addAppointmentHistory({
          appointmentId: id,
          type: "created",
          data: {
            by,
            confirmed: status === "confirmed",
            payment: historyPayment,
          },
        });

        logger.debug(
          { appointmentId: id, customerName: customer.name, status },
          "Event saved successfully",
        );

        return result;
      });
    } finally {
      await session.endSession();
    }
  }

  private async updateEventInDatabase(
    id: string,
    event: AppointmentEvent,
    oldEvent: Appointment,
    files?: Asset[],
    confirmed?: boolean,
  ): Promise<void> {
    const logger = this.loggerFactory("saveEvent");

    logger.debug(
      {
        appointmentId: id,
        customerName: event.fields.name,
        fileCount: files?.length || 0,
        confirmed,
      },
      "Updating event in database",
    );

    const db = await getDbConnection();
    const client = await getDbClient();
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const appointments = db.collection<AppointmentEntity>(
          APPOINTMENTS_COLLECTION_NAME,
        );

        const status =
          confirmed || oldEvent.status === "confirmed"
            ? "confirmed"
            : "pending";

        const dbEvent: Partial<AppointmentEntity> = {
          ...event,
          dateTime: DateTime.fromJSDate(event.dateTime)
            .startOf("minute")
            .toJSDate(),
          status,
        };

        await appointments.updateOne({ _id: id }, { $set: dbEvent });

        await this.addAppointmentHistory({
          appointmentId: id,
          type: "updated",
          data: {
            oldOption: oldEvent.option,
            newOption: event.option,
            oldFields: oldEvent.fields,
            newFields: event.fields,
            oldAddons: oldEvent.addons,
            newAddons: event.addons,
            oldDiscount: oldEvent.discount,
            newDiscount: event.discount,
            oldNote: oldEvent.note,
            newNote: event.note,
            oldDateTime: oldEvent.dateTime,
            newDateTime: event.dateTime,
            oldDuration: oldEvent.totalDuration,
            newDuration: event.totalDuration,
            oldTotalPrice: oldEvent.totalPrice ?? 0,
            newTotalPrice: event.totalPrice ?? 0,
            oldTotalDuration: oldEvent.totalDuration,
            newTotalDuration: event.totalDuration,
            oldStatus: oldEvent.status,
            newStatus: status,
          },
        });

        logger.debug(
          { appointmentId: id, status },
          "Event updated in database successfully",
        );
      });
    } finally {
      await session.endSession();
    }
  }

  private get aggregateJoin() {
    return [
      {
        $addFields: {
          endAt: {
            $dateAdd: {
              startDate: "$dateTime",
              unit: "minute",
              amount: "$totalDuration",
            },
          },
        },
      },
      {
        $lookup: {
          from: CUSTOMERS_COLLECTION_NAME,
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $lookup: {
          from: ASSETS_COLLECTION_NAME,
          localField: "_id",
          foreignField: "appointmentId",
          as: "files",
        },
      },
      {
        $lookup: {
          from: PAYMENTS_COLLECTION_NAME,
          localField: "_id",
          foreignField: "appointmentId",
          as: "payments",
        },
      },
      {
        $set: {
          customer: {
            $first: "$customer",
          },
        },
      },
    ];
  }
}

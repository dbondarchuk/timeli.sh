import { renderToStaticMarkup } from "@vivid/email-builder/static";
import { getLoggerFactory } from "@vivid/logger";
import {
  Appointment,
  BookingConfiguration,
  ConnectedAppData,
  ConnectedAppError,
  ConnectedAppStatusWithText,
  GeneralConfiguration,
  IConnectedApp,
  IConnectedAppProps,
  IScheduled,
  ServiceField,
  SocialConfiguration,
  WithTotal,
} from "@vivid/types";
import {
  buildSearchQuery,
  escapeRegex,
  getArguments,
  getPhoneField,
  templateSafeWithError,
} from "@vivid/utils";
import { DateTime } from "luxon";
import { ObjectId, type Filter, type Sort } from "mongodb";
import {
  GetRemindersAction,
  Reminder,
  ReminderUpdateModel,
  RequestAction,
} from "./models";
import {
  RemindersAdminAllKeys,
  RemindersAdminKeys,
  RemindersAdminNamespace,
} from "./translations/types";

const REMINDERS_COLLECTION_NAME = "reminders";

export default class RemindersConnectedApp
  implements IConnectedApp, IScheduled
{
  protected readonly loggerFactory = getLoggerFactory("RemindersConnectedApp");

  public constructor(protected readonly props: IConnectedAppProps) {}

  public async processRequest(
    appData: ConnectedAppData,
    data: RequestAction,
  ): Promise<any> {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      { appId: appData._id, actionType: data.type },
      "Processing reminders request",
    );

    try {
      switch (data.type) {
        case "get-reminder":
          logger.debug(
            { appId: appData._id, reminderId: data.id },
            "Getting reminder",
          );
          return await this.getReminder(appData._id, data.id);

        case "get-reminders":
          logger.debug(
            { appId: appData._id, query: data.query },
            "Getting reminders",
          );
          return await this.getReminders(appData._id, data.query);

        case "delete-reminders":
          logger.debug(
            { appId: appData._id, reminderIds: data.ids },
            "Deleting reminders",
          );
          return await this.deleteReminders(appData._id, data.ids);

        case "create-reminder":
          logger.debug(
            { appId: appData._id, reminderName: data.reminder.name },
            "Creating reminder",
          );
          return await this.createReminder(appData._id, data.reminder);

        case "update-reminder":
          logger.debug(
            {
              appId: appData._id,
              reminderId: data.id,
              reminderName: data.update.name,
            },
            "Updating reminder",
          );
          return await this.updateReminder(appData._id, data.id, data.update);

        case "check-unique-name":
          logger.debug(
            { appId: appData._id, name: data.name, reminderId: data.id },
            "Checking unique name",
          );
          return await this.checkUniqueName(appData._id, data.name, data.id);

        default: {
          logger.debug(
            { appId: appData._id },
            "Processing default request - setting up reminders app",
          );

          const defaultApps = await this.props.services
            .ConfigurationService()
            .getConfiguration("defaultApps");

          try {
            const emailAppId = defaultApps.email?.appId;
            await this.props.services
              .ConnectedAppsService()
              .getApp(emailAppId!);

            logger.debug(
              { appId: appData._id, emailAppId },
              "Email sender default app found",
            );
          } catch {
            logger.error(
              { appId: appData._id },
              "Email sender default app is not configured",
            );
            return {
              status: "failed",
              statusText:
                "app_reminders_admin.statusText.email_app_not_configured" satisfies RemindersAdminAllKeys,
            };
          }

          const status: ConnectedAppStatusWithText<
            RemindersAdminNamespace,
            RemindersAdminKeys
          > = {
            status: "connected",
            statusText: "app_reminders_admin.statusText.successfully_set_up",
          };

          this.props.update({
            data,
            ...status,
          });

          logger.info(
            { appId: appData._id },
            "Successfully set up reminders app",
          );

          return status;
        }
      }
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          actionType: data.type,
          error: error?.message || error?.toString(),
        },
        "Error processing reminders request",
      );
      throw error;
    }
  }

  public async unInstall(appData: ConnectedAppData): Promise<void> {
    const logger = this.loggerFactory("unInstall");
    logger.debug({ appId: appData._id }, "Uninstalling reminders app");

    try {
      const db = await this.props.getDbConnection();
      const collection = db.collection<Reminder>(REMINDERS_COLLECTION_NAME);

      logger.debug({ appId: appData._id }, "Deleting reminders for app");

      await collection.deleteMany({
        appId: appData._id,
      });

      const count = await collection.countDocuments({});
      if (count === 0) {
        logger.debug(
          { appId: appData._id },
          "No reminders left, dropping collection",
        );
        await db.dropCollection(REMINDERS_COLLECTION_NAME);
      }

      logger.info(
        { appId: appData._id },
        "Successfully uninstalled reminders app",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, error: error?.message || error?.toString() },
        "Error uninstalling reminders app",
      );
      throw error;
    }
  }

  protected async getReminder(appId: string, id: string) {
    const logger = this.loggerFactory("getReminder");
    logger.debug({ appId, reminderId: id }, "Getting reminder");

    try {
      const db = await this.props.getDbConnection();

      const reminder = await db
        .collection<Reminder>(REMINDERS_COLLECTION_NAME)
        .findOne({
          appId,
          _id: id,
        });

      if (reminder) {
        logger.debug(
          { appId, reminderId: id, reminderName: reminder.name },
          "Successfully retrieved reminder",
        );
      } else {
        logger.debug({ appId, reminderId: id }, "Reminder not found");
      }

      return reminder;
    } catch (error: any) {
      logger.error(
        { appId, reminderId: id, error: error?.message || error?.toString() },
        "Error getting reminder",
      );
      throw error;
    }
  }

  protected async getReminders(
    appId: string,
    query: GetRemindersAction["query"],
  ): Promise<WithTotal<Reminder>> {
    const logger = this.loggerFactory("getReminders");
    logger.debug({ appId, query }, "Getting reminders");

    try {
      const db = await this.props.getDbConnection();

      const sort: Sort = query.sort?.reduce(
        (prev, curr) => ({
          ...prev,
          [curr.id]: curr.desc ? -1 : 1,
        }),
        {},
      ) || { updatedAt: -1 };

      const filter: Filter<Reminder> = {
        appId,
      };

      if (query.channel) {
        filter.channel = {
          $in: query.channel,
        };
      }

      if (query.search) {
        const $regex = new RegExp(escapeRegex(query.search), "i");
        const queries = buildSearchQuery<Reminder>({ $regex }, "name");

        filter.$or = queries;
      }

      logger.debug(
        { appId, filter, sort, offset: query.offset, limit: query.limit },
        "Executing reminders query",
      );

      const [result] = await db
        .collection<Reminder>(REMINDERS_COLLECTION_NAME)
        .aggregate([
          {
            $sort: sort,
          },
          {
            $match: filter,
          },
          {
            $project: {
              value: false,
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

      const total = result.totalCount?.[0]?.count || 0;
      const items = result.paginatedResults || [];

      logger.debug(
        { appId, total, itemCount: items.length },
        "Successfully retrieved reminders",
      );

      return {
        total,
        items,
      };
    } catch (error: any) {
      logger.error(
        { appId, query, error: error?.message || error?.toString() },
        "Error getting reminders",
      );
      throw error;
    }
  }

  protected async createReminder(
    appId: string,
    reminder: ReminderUpdateModel,
  ): Promise<Reminder> {
    const logger = this.loggerFactory("createReminder");
    logger.debug(
      {
        appId,
        reminderName: reminder.name,
        channel: reminder.channel,
        type: reminder.type,
      },
      "Creating reminder",
    );

    try {
      const dbReminder: Reminder = {
        ...reminder,
        appId,
        _id: new ObjectId().toString(),
        updatedAt: DateTime.utc().toJSDate(),
      };

      const isUnique = await this.checkUniqueName(appId, reminder.name);
      if (!isUnique) {
        logger.error(
          { appId, reminderName: reminder.name },
          "Reminder name already exists",
        );
        throw new ConnectedAppError(
          "app_reminders_admin.form.name.validation.unique" satisfies RemindersAdminAllKeys,
        );
      }

      const db = await this.props.getDbConnection();
      const reminders = db.collection<Reminder>(REMINDERS_COLLECTION_NAME);

      await reminders.insertOne(dbReminder);

      logger.info(
        { appId, reminderId: dbReminder._id, reminderName: reminder.name },
        "Successfully created reminder",
      );

      return dbReminder;
    } catch (error: any) {
      logger.error(
        {
          appId,
          reminderName: reminder.name,
          error: error?.message || error?.toString(),
        },
        "Error creating reminder",
      );
      throw error;
    }
  }

  protected async updateReminder(
    appId: string,
    id: string,
    update: ReminderUpdateModel,
  ): Promise<void> {
    const logger = this.loggerFactory("updateReminder");
    logger.debug(
      { appId, reminderId: id, reminderName: update.name },
      "Updating reminder",
    );

    try {
      const db = await this.props.getDbConnection();
      const reminders = db.collection<Reminder>(REMINDERS_COLLECTION_NAME);

      const { _id, ...updateObj } = update as Reminder; // Remove fields in case it slips here

      const isUnique = await this.checkUniqueName(appId, update.name, id);
      if (!isUnique) {
        logger.error(
          { appId, reminderId: id, reminderName: update.name },
          "Reminder name already exists",
        );
        throw new ConnectedAppError(
          "app_reminders_admin.form.name.validation.unique" satisfies RemindersAdminAllKeys,
        );
      }

      updateObj.updatedAt = DateTime.utc().toJSDate();

      await reminders.updateOne(
        {
          _id: id,
        },
        {
          $set: updateObj,
        },
      );

      logger.info(
        { appId, reminderId: id, reminderName: update.name },
        "Successfully updated reminder",
      );
    } catch (error: any) {
      logger.error(
        {
          appId,
          reminderId: id,
          reminderName: update.name,
          error: error?.message || error?.toString(),
        },
        "Error updating reminder",
      );
      throw error;
    }
  }

  protected async deleteReminders(appId: string, ids: string[]): Promise<void> {
    const logger = this.loggerFactory("deleteReminders");
    logger.debug({ appId, reminderIds: ids }, "Deleting reminders");

    try {
      const db = await this.props.getDbConnection();
      const reminders = db.collection<Reminder>(REMINDERS_COLLECTION_NAME);

      await reminders.deleteMany({
        appId,
        _id: {
          $in: ids,
        },
      });

      logger.info(
        { appId, reminderIds: ids },
        "Successfully deleted reminders",
      );
    } catch (error: any) {
      logger.error(
        { appId, reminderIds: ids, error: error?.message || error?.toString() },
        "Error deleting reminders",
      );
      throw error;
    }
  }

  protected async checkUniqueName(
    appId: string,
    name: string,
    id?: string,
  ): Promise<boolean> {
    const logger = this.loggerFactory("checkUniqueName");
    logger.debug({ appId, name, reminderId: id }, "Checking unique name");

    try {
      const db = await this.props.getDbConnection();
      const reminders = db.collection<Reminder>(REMINDERS_COLLECTION_NAME);

      const filter: Filter<Reminder> = {
        name,
        appId,
      };

      if (id) {
        filter._id = {
          $ne: id,
        };
      }

      const result = reminders.aggregate([
        {
          $match: filter,
        },
      ]);
      const isUnique = !(await result.hasNext());

      logger.debug(
        { appId, name, reminderId: id, isUnique },
        "Name uniqueness check completed",
      );

      return isUnique;
    } catch (error: any) {
      logger.error(
        {
          appId,
          name,
          reminderId: id,
          error: error?.message || error?.toString(),
        },
        "Error checking unique name",
      );
      throw error;
    }
  }

  public async onTime(appData: ConnectedAppData, date: Date): Promise<void> {
    const logger = this.loggerFactory("onTime");
    logger.debug(
      { appId: appData._id, date: date.toISOString() },
      "Processing reminders for scheduled time",
    );

    try {
      const config = await this.props.services
        .ConfigurationService()
        .getConfigurations("booking", "general", "social");

      const phoneFields = (
        await this.props.services.ServicesService().getFields({
          type: ["phone"],
        })
      ).items;

      const timeZone = config.general.timeZone;
      const db = await this.props.getDbConnection();

      logger.debug(
        { appId: appData._id, timeZone },
        "Retrieving reminders for processing",
      );

      const reminders = await db
        .collection<Reminder>(REMINDERS_COLLECTION_NAME)
        .find({
          appId: appData._id,
        })
        .toArray();

      logger.debug(
        { appId: appData._id, reminderCount: reminders.length },
        "Found reminders to process",
      );

      const promises = (reminders || []).map(async (reminder) => {
        logger.debug(
          {
            appId: appData._id,
            reminderId: reminder._id,
            reminderName: reminder.name,
          },
          "Processing reminder",
        );

        const appointments = await this.getAppointments(
          date,
          reminder,
          timeZone,
        );
        const appointmentPromises = appointments.map((appointment) =>
          this.sendReminder(
            appData,
            appointment,
            reminder,
            config,
            phoneFields,
          ),
        );

        logger.debug(
          {
            appId: appData._id,
            reminderId: reminder._id,
            appointmentCount: appointments.length,
          },
          "Sending reminders for appointments",
        );

        return Promise.all(appointmentPromises);
      });

      await Promise.all(promises);

      logger.info(
        { appId: appData._id, reminderCount: reminders.length },
        "Successfully processed all reminders",
      );
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          date: date.toISOString(),
          error: error?.message || error?.toString(),
        },
        "Error processing reminders for scheduled time",
      );
      throw error;
    }
  }

  private async getAppointments(
    date: Date,
    reminder: Reminder,
    timeZone: string,
  ): Promise<Appointment[]> {
    const logger = this.loggerFactory("getAppointments");
    logger.debug(
      {
        reminderId: reminder._id,
        reminderName: reminder.name,
        type: reminder.type,
        date: date.toISOString(),
      },
      "Getting appointments for reminder",
    );

    try {
      const type = reminder.type;
      switch (type) {
        case "timeBefore": {
          const timeBeforeReminder = reminder as Reminder & {
            type: "timeBefore";
          };
          const startDate = DateTime.fromJSDate(date)
            .setZone(timeZone)
            .startOf("minute")
            .plus({
              days: timeBeforeReminder.days,
              weeks: timeBeforeReminder.weeks,
              hours: timeBeforeReminder.hours,
              minutes: timeBeforeReminder.minutes,
            });

          const endDate = startDate.plus({ minutes: 1, seconds: -1 });

          logger.debug(
            {
              reminderId: reminder._id,
              startDate: startDate.toISO(),
              endDate: endDate.toISO(),
            },
            "Searching for appointments with timeBefore reminder",
          );

          const appointments = await this.props.services
            .EventsService()
            .getAppointments({
              status: ["confirmed"],
              range: {
                start: startDate.toJSDate(),
                end: endDate.toJSDate(),
              },
            });

          logger.debug(
            { reminderId: reminder._id, appointmentCount: appointments.total },
            "Found appointments for timeBefore reminder",
          );

          return appointments.items;
        }

        case "atTime": {
          const atTimeReminder = reminder as Reminder & { type: "atTime" };
          const dt = DateTime.fromJSDate(date).setZone(timeZone);
          if (
            dt.hour !== atTimeReminder.time.hour ||
            dt.minute !== atTimeReminder.time.minute
          ) {
            logger.debug(
              {
                reminderId: reminder._id,
                currentTime: `${dt.hour}:${dt.minute}`,
                reminderTime: `${atTimeReminder.time.hour}:${atTimeReminder.time.minute}`,
              },
              "Current time doesn't match reminder time",
            );
            return [];
          }

          const startDate = dt
            .startOf("day")
            .plus({ days: atTimeReminder.days, weeks: atTimeReminder.weeks });

          const endDate = startDate.plus({ days: 1, seconds: -1 });

          logger.debug(
            {
              reminderId: reminder._id,
              startDate: startDate.toISO(),
              endDate: endDate.toISO(),
            },
            "Searching for appointments with atTime reminder",
          );

          const appointments = await this.props.services
            .EventsService()
            .getAppointments({
              status: ["confirmed"],
              range: {
                start: startDate.toJSDate(),
                end: endDate.toJSDate(),
              },
            });

          logger.debug(
            { reminderId: reminder._id, appointmentCount: appointments.total },
            "Found appointments for atTime reminder",
          );

          return appointments.items;
        }

        default: {
          logger.error(
            { reminderId: (reminder as any)._id, type },
            "Unknown reminder type",
          );
          return [];
        }
      }
    } catch (error: any) {
      logger.error(
        {
          reminderId: (reminder as any)._id,
          reminderName: reminder.name,
          error: error?.message || error?.toString(),
        },
        "Error getting appointments for reminder",
      );
      throw error;
    }
  }

  private async sendReminder(
    appData: ConnectedAppData,
    appointment: Appointment,
    reminder: Reminder,
    config: {
      general: GeneralConfiguration;
      booking: BookingConfiguration;
      social: SocialConfiguration;
    },
    phoneFields: ServiceField[],
  ): Promise<void> {
    const logger = this.loggerFactory("sendReminder");
    logger.debug(
      {
        appId: appData._id,
        reminderId: reminder._id,
        reminderName: reminder.name,
        channel: reminder.channel,
        appointmentId: appointment._id,
        customerId: appointment.customer._id,
      },
      "Sending reminder",
    );

    try {
      const args = getArguments({
        appointment,
        config,
        customer: appointment.customer,
        useAppointmentTimezone: true,
        locale: config.general.language,
      });

      const channel = reminder.channel;
      const template = await this.props.services
        .TemplatesService()
        .getTemplate(reminder.templateId);

      if (!template) {
        logger.warn(
          {
            appId: appData._id,
            reminderId: reminder._id,
            templateId: reminder.templateId,
          },
          "Template not found for reminder",
        );
        return;
      }

      logger.debug(
        {
          appId: appData._id,
          reminderId: reminder._id,
          channel,
          templateId: reminder.templateId,
        },
        "Template found, sending reminder",
      );

      switch (channel) {
        case "email":
          logger.debug(
            {
              appId: appData._id,
              reminderId: reminder._id,
              appointmentId: appointment._id,
              email: appointment.fields.email,
            },
            "Sending email reminder",
          );

          await this.props.services.NotificationService().sendEmail({
            email: {
              body: await renderToStaticMarkup({
                args: args,
                document: template.value,
              }),
              subject: templateSafeWithError(reminder.subject, args),
              to: appointment.fields.email,
            },
            participantType: "customer",
            handledBy: {
              key: `reminders.handler`,
              args: {
                reminderName: reminder.name,
              },
            },
            appointmentId: appointment._id,
          });

          logger.info(
            {
              appId: appData._id,
              reminderId: reminder._id,
              appointmentId: appointment._id,
            },
            "Successfully sent email reminder",
          );
          return;

        case "text-message":
          const phone =
            appointment.fields?.phone ??
            getPhoneField(appointment, phoneFields);

          if (!phone) {
            logger.warn(
              {
                appId: appData._id,
                reminderId: reminder._id,
                appointmentId: appointment._id,
              },
              "Phone number not found for text message reminder",
            );
            return;
          }

          logger.debug(
            {
              appId: appData._id,
              reminderId: reminder._id,
              appointmentId: appointment._id,
              phone,
            },
            "Sending text message reminder",
          );

          await this.props.services.NotificationService().sendTextMessage({
            phone,
            sender: config.general.name,
            body: templateSafeWithError(template.value, args),
            webhookData: {
              appointmentId: appointment._id,
              appId: appData._id,
            },
            participantType: "customer",
            handledBy: {
              key: `reminders.handler`,
              args: {
                reminderName: reminder.name,
              },
            },
            appointmentId: appointment._id,
          });

          logger.info(
            {
              appId: appData._id,
              reminderId: reminder._id,
              appointmentId: appointment._id,
            },
            "Successfully sent text message reminder",
          );
          return;

        default:
          logger.error(
            { appId: appData._id, reminderId: (reminder as any)._id, channel },
            "Unknown reminder channel type",
          );
          return;
      }
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          reminderId: reminder._id,
          appointmentId: appointment._id,
          error: error?.message || error?.toString(),
        },
        "Error sending reminder",
      );
      throw error;
    }
  }
}

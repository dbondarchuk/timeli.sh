import { renderToStaticMarkup } from "@vivid/email-builder/static";
import { getLoggerFactory } from "@vivid/logger";
import {
  Appointment,
  BookingConfiguration,
  ConnectedAppData,
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
  FollowUp,
  FollowUpUpdateModel,
  GetFollowUpsAction,
  RequestAction,
} from "./models";
import { FollowUpsAdminAllKeys } from "./translations/types";

const FOLLOW_UPS_COLLECTION_NAME = "follow-ups";

export default class FollowUpsConnectedApp
  implements IConnectedApp, IScheduled
{
  protected readonly loggerFactory = getLoggerFactory("FollowUpsConnectedApp");

  public constructor(protected readonly props: IConnectedAppProps) {}

  public async processRequest(
    appData: ConnectedAppData,
    data: RequestAction,
  ): Promise<any> {
    switch (data.type) {
      case "get-follow-up":
        return await this.getFollowUp(appData._id, data.id);

      case "get-follow-ups":
        return await this.getFollowUps(appData._id, data.query);

      case "delete-follow-ups":
        return await this.deleteFollowUps(appData._id, data.ids);

      case "create-follow-up":
        return await this.createFollowUp(appData._id, data.followUp);

      case "update-follow-up":
        return await this.updateFollowUp(appData._id, data.id, data.update);

      case "check-unique-follow-up-name":
        return await this.checkUniqueName(appData._id, data.name, data.id);

      default: {
        const defaultApps = await this.props.services
          .ConfigurationService()
          .getConfiguration("defaultApps");

        try {
          const emailAppId = defaultApps.email?.appId;
          await this.props.services.ConnectedAppsService().getApp(emailAppId!);
        } catch {
          return {
            status: "failed",
            statusText:
              "app_follow-ups_admin.statusText.email_app_not_configured" satisfies FollowUpsAdminAllKeys,
          };
        }

        const status: ConnectedAppStatusWithText = {
          status: "connected",
          statusText:
            "app_follow-ups_admin.statusText.successfully_set_up" satisfies FollowUpsAdminAllKeys,
        };

        this.props.update({
          data,
          ...status,
        });

        return status;
      }
    }
  }

  public async unInstall(appData: ConnectedAppData): Promise<void> {
    const logger = this.loggerFactory("unInstall");
    logger.debug({ appId: appData._id }, "Uninstalling follow-ups app");

    try {
      const db = await this.props.getDbConnection();
      const collection = db.collection<FollowUp>(FOLLOW_UPS_COLLECTION_NAME);
      await collection.deleteMany({
        appId: appData._id,
      });

      const count = await collection.countDocuments({});
      if (count === 0) {
        await db.dropCollection(FOLLOW_UPS_COLLECTION_NAME);
      }

      logger.info(
        { appId: appData._id },
        "Successfully uninstalled follow-ups app",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, error: error?.message || error?.toString() },
        "Error uninstalling follow-ups app",
      );
      throw error;
    }
  }

  protected async getFollowUp(appId: string, id: string) {
    const logger = this.loggerFactory("getFollowUp");
    logger.debug({ appId, followUpId: id }, "Getting follow-up");

    try {
      const db = await this.props.getDbConnection();
      const followUp = await db
        .collection<FollowUp>(FOLLOW_UPS_COLLECTION_NAME)
        .findOne({
          appId,
          _id: id,
        });

      logger.debug(
        { appId, followUpId: id, found: !!followUp },
        "Retrieved follow-up",
      );
      return followUp;
    } catch (error: any) {
      logger.error(
        { appId, followUpId: id, error: error?.message || error?.toString() },
        "Error getting follow-up",
      );
      throw error;
    }
  }

  protected async getFollowUps(
    appId: string,
    query: GetFollowUpsAction["query"],
  ): Promise<WithTotal<FollowUp>> {
    const logger = this.loggerFactory("getFollowUps");
    logger.debug({ appId, query }, "Getting follow-ups");

    try {
      const db = await this.props.getDbConnection();

      const sort: Sort = query.sort?.reduce(
        (prev, curr) => ({
          ...prev,
          [curr.id]: curr.desc ? -1 : 1,
        }),
        {},
      ) || { updatedAt: -1 };

      const filter: Filter<FollowUp> = {
        appId,
      };

      if (query.channel) {
        filter.channel = {
          $in: query.channel,
        };
      }

      if (query.search) {
        const $regex = new RegExp(escapeRegex(query.search), "i");
        const queries = buildSearchQuery<FollowUp>({ $regex }, "name");

        filter.$or = queries;
      }

      const [result] = await db
        .collection<FollowUp>(FOLLOW_UPS_COLLECTION_NAME)
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
        "Successfully retrieved follow-ups",
      );

      return {
        total,
        items,
      };
    } catch (error: any) {
      logger.error(
        { appId, query, error: error?.message || error?.toString() },
        "Error getting follow-ups",
      );
      throw error;
    }
  }

  protected async createFollowUp(
    appId: string,
    followUp: FollowUpUpdateModel,
  ): Promise<FollowUp> {
    const logger = this.loggerFactory("createFollowUp");
    logger.debug(
      {
        appId,
        followUpName: followUp.name,
        channel: followUp.channel,
        type: followUp.type,
      },
      "Creating follow-up",
    );

    try {
      const dbFollowUp: FollowUp = {
        ...followUp,
        appId,
        _id: new ObjectId().toString(),
        updatedAt: DateTime.utc().toJSDate(),
      };

      if (!this.checkUniqueName(appId, followUp.name)) {
        logger.error(
          { appId, followUpName: followUp.name },
          "Follow-up name already exists",
        );
        throw new Error("Name already exists");
      }

      const db = await this.props.getDbConnection();
      const followUps = db.collection<FollowUp>(FOLLOW_UPS_COLLECTION_NAME);

      await followUps.insertOne(dbFollowUp);

      logger.info(
        { appId, followUpId: dbFollowUp._id, followUpName: followUp.name },
        "Successfully created follow-up",
      );

      return dbFollowUp;
    } catch (error: any) {
      logger.error(
        {
          appId,
          followUpName: followUp.name,
          error: error?.message || error?.toString(),
        },
        "Error creating follow-up",
      );
      throw error;
    }
  }

  protected async updateFollowUp(
    appId: string,
    id: string,
    update: FollowUpUpdateModel,
  ): Promise<void> {
    const logger = this.loggerFactory("updateFollowUp");
    logger.debug(
      { appId, followUpId: id, followUpName: update.name },
      "Updating follow-up",
    );

    try {
      const db = await this.props.getDbConnection();
      const followUps = db.collection<FollowUp>(FOLLOW_UPS_COLLECTION_NAME);

      const { _id, ...updateObj } = update as FollowUp; // Remove fields in case it slips here

      if (!this.checkUniqueName(appId, update.name, id)) {
        logger.error(
          { appId, followUpId: id, followUpName: update.name },
          "Follow-up name already exists",
        );
        throw new Error("Name already exists");
      }

      updateObj.updatedAt = DateTime.utc().toJSDate();

      await followUps.updateOne(
        {
          _id: id,
        },
        {
          $set: updateObj,
        },
      );

      logger.info(
        { appId, followUpId: id, followUpName: update.name },
        "Successfully updated follow-up",
      );
    } catch (error: any) {
      logger.error(
        {
          appId,
          followUpId: id,
          followUpName: update.name,
          error: error?.message || error?.toString(),
        },
        "Error updating follow-up",
      );
      throw error;
    }
  }

  protected async deleteFollowUps(appId: string, ids: string[]): Promise<void> {
    const logger = this.loggerFactory("deleteFollowUps");
    logger.debug({ appId, followUpIds: ids }, "Deleting follow-ups");

    try {
      const db = await this.props.getDbConnection();
      const followUps = db.collection<FollowUp>(FOLLOW_UPS_COLLECTION_NAME);

      await followUps.deleteMany({
        appId,
        _id: {
          $in: ids,
        },
      });

      logger.info(
        { appId, followUpIds: ids },
        "Successfully deleted follow-ups",
      );
    } catch (error: any) {
      logger.error(
        { appId, followUpIds: ids, error: error?.message || error?.toString() },
        "Error deleting follow-ups",
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
    logger.debug({ appId, name, followUpId: id }, "Checking unique name");

    try {
      const db = await this.props.getDbConnection();
      const followUps = db.collection<FollowUp>(FOLLOW_UPS_COLLECTION_NAME);

      const filter: Filter<FollowUp> = {
        name,
        appId,
      };

      if (id) {
        filter._id = {
          $ne: id,
        };
      }

      const result = await followUps.countDocuments(filter);
      const isUnique = result === 0;

      logger.debug(
        { appId, name, followUpId: id, isUnique },
        "Name uniqueness check completed",
      );

      return isUnique;
    } catch (error: any) {
      logger.error(
        {
          appId,
          name,
          followUpId: id,
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
      "Processing follow-ups for scheduled time",
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
        "Retrieving follow-ups for processing",
      );

      const followUps = await db
        .collection<FollowUp>(FOLLOW_UPS_COLLECTION_NAME)
        .find({
          appId: appData._id,
        })
        .toArray();

      logger.debug(
        { appId: appData._id, followUpCount: followUps.length },
        "Found follow-ups to process",
      );

      const promises = (followUps || []).map(async (followUp) => {
        logger.debug(
          {
            appId: appData._id,
            followUpId: followUp._id,
            followUpName: followUp.name,
          },
          "Processing follow-up",
        );

        const appointments = await this.getAppointments(
          date,
          followUp,
          timeZone,
        );

        const appointmentPromises = appointments.map((appointment) =>
          this.sendFollowUp(
            appData,
            appointment,
            followUp,
            config,
            phoneFields,
          ),
        );

        logger.debug(
          {
            appId: appData._id,
            followUpId: followUp._id,
            appointmentCount: appointments.length,
          },
          "Sending follow-ups for appointments",
        );

        return Promise.all(appointmentPromises);
      });

      await Promise.all(promises);

      logger.info(
        { appId: appData._id, followUpCount: followUps.length },
        "Successfully processed all follow-ups",
      );
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          date: date.toISOString(),
          error: error?.message || error?.toString(),
        },
        "Error processing follow-ups for scheduled time",
      );
      throw error;
    }
  }

  private async getAppointments(
    date: Date,
    followUp: FollowUp,
    timeZone: string,
  ): Promise<Appointment[]> {
    const logger = this.loggerFactory("getAppointments");
    logger.debug(
      {
        followUpId: followUp._id,
        followUpName: followUp.name,
        type: followUp.type,
        afterAppointmentCount: followUp.afterAppointmentCount,
        date: date.toISOString(),
      },
      "Getting appointments for follow-up",
    );

    try {
      const type = followUp.type;
      let appointments: Appointment[] = [];

      switch (type) {
        case "timeAfter": {
          const timeAfterFollowUp = followUp as FollowUp & {
            type: "timeAfter";
          };
          const startDate = DateTime.fromJSDate(date)
            .setZone(timeZone)
            .startOf("minute")
            .minus({
              days: timeAfterFollowUp.days,
              weeks: timeAfterFollowUp.weeks,
              hours: timeAfterFollowUp.hours,
              minutes: timeAfterFollowUp.minutes,
            });

          const endDate = startDate.plus({ minutes: 1, seconds: -1 });

          logger.debug(
            {
              followUpId: followUp._id,
              startDate: startDate.toISO(),
              endDate: endDate.toISO(),
            },
            "Searching for appointments with timeAfter follow-up",
          );

          const appointmentsResponse = await this.props.services
            .EventsService()
            .getAppointments({
              status: ["confirmed"],
              endRange: {
                start: startDate.toJSDate(),
                end: endDate.toJSDate(),
              },
            });

          appointments = appointmentsResponse.items;

          logger.debug(
            {
              followUpId: followUp._id,
              appointmentCount: appointmentsResponse.total,
            },
            "Found appointments for timeAfter follow-up",
          );
          break;
        }

        case "atTime": {
          const atTimeFollowUp = followUp as FollowUp & { type: "atTime" };
          const dt = DateTime.fromJSDate(date).setZone(timeZone);
          if (
            dt.hour !== atTimeFollowUp.time.hour ||
            dt.minute !== atTimeFollowUp.time.minute
          ) {
            logger.debug(
              {
                followUpId: followUp._id,
                currentTime: `${dt.hour}:${dt.minute}`,
                followUpTime: `${atTimeFollowUp.time.hour}:${atTimeFollowUp.time.minute}`,
              },
              "Current time doesn't match follow-up time",
            );
            return [];
          }

          const startDate = dt
            .startOf("day")
            .minus({ days: atTimeFollowUp.days, weeks: atTimeFollowUp.weeks });

          const endDate = startDate.plus({ days: 1, seconds: -1 });

          logger.debug(
            {
              followUpId: followUp._id,
              startDate: startDate.toISO(),
              endDate: endDate.toISO(),
            },
            "Searching for appointments with atTime follow-up",
          );

          const appointmentsResponse = await this.props.services
            .EventsService()
            .getAppointments({
              status: ["confirmed"],
              endRange: {
                start: startDate.toJSDate(),
                end: endDate.toJSDate(),
              },
            });

          appointments = appointmentsResponse.items;

          logger.debug(
            {
              followUpId: followUp._id,
              appointmentCount: appointmentsResponse.total,
            },
            "Found appointments for atTime follow-up",
          );
          break;
        }

        default: {
          logger.error(
            { followUpId: (followUp as any)._id, type },
            "Unknown follow-up type",
          );
          return [];
        }
      }

      // Filter appointments based on afterAppointmentCount if specified
      if (followUp.afterAppointmentCount) {
        logger.debug(
          {
            followUpId: followUp._id,
            afterAppointmentCount: followUp.afterAppointmentCount,
            totalAppointments: appointments.length,
          },
          "Filtering appointments by customer appointment count",
        );

        const filteredAppointments: Appointment[] = [];

        for (const appointment of appointments) {
          try {
            // Calculate when this appointment was completed (appointment time + duration)
            const appointmentCompletionTime = DateTime.fromJSDate(
              appointment.dateTime,
            ).plus({ minutes: appointment.totalDuration, seconds: 1 });

            // Get all appointments for this customer that were completed before or at the same time as this appointment
            const customerAppointments = await this.props.services
              .EventsService()
              .getAppointments({
                customerId: appointment.customer._id,
                status: ["confirmed"],
                limit: 0,
                range: {
                  end: appointmentCompletionTime.toJSDate(),
                },
              });

            const appointmentCount = customerAppointments.total;

            logger.debug(
              {
                followUpId: followUp._id,
                customerId: appointment.customer._id,
                appointmentDateTime: appointment.dateTime.toISOString(),
                appointmentDuration: appointment.totalDuration,
                appointmentCompletionTime: appointmentCompletionTime.toISO(),
                appointmentCount,
                requiredCount: followUp.afterAppointmentCount,
              },
              "Checking customer appointment count up to appointment completion",
            );

            // Only send follow-up if customer has the exact required number of appointments completed up to this point
            if (appointmentCount == followUp.afterAppointmentCount) {
              filteredAppointments.push(appointment);
            }
          } catch (error: any) {
            logger.error(
              {
                followUpId: followUp._id,
                customerId: appointment.customer._id,
                error: error?.message || error?.toString(),
              },
              "Error checking customer appointment count",
            );
            // If we can't determine the count, skip this appointment
            continue;
          }
        }

        logger.debug(
          {
            followUpId: followUp._id,
            originalCount: appointments.length,
            filteredCount: filteredAppointments.length,
          },
          "Filtered appointments by appointment count",
        );

        return filteredAppointments;
      }

      return appointments;
    } catch (error: any) {
      logger.error(
        {
          followUpId: (followUp as any)._id,
          followUpName: followUp.name,
          error: error?.message || error?.toString(),
        },
        "Error getting appointments for follow-up",
      );
      throw error;
    }
  }

  private async sendFollowUp(
    appData: ConnectedAppData,
    appointment: Appointment,
    followUp: FollowUp,
    config: {
      general: GeneralConfiguration;
      booking: BookingConfiguration;
      social: SocialConfiguration;
    },
    phoneFields: ServiceField[],
  ): Promise<void> {
    const logger = this.loggerFactory("sendFollowUp");
    logger.debug(
      {
        appId: appData._id,
        followUpId: followUp._id,
        followUpName: followUp.name,
        channel: followUp.channel,
        appointmentId: appointment._id,
        customerId: appointment.customer._id,
      },
      "Sending follow-up",
    );

    try {
      const args = getArguments({
        appointment,
        config,
        customer: appointment.customer,
        useAppointmentTimezone: true,
        locale: config.general.language,
      });

      const channel = followUp.channel;
      const template = await this.props.services
        .TemplatesService()
        .getTemplate(followUp.templateId);

      if (!template) {
        logger.warn(
          {
            appId: appData._id,
            followUpId: followUp._id,
            templateId: followUp.templateId,
          },
          "Template not found for follow-up",
        );
        return;
      }

      logger.debug(
        {
          appId: appData._id,
          followUpId: followUp._id,
          channel,
          templateId: followUp.templateId,
        },
        "Template found, sending follow-up",
      );

      switch (channel) {
        case "email":
          logger.debug(
            {
              appId: appData._id,
              followUpId: followUp._id,
              appointmentId: appointment._id,
              email: appointment.fields.email,
            },
            "Sending email follow-up",
          );

          await this.props.services.NotificationService().sendEmail({
            email: {
              body: await renderToStaticMarkup({
                args: args,
                document: template.value,
              }),
              subject: templateSafeWithError(followUp.subject, args),
              to: appointment.fields.email,
            },
            participantType: "customer",
            handledBy: {
              key: `followUps.handler`,
              args: {
                followUpName: followUp.name,
              },
            },
            appointmentId: appointment._id,
          });

          logger.info(
            {
              appId: appData._id,
              followUpId: followUp._id,
              appointmentId: appointment._id,
            },
            "Successfully sent email follow-up",
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
                followUpId: followUp._id,
                appointmentId: appointment._id,
              },
              "Phone number not found for text message follow-up",
            );
            return;
          }

          logger.debug(
            {
              appId: appData._id,
              followUpId: followUp._id,
              appointmentId: appointment._id,
              phone,
            },
            "Sending text message follow-up",
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
              key: `followUps.handler`,
              args: {
                followUpName: followUp.name,
              },
            },
            appointmentId: appointment._id,
          });

          logger.info(
            {
              appId: appData._id,
              followUpId: followUp._id,
              appointmentId: appointment._id,
            },
            "Successfully sent text message follow-up",
          );
          return;

        default:
          logger.error(
            { appId: appData._id, followUpId: (followUp as any)._id, channel },
            "Unknown follow-up channel type",
          );
          return;
      }
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          followUpId: followUp._id,
          appointmentId: appointment._id,
          error: error?.message || error?.toString(),
        },
        "Error sending follow-up",
      );
      throw error;
    }
  }
}

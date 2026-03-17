module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        // 1. Rename collection scheduled-notifications -> appointment-notifications
        const hasScheduledNotificationsCollection = await db
          .listCollections({ name: "scheduled-notifications" })
          .hasNext();

        const hasAppointmentNotificationsCollection = await db
          .listCollections({ name: "appointment-notifications" })
          .hasNext();

        if (hasScheduledNotificationsCollection) {
          const scheduledNotifications = db.collection(
            "scheduled-notifications",
          );

          if (!hasAppointmentNotificationsCollection) {
            await scheduledNotifications.rename("appointment-notifications");
          } else {
            console.warn(
              "Both 'scheduled-notifications' and 'appointment-notifications' collections exist. Skipping collection rename to avoid data loss.",
            );
          }
        }

        // 2. Update connected-apps name and statusText
        const connectedApps = db.collection("connected-apps");

        await connectedApps.updateMany(
          { name: "scheduled-notifications" },
          {
            $set: {
              name: "appointment-notifications",
              statusText:
                "app_appointment-notifications_admin.statusText.successfully_set_up",
            },
          },
        );

        // 3. Update communication logs handledBy key and args
        const logs = db.collection("communication-logs");

        await logs.updateMany(
          {
            "handledBy.key":
              "app_scheduled-notifications_admin.handler",
          },
          [
            {
              $set: {
                "handledBy.key":
                  "app_appointment-notifications_admin.handler",
                "handledBy.args.appointmentNotificationName": {
                  $ifNull: [
                    "$handledBy.args.scheduledNotificationName",
                    "$handledBy.args.appointmentNotificationName",
                  ],
                },
              },
            },
            {
              $unset: ["handledBy.args.scheduledNotificationName"],
            },
          ],
        );
      });
    } finally {
      await session.endSession();
    }
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        // 1. Rename collection appointment-notifications -> scheduled-notifications
        const hasAppointmentNotificationsCollection = await db
          .listCollections({ name: "appointment-notifications" })
          .hasNext();

        const hasScheduledNotificationsCollection = await db
          .listCollections({ name: "scheduled-notifications" })
          .hasNext();

        if (hasAppointmentNotificationsCollection) {
          const appointmentNotifications = db.collection(
            "appointment-notifications",
          );

          if (!hasScheduledNotificationsCollection) {
            await appointmentNotifications.rename("scheduled-notifications");
          } else {
            console.warn(
              "Both 'appointment-notifications' and 'scheduled-notifications' collections exist. Skipping collection rename to avoid data loss.",
            );
          }
        }

        // 2. Revert connected-apps name and statusText
        const connectedApps = db.collection("connected-apps");

        await connectedApps.updateMany(
          { name: "appointment-notifications" },
          {
            $set: {
              name: "scheduled-notifications",
              statusText:
                "app_scheduled-notifications_admin.statusText.successfully_set_up",
            },
          },
        );

        // 3. Revert communication logs handledBy key and args
        const logs = db.collection("communication-logs");

        await logs.updateMany(
          {
            "handledBy.key":
              "app_appointment-notifications_admin.handler",
          },
          [
            {
              $set: {
                "handledBy.key":
                  "app_scheduled-notifications_admin.handler",
                "handledBy.args.scheduledNotificationName": {
                  $ifNull: [
                    "$handledBy.args.appointmentNotificationName",
                    "$handledBy.args.scheduledNotificationName",
                  ],
                },
              },
            },
            {
              $unset: ["handledBy.args.appointmentNotificationName"],
            },
          ],
        );
      });
    } finally {
      await session.endSession();
    }
  },
};

const { ObjectId } = require("mongodb");

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
        if (
          !(await db
            .listCollections({
              name: "reminders",
            })
            .hasNext())
        ) {
          console.log("Creating reminders collection");
          await db.createCollection("reminders");
        }

        if (
          !(await db
            .listCollections({
              name: "follow-ups",
            })
            .hasNext())
        ) {
          console.log("Creating follow-ups collection");
          await db.createCollection("follow-ups");
        }

        const reminders = db.collection("reminders");

        const followups = db.collection("follow-ups");
        const connectedApps = db.collection("connected-apps");

        let reminderAppId = (
          await connectedApps.findOne({
            name: "reminders",
            status: "connected",
          })
        )?._id;

        if (!reminderAppId) {
          console.warn("Reminder app not found");
          reminderAppId = new ObjectId().toString();
          await connectedApps.insertOne({
            name: "reminders",
            _id: reminderAppId,
            status: "connected",
            statusText: "app_reminders_admin.statusText.successfully_set_up",
          });
        }

        // Step 1: Rename reminders collection items with type "atTime" to "atTimeBefore"
        await reminders.updateMany(
          { type: "atTime" },
          { $set: { type: "atTimeBefore" } },
        );

        // Step 2: Copy followups to reminders collection and set type "atTime" to "atTimeAfter"
        const followupDocs = await followups.find({}).toArray();
        if (followupDocs.length > 0) {
          const transformedFollowups = followupDocs.map((doc) => ({
            ...doc,
            appId: reminderAppId,
            type: doc.type === "atTime" ? "atTimeAfter" : doc.type,
          }));
          await reminders.insertMany(transformedFollowups);
        }

        // Step 3: Remove followups collection
        await followups.drop();

        // Step 4: Rename reminders collection to scheduled-notifications
        await reminders.rename("scheduled-notifications");

        // Step 5: Update connected apps - rename reminders apps to scheduled-notifications
        await connectedApps.updateMany(
          { name: "reminders" },
          {
            $set: {
              name: "scheduled-notifications",
              status: "connected",
              statusText:
                "app_scheduled-notifications_admin.statusText.successfully_set_up",
            },
          },
        );

        // Step 6: Remove connected apps with name follow-ups
        await connectedApps.deleteMany({ name: "follow-ups" });
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
        if (
          !(await db
            .listCollections({
              name: "scheduled-notifications",
            })
            .hasNext())
        ) {
          console.log("Creating scheduled-notifications collection");
          await db.createCollection("scheduled-notifications");
        }

        const connectedApps = db.collection("connected-apps");

        // Step 1: Rename notifications collection back to reminders
        await notifications.rename("reminders");
        const reminders = db.collection("reminders");

        // Step 2: Create followups collection
        const followups = db.collection("follow-ups");

        // Step 3: Copy items with type "atTimeAfter" or "timeAfter" back to followups collection
        const followupDocs = await reminders
          .find({ type: { $in: ["atTimeAfter", "timeAfter"] } })
          .toArray();
        if (followupDocs.length > 0) {
          // Step 3.1: Recreate connected apps with name follow-ups
          const followupAppId = new ObjectId().toString();
          await connectedApps.insertOne({
            name: "follow-ups",
            _id: followupAppId,
            status: "connected",
            statusText: "app_follow-ups_admin.statusText.successfully_set_up",
          });

          const transformedFollowups = followupDocs.map((doc) => ({
            ...doc,
            appId: followupAppId,
            type: doc.type === "atTimeAfter" ? "atTime" : doc.type, // Convert back to original type
          }));

          await followups.insertMany(transformedFollowups);
        }

        // Step 4: Remove items with type "atTimeAfter" from reminders collection
        await reminders.deleteMany({ type: "atTimeAfter" });

        // Step 5: Rename reminders collection items with type "atTimeBefore" back to "atTime"
        await reminders.updateMany(
          { type: "atTimeBefore" },
          { $set: { type: "atTime" } },
        );

        // Step 6: Restore connected apps - rename scheduled-notifications apps back to reminders
        await connectedApps.updateMany(
          { name: "scheduled-notifications" },
          {
            $set: {
              name: "reminders",
              status: "connected",
              statusText: "app_reminders_admin.statusText.successfully_set_up",
            },
          },
        );
      });
    } finally {
      await session.endSession();
    }
  },
};

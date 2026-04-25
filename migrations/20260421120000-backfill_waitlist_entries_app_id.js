const WAITLIST_APP_NAME = "waitlist";

function missingAppIdFilter() {
  return {
    $or: [
      { appId: { $exists: false } },
      { appId: null },
      { appId: "" },
    ],
  };
}

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db) {
    const waitlist = db.collection("waitlist");
    const connectedApps = db.collection("connected-apps");

    const orgIds = await waitlist.distinct("organizationId", {
      $and: [
        { organizationId: { $exists: true, $ne: null } },
        { organizationId: { $ne: "" } },
        missingAppIdFilter(),
      ],
    });

    if (!orgIds.length) {
      console.log(
        "No waitlist entries missing appId; nothing to backfill.",
      );
      return;
    }

    let updated = 0;
    let skippedNoApp = 0;

    for (const organizationId of orgIds) {
      const app = await connectedApps.findOne(
        { organizationId, name: WAITLIST_APP_NAME },
        { projection: { _id: 1 } },
      );

      if (!app?._id) {
        console.warn(
          { organizationId },
          "No connected waitlist app for organization; skipping entries.",
        );
        skippedNoApp += await waitlist.countDocuments({
          organizationId,
          ...missingAppIdFilter(),
        });
        continue;
      }

      const appId =
        typeof app._id === "string" ? app._id : String(app._id);

      const result = await waitlist.updateMany(
        {
          organizationId,
          ...missingAppIdFilter(),
        },
        { $set: { appId } },
      );

      updated += result.modifiedCount;
    }

    console.log(
      `Backfilled appId on ${updated} waitlist document(s). Orgs without waitlist app (entries still missing appId): ${skippedNoApp}`,
    );
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db) {
    const waitlist = db.collection("waitlist");
    const connectedApps = db.collection("connected-apps");

    const orgIds = await waitlist.distinct("organizationId", {
      $and: [
        { organizationId: { $exists: true, $ne: null } },
        { organizationId: { $ne: "" } },
        { appId: { $exists: true, $nin: [null, ""] } },
      ],
    });

    let reverted = 0;

    for (const organizationId of orgIds) {
      const app = await connectedApps.findOne(
        { organizationId, name: WAITLIST_APP_NAME },
        { projection: { _id: 1 } },
      );

      if (!app?._id) {
        continue;
      }

      const appId =
        typeof app._id === "string" ? app._id : String(app._id);

      const result = await waitlist.updateMany(
        { organizationId, appId },
        { $unset: { appId: "" } },
      );
      reverted += result.modifiedCount;
    }

    console.log(
      `Removed appId from ${reverted} waitlist document(s) tied to the org waitlist connected app.`,
    );
  },
};

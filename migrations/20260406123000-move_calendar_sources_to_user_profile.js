module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const configurationCollection = db.collection("configuration");
    const usersCollection = db.collection("users");

    const cursor = configurationCollection.find({
      key: "booking",
      "value.calendarSources.0": { $exists: true },
    });

    // Move calendarSources from configuration.booking to users.calendarSources
    // for the organization admin/owner user.
    // eslint-disable-next-line no-constant-condition
    while (await cursor.hasNext()) {
      const bookingConfig = await cursor.next();
      if (!bookingConfig) continue;

      const companyId = bookingConfig.companyId;
      const bookingSources = Array.isArray(bookingConfig.value?.calendarSources)
        ? bookingConfig.value.calendarSources
        : [];

      if (!companyId || bookingSources.length === 0) {
        continue;
      }

      let targetUser = await usersCollection.findOne(
        {
          organizationId: companyId,
          role: { $in: ["owner", "admin"] },
        },
        {
          sort: { createdAt: 1 },
        },
      );

      if (!targetUser) {
        targetUser = await usersCollection.findOne(
          { organizationId: companyId },
          { sort: { createdAt: 1 } },
        );
      }

      if (!targetUser) {
        continue;
      }

      const existingSources = Array.isArray(targetUser.calendarSources)
        ? targetUser.calendarSources
        : [];

      const mergedByAppId = new Map();
      for (const source of [...existingSources, ...bookingSources]) {
        const appId = source?.appId;
        if (!appId || typeof appId !== "string") continue;
        mergedByAppId.set(appId, { appId });
      }

      const mergedSources = Array.from(mergedByAppId.values());

      await usersCollection.updateOne(
        { _id: targetUser._id },
        {
          $set: {
            calendarSources: mergedSources,
          },
        },
      );

      await configurationCollection.updateOne(
        { _id: bookingConfig._id },
        {
          $unset: {
            "value.calendarSources": "",
          },
        },
      );
    }
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    const configurationCollection = db.collection("configuration");
    const usersCollection = db.collection("users");

    const cursor = usersCollection.find({
      "calendarSources.0": { $exists: true },
      organizationId: { $exists: true },
    });

    // Best-effort rollback:
    // copy users.calendarSources back to booking configuration and remove from user.
    // eslint-disable-next-line no-constant-condition
    while (await cursor.hasNext()) {
      const user = await cursor.next();
      if (!user) continue;

      const companyId = user.organizationId;
      const userSources = Array.isArray(user.calendarSources)
        ? user.calendarSources
        : [];

      if (!companyId || userSources.length === 0) {
        continue;
      }

      await configurationCollection.updateOne(
        { key: "booking", companyId },
        {
          $set: {
            "value.calendarSources": userSources
              .map((source) =>
                source?.appId && typeof source.appId === "string"
                  ? { appId: source.appId }
                  : null,
              )
              .filter(Boolean),
          },
        },
      );

      await usersCollection.updateOne(
        { _id: user._id },
        {
          $unset: {
            calendarSources: "",
          },
        },
      );
    }
  },
};

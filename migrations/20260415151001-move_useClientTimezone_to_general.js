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
        const configuration = db.collection("configuration");

        const cursor = configuration.find({ key: "booking" });
        // eslint-disable-next-line no-constant-condition
        while (await cursor.hasNext()) {
          const doc = await cursor.next();
          if (!doc?.organizationId) continue;
          const useClientTimezone = doc?.value?.useClientTimezone;
          if (typeof useClientTimezone !== "boolean") continue;

          await configuration.updateOne(
            { key: "general", organizationId: doc.organizationId },
            { $set: { "value.useClientTimezone": useClientTimezone } },
          );
        }
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
        const configuration = db.collection("configuration");

        const cursor = configuration.find({ key: "general" });
        // eslint-disable-next-line no-constant-condition
        while (await cursor.hasNext()) {
          const doc = await cursor.next();
          if (!doc?.organizationId) continue;
          const useClientTimezone = doc?.value?.useClientTimezone;
          if (typeof useClientTimezone !== "boolean") continue;

          await configuration.updateOne(
            { key: "booking", organizationId: doc.organizationId },
            { $set: { "value.useClientTimezone": useClientTimezone } },
          );
        }
      });
    } finally {
      await session.endSession();
    }
  },
};

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

        // Set defaults only when missing (or explicitly null/empty).
        await configuration.updateMany(
          {
            key: "general",
            $or: [
              { "value.country": { $exists: false } },
              { "value.country": null },
              { "value.country": "" },
            ],
          },
          { $set: { "value.country": "US" } },
        );

        await configuration.updateMany(
          {
            key: "general",
            $or: [
              { "value.currency": { $exists: false } },
              { "value.currency": null },
              { "value.currency": "" },
            ],
          },
          { $set: { "value.currency": "USD" } },
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
        const configuration = db.collection("configuration");

        // Best-effort rollback: unset only if values still match defaults.
        await configuration.updateMany(
          { key: "general", "value.country": "US" },
          { $unset: { "value.country": "" } },
        );
        await configuration.updateMany(
          { key: "general", "value.currency": "USD" },
          { $unset: { "value.currency": "" } },
        );
      });
    } finally {
      await session.endSession();
    }
  },
};


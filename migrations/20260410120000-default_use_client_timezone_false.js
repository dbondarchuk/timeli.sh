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

        await configuration.updateMany(
          {
            key: "booking",
            $or: [
              { "value.useClientTimezone": { $exists: false } },
              { "value.useClientTimezone": null },
            ],
          },
          { $set: { "value.useClientTimezone": false } },
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

        // Remove explicit false so config matches pre-migration shape (optional / absent).
        await configuration.updateMany(
          { key: "booking", "value.useClientTimezone": false },
          { $unset: { "value.useClientTimezone": "" } },
        );
      });
    } finally {
      await session.endSession();
    }
  },
};

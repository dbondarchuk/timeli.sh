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
        const syncedPayments = await db.createCollection("synced-payments");

        // Dedup guard: a provider transaction is ingested at most once per org.
        await syncedPayments.createIndex(
          {
            organizationId: -1,
            externalId: -1,
          },
          { name: "organizationId_externalId", unique: true }
        );

        await syncedPayments.createIndex(
          {
            organizationId: -1,
            status: -1,
          },
          { name: "organizationId_status" }
        );

        await syncedPayments.createIndex(
          {
            appointmentId: -1,
          },
          { name: "appointmentId" }
        );

        await syncedPayments.createIndex(
          {
            appId: -1,
          },
          { name: "appId" }
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
        await db.dropCollection("synced-payments");
      });
    } finally {
      await session.endSession();
    }
  },
};

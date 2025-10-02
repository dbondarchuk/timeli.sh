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
        const payments = db.collection("payments");
        payments.updateMany({}, [
          {
            $set: {
              method: "$type",
            },
          },
          {
            $set: {
              type: "deposit",
            },
          },
        ]);

        const paymentIntents = db.collection("payment-intents");
        paymentIntents.updateMany(
          {},
          {
            $set: {
              type: "deposit",
            },
          },
        );

        const config = db.collection("configuration");
        config.updateMany(
          {
            key: "booking",
          },
          [
            {
              $set: { "value.payments.enabled": "$value.payments.enable" },
            },
            { $unset: "value.payments.enable" },
          ],
        );

        await payments.createIndex(
          {
            method: -1,
          },
          {
            name: "method",
          },
        );
        await payments.createIndex(
          {
            type: -1,
          },
          {
            name: "type",
          },
        );

        await paymentIntents.createIndex(
          {
            type: -1,
          },
          {
            name: "type",
          },
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
        const payments = db.collection("payments");
        payments.updateMany({}, [
          {
            $set: {
              type: "$method",
            },
          },
          {
            $unset: "method",
          },
        ]);

        const paymentIntents = db.collection("payment-intents");
        paymentIntents.updateMany({}, [
          {
            $unset: "type",
          },
        ]);

        const config = db.collection("configuration");
        config.updateMany(
          {
            key: "booking",
          },
          [
            { $set: { "value.payments.enable": "$value.payments.enabled" } },
            { $unset: "value.payments.enabled" },
          ],
        );

        await payments.dropIndex("method");
        await paymentIntents.dropIndex("type");
      });
    } finally {
      await session.endSession();
    }
  },
};

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const configurationCollection = db.collection("configuration");

    const cursor = configurationCollection.find({
      key: "booking",
      "value.payments.paymentAppId": { $exists: true },
    });

    // Move paymentAppId from configuration.booking.payments to configuration.defaultApps
    // and remove it from the booking configuration.
    // eslint-disable-next-line no-constant-condition
    while (await cursor.hasNext()) {
      const bookingConfig = await cursor.next();

      if (!bookingConfig) {
        continue;
      }

      const companyId = bookingConfig.companyId;
      const paymentAppId =
        bookingConfig.value?.payments?.paymentAppId ?? null;

      if (!companyId || !paymentAppId) {
        continue;
      }

      await configurationCollection.updateOne(
        {
          key: "defaultApps",
          companyId,
        },
        {
          $set: {
            "value.paymentAppId": paymentAppId,
          },
          $setOnInsert: {
            key: "defaultApps",
            companyId,
          },
        },
        {
          upsert: true,
        },
      );

      await configurationCollection.updateOne(
        {
          _id: bookingConfig._id,
        },
        {
          $unset: {
            "value.payments.paymentAppId": "",
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

    const cursor = configurationCollection.find({
      key: "defaultApps",
      "value.paymentAppId": { $exists: true },
    });

    // Best-effort rollback: copy paymentAppId back to booking.payments
    // and remove it from defaultApps configuration.
    // eslint-disable-next-line no-constant-condition
    while (await cursor.hasNext()) {
      const defaultAppsConfig = await cursor.next();

      if (!defaultAppsConfig) {
        continue;
      }

      const companyId = defaultAppsConfig.companyId;
      const paymentAppId = defaultAppsConfig.value?.paymentAppId ?? null;

      if (!companyId || !paymentAppId) {
        continue;
      }

      await configurationCollection.updateOne(
        {
          key: "booking",
          companyId,
        },
        {
          $set: {
            "value.payments.paymentAppId": paymentAppId,
          },
        },
        {
          upsert: false,
        },
      );

      await configurationCollection.updateOne(
        {
          _id: defaultAppsConfig._id,
        },
        {
          $unset: {
            "value.paymentAppId": "",
          },
        },
      );
    }
  }
};

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    const configurations = db.collection("configuration");
    const result = await configurations.updateMany(
      {
        key: "booking",
        "value.cancellationsAndReschedules.cancellations.enabled": {
          $exists: true,
        },
      },
      [
        {
          $set: {
            "value.cancellationsAndReschedules.cancellations": {
              $mergeObjects: [
                {}, // start from empty to ensure old fields are dropped
                {
                  withDeposit:
                    "$value.cancellationsAndReschedules.cancellations",
                },
              ],
            },
          },
        },
        {
          $set: {
            "value.cancellationsAndReschedules.cancellations.withDeposit": {
              enabled: true,
            },
          },
        },
        {
          $set: {
            "value.cancellationsAndReschedules.cancellations.withoutDeposit": {
              enabled: false,
            },
          },
        },
      ],
    );

    console.log(`Updated ${result.modifiedCount} configurations`);
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    const configurations = db.collection("configuration");
    const result = await configurations.updateMany(
      {
        key: "booking",
        "value.cancellationsAndReschedules.cancellations.withDeposit": {
          $exists: true,
        },
      },
      [
        {
          $set: {
            "value.cancellationsAndReschedules.cancellations":
              "$value.cancellationsAndReschedules.cancellations.withDeposit",
          },
        },
        {
          $unset: "value.cancellationsAndReschedules.cancellations.withDeposit",
        },
        {
          $unset:
            "value.cancellationsAndReschedules.cancellations.withoutDeposit",
        },
        {
          $set: {
            "value.cancellationsAndReschedules.cancellations": {
              enabled: "notAllowedWithoutDeposit",
            },
          },
        },
      ],
    );

    console.log(`Updated ${result.modifiedCount} configurations`);
  },
};

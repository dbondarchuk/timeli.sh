const indexes = {
  user_id_1: {
    userId: 1,
  },
  company_id_user_id_1: {
    companyId: 1,
    userId: 1,
  },
  company_id_user_id_name_1: {
    companyId: 1,
    userId: 1,
    name: 1,
  },
};

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const connectedAppsCollection = db.collection("connected-apps");
    const usersCollection = db.collection("users");
    const BULK_BATCH_SIZE = 500;

    console.log("Adding userId to connected apps");

    const companyUserMap = await usersCollection
      .aggregate([
        {
          $match: {
            organizationId: { $exists: true, $ne: null },
          },
        },
        {
          $sort: {
            organizationId: 1,
            createdAt: 1,
            _id: 1,
          },
        },
        {
          $group: {
            _id: "$organizationId",
            userId: { $first: "$_id" },
          },
        },
        {
          $project: {
            _id: 0,
            companyId: "$_id",
            userId: 1,
          },
        },
      ])
      .toArray();

    if (!companyUserMap.length) {
      console.log("No users found for company mapping. Skipping backfill.");
      return;
    }

    const operations = companyUserMap.map(({ companyId, userId }) => ({
      updateMany: {
        filter: {
          companyId,
          userId: { $exists: false },
        },
        update: {
          $set: {
            userId: userId.toString(),
          },
        },
      },
    }));

    let updateCount = 0;
    for (let i = 0; i < operations.length; i += BULK_BATCH_SIZE) {
      const batch = operations.slice(i, i + BULK_BATCH_SIZE);
      const result = await connectedAppsCollection.bulkWrite(batch, {
        ordered: false,
      });
      updateCount += result.modifiedCount;
    }

    console.log(
      `Added userId to ${updateCount} connected apps. Adding indexes...`,
    );

    for (const [indexName, index] of Object.entries(indexes)) {
      console.log(`Checking if index ${indexName} exists`);
      if (await connectedAppsCollection.indexExists(indexName)) {
        console.log(`Index ${indexName} already exists`);
        continue;
      }

      console.log(`Creating index ${indexName}`);
      await connectedAppsCollection.createIndex(index, { name: indexName });
      console.log(`Index ${indexName} created`);
    }

    console.log("Indexes added successfully");

    console.log("Migration completed successfully");
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    const connectedAppsCollection = db.collection("connected-apps");

    console.log("Removing userId from connected apps");
    const result = await connectedAppsCollection.updateMany(
      {
        userId: { $exists: true },
      },
      {
        $unset: {
          userId: "",
        },
      },
    );

    console.log(
      `Removed userId from ${result.modifiedCount} connected apps. Dropping indexes...`,
    );

    for (const [indexName, index] of Object.entries(indexes)) {
      console.log(`Checking if index ${indexName} exists`);
      if (!(await connectedAppsCollection.indexExists(indexName))) {
        console.log(`Index ${indexName} does not exist`);
        continue;
      }

      console.log(`Dropping index ${indexName}`);
      await connectedAppsCollection.dropIndex(indexName);
      console.log(`Index ${indexName} dropped`);
    }
  },
};

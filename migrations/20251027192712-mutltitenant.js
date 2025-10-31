const { ObjectId } = require("mongodb");

/**
 * Migration to convert single-tenant database to multi-company
 * This script will:
 * 1. Create a default company
 * 2. Create default admin user
 * 3. Add companyId to all existing documents
 * 4. Create indexes for performance
 */

module.exports = {
  async up(db) {
    console.log("Starting multi-company migration...");

    // 4. Add companyId to all collections
    const collections = [
      "customers",
      "appointments",
      "appointments-history",
      "configuration",
      "fields",
      "addons",
      "options",
      "discounts",
      "assets",
      "payment-intents",
      "payments",
      "connected-apps",
      "pages",
      "page-headers",
      "page-footers",
      "templates",
      "communication-logs",
      "waitlist",
      "scheduled-notifications",
    ];

    const organization = await db.collection("organizations").findOne({});
    if (organization) {
      console.log("Default organization already exists");

      const companyId = organization._id.toString();

      console.log(`Found default organization with ID: ${companyId}`);

      for (const collectionName of collections) {
        const collection = db.collection(collectionName);

        // Check if collection exists and has documents
        const exists = await db
          .listCollections({ name: collectionName })
          .hasNext();
        if (!exists) {
          console.log(`Skipping non-existent collection: ${collectionName}`);
          continue;
        }

        const result = await collection.updateMany({}, { $set: { companyId } });
        console.log(
          `Updated ${result.modifiedCount} documents in ${collectionName}`,
        );

        // Create index for performance
        const indexExists = await collection.indexExists("companyId_1");
        if (!indexExists) {
          await collection.createIndex(
            { companyId: 1 },
            { name: "companyId_1" },
          );
          console.log(`Created companyId index on ${collectionName}`);
        }
      }
    } else {
      for (const collectionName of collections) {
        // Create index for performance
        const indexExists = await collection.indexExists("companyId_1");
        if (!indexExists) {
          await collection.createIndex(
            { companyId: 1 },
            { name: "companyId_1" },
          );
          console.log(`Created companyId index on ${collectionName}`);
        }
      }
    }

    // 5. Create composite indexes for better performance
    console.log("Creating composite indexes...");

    const compositeIndexes = [
      { collection: "customers", index: { companyId: 1, email: 1 } },
      { collection: "customers", index: { companyId: 1, phone: 1 } },
      { collection: "appointments", index: { companyId: 1, dateTime: -1 } },
      { collection: "appointments", index: { companyId: 1, customerId: 1 } },
      { collection: "appointments", index: { companyId: 1, status: 1 } },
      { collection: "configuration", index: { companyId: 1, key: 1 } },
    ];

    for (const { collection: name, index } of compositeIndexes) {
      const collection = db.collection(name);
      const indexName = Object.keys(index).join("_");

      const exists = await collection.indexExists(indexName);
      if (!exists) {
        await collection.createIndex(index);
        console.log(`Created composite index on ${name}`);
      }
    }

    console.log("Multi-company migration completed successfully!");
  },

  async down(db) {
    console.log("Rolling back multi-company migration...");

    // Remove companyId from all collections
    const collections = [
      "customers",
      "appointments",
      "appointments-history",
      "configuration",
      "fields",
      "addons",
      "options",
      "discounts",
      "assets",
      "payment-intents",
      "payments",
      "connected-apps",
      "pages",
      "page-headers",
      "page-footers",
      "templates",
      "communication-logs",
      "waitlist",
      "scheduled-notifications",
    ];

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const exists = await db
        .listCollections({ name: collectionName })
        .hasNext();

      if (exists) {
        const result = await collection.updateMany(
          {},
          { $unset: { companyId: "" } },
        );

        console.log(
          `Removed companyId from ${result.modifiedCount} documents in ${collectionName}`,
        );

        const indexExists = await collection.indexExists("companyId_1");
        if (indexExists) {
          await collection.dropIndex("companyId_1");
          console.log(`Dropped companyId index on ${collectionName}`);
        }
      }
    }

    // Delete users
    // await db.collection("users").drop();
    // console.log("Deleted users");

    // // Delete company
    // await db.collection("organizations").drop();
    // console.log("Deleted organizations");

    // await db.collection("accounts").drop();
    // console.log("Deleted accounts");

    // await db.collection("sessions").drop();
    // console.log("Deleted sessions");

    console.log("Rollback completed");
  },
};

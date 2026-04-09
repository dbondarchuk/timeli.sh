module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const organizations = db.collection("organizations");
    const configuration = db.collection("configuration");

    const cursor = configuration.find({ key: "brand" });
    // eslint-disable-next-line no-constant-condition
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      if (!doc?.companyId) continue;
      const rawDomain = doc?.value?.domain;
      if (typeof rawDomain !== "string") continue;
      const domain = rawDomain.trim().toLowerCase();
      if (!domain) continue;

      await organizations.updateOne(
        { _id: doc.companyId, domain: { $exists: false } },
        { $set: { domain } },
      );
    }
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    const organizations = db.collection("organizations");
    const configuration = db.collection("configuration");

    const cursor = organizations.find({ domain: { $exists: true } });
    // eslint-disable-next-line no-constant-condition
    while (await cursor.hasNext()) {
      const org = await cursor.next();
      if (!org?._id) continue;
      const rawDomain = org.domain;
      if (typeof rawDomain !== "string") continue;
      const domain = rawDomain.trim().toLowerCase();
      if (!domain) continue;

      await configuration.updateOne(
        { key: "brand", companyId: org._id },
        { $set: { "value.domain": domain } },
      );
    }
  },
};

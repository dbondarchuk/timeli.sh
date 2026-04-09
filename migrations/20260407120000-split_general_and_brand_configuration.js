module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const configurationCollection = db.collection("configuration");

    const cursor = configurationCollection.find({
      key: "general",
    });

    // eslint-disable-next-line no-constant-condition
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      if (!doc?.value || typeof doc.value !== "object") continue;

      const v = doc.value;
      const companyId = doc.companyId;
      if (!companyId) continue;

      const hasLegacyBrandFields =
        "title" in v ||
        "description" in v ||
        "keywords" in v ||
        "language" in v;

      if (!hasLegacyBrandFields) {
        continue;
      }

      const brandValue = {
        title: typeof v.title === "string" ? v.title : v.name,
        description:
          typeof v.description === "string"
            ? v.description
            : `${v.name || "Site"} — Book online.`,
        keywords:
          typeof v.keywords === "string"
            ? v.keywords
            : `${v.name || "Site"}, booking`,
        domain: v.domain,
        logo: v.logo,
        favicon: v.favicon,
        language: v.language ?? "en",
      };

      const generalValue = {
        name: v.name,
        phone: v.phone,
        email: v.email,
        address: v.address,
        country: v.country,
        currency: v.currency,
        timeZone: v.timeZone,
      };

      await configurationCollection.updateOne(
        { key: "brand", companyId },
        {
          $set: {
            key: "brand",
            companyId,
            value: brandValue,
          },
        },
        { upsert: true },
      );

      await configurationCollection.updateOne(
        { _id: doc._id },
        {
          $set: {
            value: generalValue,
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
      key: "brand",
    });

    // eslint-disable-next-line no-constant-condition
    while (await cursor.hasNext()) {
      const brandDoc = await cursor.next();
      if (!brandDoc?.value || typeof brandDoc.value !== "object") continue;

      const companyId = brandDoc.companyId;
      if (!companyId) continue;

      const generalDoc = await configurationCollection.findOne({
        key: "general",
        companyId,
      });
      if (!generalDoc?.value) continue;

      const g = generalDoc.value;
      const b = brandDoc.value;

      const merged = {
        ...g,
        title: b.title,
        description: b.description,
        keywords: b.keywords,
        domain: b.domain,
        logo: b.logo,
        favicon: b.favicon,
        language: b.language,
      };

      await configurationCollection.updateOne(
        { _id: generalDoc._id },
        { $set: { value: merged } },
      );

      await configurationCollection.deleteOne({
        key: "brand",
        companyId,
      });
    }
  },
};

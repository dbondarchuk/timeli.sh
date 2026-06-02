const BLOG_COMMENTS_COLLECTION_NAME = "blog-comments";

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @returns {Promise<void>}
   */
  async up(db) {
    const collections = await db
      .listCollections({ name: BLOG_COMMENTS_COLLECTION_NAME })
      .toArray();

    const collection =
      collections.length > 0
        ? db.collection(BLOG_COMMENTS_COLLECTION_NAME)
        : await db.createCollection(BLOG_COMMENTS_COLLECTION_NAME);

    const indexes = {
      organizationId_appId_postId_createdAt_1: {
        organizationId: 1,
        appId: 1,
        postId: 1,
        createdAt: -1,
      },
      organizationId_appId_status_createdAt_1: {
        organizationId: 1,
        appId: 1,
        status: 1,
        createdAt: -1,
      },
    };

    for (const [name, index] of Object.entries(indexes)) {
      if (await collection.indexExists(name)) {
        continue;
      }
      await collection.createIndex(index, { name });
      console.log(`Created index ${name} on ${BLOG_COMMENTS_COLLECTION_NAME}`);
    }
  },

  /**
   * @param db {import('mongodb').Db}
   * @returns {Promise<void>}
   */
  async down(db) {
    const collection = db.collection(BLOG_COMMENTS_COLLECTION_NAME);
    const indexNames = [
      "organizationId_appId_postId_createdAt_1",
      "organizationId_appId_status_createdAt_1",
    ];

    for (const name of indexNames) {
      if (await collection.indexExists(name)) {
        await collection.dropIndex(name);
        console.log(`Dropped index ${name}`);
      }
    }
  },
};

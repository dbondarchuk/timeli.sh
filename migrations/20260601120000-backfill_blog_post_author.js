const BLOG_POSTS_COLLECTION_NAME = "blog-posts";
const USERS_COLLECTION_NAME = "users";
const BULK_BATCH_SIZE = 500;

module.exports = {
  /**
   * Set `author: { type: "user", id }` on all blog posts using each
   * organization's earliest user (by createdAt, then _id).
   *
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db) {
    const blogPosts = db.collection(BLOG_POSTS_COLLECTION_NAME);
    const users = db.collection(USERS_COLLECTION_NAME);

    const organizationUsers = await users
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
      ])
      .toArray();

    if (!organizationUsers.length) {
      console.log("No organization users found. Skipping blog post author backfill.");
      return;
    }

    const operations = organizationUsers.map(({ _id: organizationId, userId }) => {
      const authorUserId = userId.toString();
      return {
        updateMany: {
          filter: {
            $or: [
              { organizationId },
              { companyId: organizationId },
            ],
          },
          update: {
            $set: {
              author: {
                type: "user",
                id: authorUserId,
              },
            },
            $unset: {
              authorUserId: "",
              authorName: "",
            },
          },
        },
      };
    });

    let modifiedCount = 0;
    let matchedCount = 0;

    for (let i = 0; i < operations.length; i += BULK_BATCH_SIZE) {
      const batch = operations.slice(i, i + BULK_BATCH_SIZE);
      const result = await blogPosts.bulkWrite(batch, { ordered: false });
      modifiedCount += result.modifiedCount;
      matchedCount += result.matchedCount;
    }

    console.log(
      `Backfilled author on ${modifiedCount} blog post(s) (${matchedCount} matched) across ${organizationUsers.length} organization(s).`,
    );
  },

  /**
   * Not safely reversible: posts may have been assigned other authors after this migration.
   *
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down() {
    console.log("Skipping down: blog post author backfill is not reversible.");
  },
};

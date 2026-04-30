module.exports = {
  /**
   * Existing accounts are treated as organization owners.
   *
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db) {
    const users = db.collection("users");

    const result = await users.updateMany(
      {
        $or: [
          { role: { $exists: false } },
          { role: null },
          { role: "" },
        ],
      },
      { $set: { role: "owner" } },
    );

    console.log(
      `Set role "owner" on ${result.modifiedCount} user document(s) (${result.matchedCount} matched).`,
    );
  },

  /**
   * No safe rollback: users may have been assigned other roles after this migration.
   *
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down() {
    console.log("Skipping down: user role backfill is not reversible.");
  },
};

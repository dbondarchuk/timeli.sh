module.exports = {
  /**
   * Grandfather existing organizations: set `feesExempt` to true when the field
   * was never set. Does not change documents with `feesExempt: false` or
   * `feesExempt: true` (no-op for those that already have the flag).
   *
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db) {
    const organizations = db.collection("organizations");

    const result = await organizations.updateMany(
      {
        $or: [
          { feesExempt: { $exists: false } },
          { feesExempt: null },
        ],
      },
      { $set: { feesExempt: true } },
    );

    console.log(
      `Set feesExempt: true on ${result.modifiedCount} organization document(s) (${result.matchedCount} matched).`,
    );
  },

  /**
   * Not safely reversible: we cannot tell which orgs were updated vs already had
   * feesExempt set outside this migration.
   *
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down() {
    console.log(
      "Skipping down: feesExempt backfill is not reversible without tracking affected ids.",
    );
  },
};

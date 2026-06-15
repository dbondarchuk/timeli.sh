const FINANCIAL_OVERVIEW_APP_NAME = "financial-overview";

module.exports = {
  /**
   * Financial overview is now a core admin feature; remove legacy app installs.
   *
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db) {
    const connectedApps = db.collection("connected-apps");
    const result = await connectedApps.deleteMany({
      name: FINANCIAL_OVERVIEW_APP_NAME,
    });

    console.log(
      `[financial overview migration] Removed ${result.deletedCount} connected app document(s) named "${FINANCIAL_OVERVIEW_APP_NAME}".`,
    );
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down() {
    console.log(
      "[financial overview migration] Skipping down: removed connected-app installs are not restored.",
    );
  },
};

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.collection("configuration").deleteMany({
          key: { $in: ["header", "footer"] },
        });
      });
    } catch (error) {
      console.error(error);
    } finally {
      await session.endSession();
    }
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.collection("configuration").insertMany([
          { key: "header", value: { menu: [] } },
          { key: "footer", value: { isCustom: false } },
        ]);
      });
    } catch (error) {
      console.error(error);
    } finally {
      await session.endSession();
    }
  },
};

const GIFT_CARDS_COLLECTION_NAME = "gift-cards";
const PAYMENTS_COLLECTION_NAME = "payments";

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
        const giftCards = await db.createCollection(GIFT_CARDS_COLLECTION_NAME);

        // Unique index on code for getGiftCardByCode and uniqueness checks
        await giftCards.createIndex(
          { code: 1 },
          { name: "code", unique: true }
        );

        // Compound index companyId + code for lookups and uniqueness checks
        await giftCards.createIndex(
          { companyId: 1, code: 1 },
          { name: "companyId_code" }
        );

        // Index on companyId for all service queries (filter by company)
        await giftCards.createIndex(
          { companyId: 1 },
          { name: "companyId" }
        );

        // Compound index for list default sort (companyId + createdAt)
        await giftCards.createIndex(
          { companyId: 1, createdAt: -1 },
          { name: "companyId_createdAt" }
        );

        // Index for status/customer filters in getGiftCards
        await giftCards.createIndex(
          { companyId: 1, status: 1 },
          { name: "companyId_status" }
        );

        await giftCards.createIndex(
          { companyId: 1, customerId: 1 },
          { name: "companyId_customerId" }
        );

        // Indexes on payments for gift-card queries (collection already exists)
        const payments = db.collection(PAYMENTS_COLLECTION_NAME);
        await payments.createIndex(
          { giftCardId: 1 },
          { name: "giftCardId" }
        );
        await payments.createIndex(
          { companyId: 1, giftCardId: 1 },
          { name: "companyId_giftCardId" }
        );
        await payments.createIndex(
          { companyId: 1, method: 1, giftCardId: 1 },
          { name: "companyId_method_giftCardId" }
        );
      });
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
        await db.dropCollection(GIFT_CARDS_COLLECTION_NAME);

        const payments = db.collection(PAYMENTS_COLLECTION_NAME);
        await payments.dropIndex("giftCardId");
        await payments.dropIndex("companyId_giftCardId");
        await payments.dropIndex("companyId_method_giftCardId");
      });
    } finally {
      await session.endSession();
    }
  },
};

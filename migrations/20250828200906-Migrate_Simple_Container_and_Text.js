/**
 * @param pages {import('mongodb').Collection<{content: any}>}
 * @param forward {boolean}
 */
async function migratePageBulk(pages, forward = true) {
  return await pages.updateMany(
    {
      content: {
        $type: "object",
      },
    },
    [
      {
        $set: {
          content: {
            $function: {
              body: `function (content) {
                return ${forward ? "true" : "false"}
                  ? JSON.parse(
                      JSON.stringify(content)
                        .replace(/SimpleContainer/g, "InlineContainer")
                        .replace(/SimpleText/g, "InlineText"),
                    )
                  : JSON.parse(
                      JSON.stringify(content)
                        .replace(/InlineContainer/g, "SimpleContainer")
                        .replace(/InlineText/g, "SimpleText"),
                    );
              }`,
              args: ["$content"],
              lang: "js",
            },
          },
        },
      },
    ],
  );
}

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
        const pages = db.collection("pages");
        await migratePageBulk(pages);

        const pageFooters = db.collection("page-footers");
        await migratePageBulk(pageFooters);
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
        const pages = db.collection("pages");
        await migratePageBulk(pages, false);

        const pageFooters = db.collection("page-footers");
        await migratePageBulk(pageFooters, false);
      });
    } finally {
      await session.endSession();
    }
  },
};

const { ObjectId } = require("mongodb");

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
        const history = await db.createCollection("appointments-history");
        await history.createIndex(
          {
            appointmentId: -1,
          },
          {
            name: "appointmentId",
          },
        );

        const appointments = await db
          .collection("appointments")
          .find({})
          .toArray();

        if (appointments.length) {
          await history.bulkWrite(
            appointments.map((appointment) => ({
              insertOne: {
                document: {
                  _id: new ObjectId().toString(),
                  appointmentId: appointment._id,
                  dateTime: appointment.createdAt,
                  type: "created",
                  data: {
                    by: "customer",
                    confirmed: false,
                  },
                },
              },
            })),
          );
        }
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
        await db.dropCollection("appointments-history");
      });
    } finally {
      await session.endSession();
    }
  },
};

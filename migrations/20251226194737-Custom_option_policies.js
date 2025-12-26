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
        const options = db.collection("options");
        const configurations = db.collection("configuration");

        // 1. Set cancellation/reschedule policy types to 'inherit' for options
        await options.updateMany(
          {
            "cancellationPolicy.withDeposit.type": { $exists: false },
          },
          {
            $set: {
              "cancellationPolicy.withDeposit.type": "inherit",
            },
          },
        );

        // Set cancellationPolicy.withoutDeposit.type to 'inherit'
        await options.updateMany(
          {
            "cancellationPolicy.withoutDeposit.type": { $exists: false },
          },
          {
            $set: {
              "cancellationPolicy.withoutDeposit.type": "inherit",
            },
          },
        );

        // Set reschedulePolicy.type to 'inherit' if it exists but type doesn't
        await options.updateMany(
          {
            "reschedulePolicy.type": { $exists: false },
          },
          {
            $set: {
              "reschedulePolicy.type": "inherit",
            },
          },
        );

        // 2. Set durationType to 'fixed' and duration to 30 if durationType doesn't exist
        // First, set durationType to 'fixed' for options that don't have it
        await options.updateMany(
          {
            durationType: { $exists: false },
          },
          {
            $set: {
              durationType: "fixed",
            },
          },
        );

        // Then, set duration to 30 if durationType is 'fixed' (or was just set) and duration doesn't exist
        await options.updateMany(
          {
            durationType: "fixed",
            duration: { $exists: false },
          },
          {
            $set: {
              duration: 30,
            },
          },
        );

        // 3. Set paymentType to 'percentage' for requireDeposit in options
        // Only for options where requireDeposit is 'always' and paymentType doesn't exist
        await options.updateMany(
          {
            requireDeposit: "always",
            paymentType: { $exists: false },
          },
          {
            $set: {
              paymentType: "percentage",
            },
          },
        );

        // 4. Set paymentType to 'percentage' for cancellation/reschedule policies in booking configuration
        // This could be in default or custom policy rows

        // For cancellations.withDeposit.default
        await configurations.updateMany(
          {
            key: "booking",
            "value.cancellationsAndReschedules.cancellations.withDeposit.default.action":
              "paymentRequired",
            "value.cancellationsAndReschedules.cancellations.withDeposit.default.paymentType":
              { $exists: false },
          },
          {
            $set: {
              "value.cancellationsAndReschedules.cancellations.withDeposit.default.paymentType":
                "percentage",
            },
          },
        );

        // For cancellations.withDeposit.policies[]
        const configsWithWithDepositPolicies = await configurations
          .find({
            key: "booking",
            "value.cancellationsAndReschedules.cancellations.withDeposit.policies":
              { $exists: true },
          })
          .toArray();

        for (const config of configsWithWithDepositPolicies) {
          const policies =
            config.value?.cancellationsAndReschedules?.cancellations
              ?.withDeposit?.policies;
          if (Array.isArray(policies)) {
            let updated = false;
            const updatedPolicies = policies.map((policy) => {
              if (policy.action === "paymentRequired" && !policy.paymentType) {
                updated = true;
                return { ...policy, paymentType: "percentage" };
              }
              return policy;
            });

            if (updated) {
              await configurations.updateOne(
                { _id: config._id },
                {
                  $set: {
                    "value.cancellationsAndReschedules.cancellations.withDeposit.policies":
                      updatedPolicies,
                  },
                },
              );
            }
          }
        }

        // For cancellations.withoutDeposit.default
        await configurations.updateMany(
          {
            key: "booking",
            "value.cancellationsAndReschedules.cancellations.withoutDeposit.default.action":
              "paymentRequired",
            "value.cancellationsAndReschedules.cancellations.withoutDeposit.default.paymentType":
              { $exists: false },
          },
          {
            $set: {
              "value.cancellationsAndReschedules.cancellations.withoutDeposit.default.paymentType":
                "percentage",
            },
          },
        );

        // For cancellations.withoutDeposit.policies[]
        const configsWithWithoutDepositPolicies = await configurations
          .find({
            key: "booking",
            "value.cancellationsAndReschedules.cancellations.withoutDeposit.policies":
              { $exists: true },
          })
          .toArray();

        for (const config of configsWithWithoutDepositPolicies) {
          const policies =
            config.value?.cancellationsAndReschedules?.cancellations
              ?.withoutDeposit?.policies;
          if (Array.isArray(policies)) {
            let updated = false;
            const updatedPolicies = policies.map((policy) => {
              if (policy.action === "paymentRequired" && !policy.paymentType) {
                updated = true;
                return { ...policy, paymentType: "percentage" };
              }
              return policy;
            });

            if (updated) {
              await configurations.updateOne(
                { _id: config._id },
                {
                  $set: {
                    "value.cancellationsAndReschedules.cancellations.withoutDeposit.policies":
                      updatedPolicies,
                  },
                },
              );
            }
          }
        }

        // For reschedules.default
        await configurations.updateMany(
          {
            key: "booking",
            "value.cancellationsAndReschedules.reschedules.default.action":
              "paymentRequired",
            "value.cancellationsAndReschedules.reschedules.default.paymentType":
              { $exists: false },
          },
          {
            $set: {
              "value.cancellationsAndReschedules.reschedules.default.paymentType":
                "percentage",
            },
          },
        );

        // For reschedules.policies[]
        const configsWithReschedulePolicies = await configurations
          .find({
            key: "booking",
            "value.cancellationsAndReschedules.reschedules.policies": {
              $exists: true,
            },
          })
          .toArray();

        for (const config of configsWithReschedulePolicies) {
          const policies =
            config.value?.cancellationsAndReschedules?.reschedules?.policies;
          if (Array.isArray(policies)) {
            let updated = false;
            const updatedPolicies = policies.map((policy) => {
              if (policy.action === "paymentRequired" && !policy.paymentType) {
                updated = true;
                return { ...policy, paymentType: "percentage" };
              }
              return policy;
            });

            if (updated) {
              await configurations.updateOne(
                { _id: config._id },
                {
                  $set: {
                    "value.cancellationsAndReschedules.reschedules.policies":
                      updatedPolicies,
                  },
                },
              );
            }
          }
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
        const options = db.collection("options");
        const configurations = db.collection("configuration");

        // Rollback: Remove the fields we added
        // Note: This is a best-effort rollback. Some data might not be fully reversible.

        // Remove cancellation/reschedule policies, durationType, and paymentType
        await options.updateMany(
          {},
          {
            $unset: {
              cancellationPolicy: "",
              reschedulePolicy: "",
              durationType: "",
              paymentType: "",
            },
          },
        );

        // Remove paymentType from cancellation/reschedule policies in configuration
        // This is complex to rollback exactly, so we'll ignore it
      });
    } finally {
      await session.endSession();
    }
  },
};

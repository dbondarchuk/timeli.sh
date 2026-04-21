import { claimEventHandler } from "../claim-event-handler";
import { resolveEventDefinition } from "../event-registry";
import type { EventHandler } from "./types";

export const notificationHandler: EventHandler = {
  name: "notifications",
  async run({ envelope, services, redis, getDbConnection }) {
    const def = resolveEventDefinition(envelope.type);
    if (!def) {
      return;
    }

    if (typeof def.emailNotifications === "function") {
      const claimed = await claimEventHandler(
        redis,
        envelope.organizationId,
        envelope.id,
        "email",
      );
      if (claimed) {
        const email = await def.emailNotifications(
          envelope,
          services,
          getDbConnection,
        );
        if (email) {
          await services.notificationService.sendEmail(email);
        }
      }
    }

    if (typeof def.smsNotifications === "function") {
      const claimed = await claimEventHandler(
        redis,
        envelope.organizationId,
        envelope.id,
        "sms",
      );
      if (claimed) {
        const sms = await def.smsNotifications(
          envelope,
          services,
          getDbConnection,
        );
        if (sms) {
          await services.notificationService.sendTextMessage(sms);
        }
      }
    }
  },
};

"use server";

import {
  CUSTOMER_EMAIL_NOTIFICATION_APP_NAME,
  CUSTOMER_TEXT_MESSAGE_NOTIFICATION_APP_NAME,
  FILE_SYSTEM_ASSETS_STORAGE_APP_NAME,
  FOLLOW_UPS_APP_NAME,
  REMINDERS_APP_NAME,
} from "@vivid/app-store";
import { fallbackLanguage } from "@vivid/i18n";
import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { DateTime } from "luxon";
import { InstallFormData } from "./types";

export async function install(data: InstallFormData) {
  const logger = getLoggerFactory("InstallActions")("install");

  logger.info("Starting installation process", {
    name: data.name,
    email: data.email,
  });

  try {
    logger.info("Setting general configuration");
    await ServicesContainer.ConfigurationService().setConfiguration("general", {
      ...data,
      description: "",
      keywords: "",
      language: fallbackLanguage,
      timeZone: DateTime.now().zoneName,
    });

    logger.info("Creating home page");
    await ServicesContainer.PagesService().createPage({
      content: "<PageTitle/>",
      description: "Home",
      keywords: "home",
      publishDate: new Date(),
      slug: "home",
      title: "Home",
      published: true,
    });

    const shifts = [
      {
        start: "09:00",
        end: "17:00",
      },
    ];

    logger.info("Setting booking configuration");
    await ServicesContainer.ConfigurationService().setConfiguration("booking", {
      options: [],
      allowPromoCode: "allow-if-has-active",
      smartSchedule: {
        allowSmartSchedule: false,
      },
      payments: {
        enabled: false,
      },
      cancellationsAndReschedules: {
        cancellations: {
          enabled: "disabled",
        },
        reschedules: {
          enabled: "disabled",
        },
      },
    });

    logger.info("Setting schedule configuration");
    await ServicesContainer.ConfigurationService().setConfiguration(
      "schedule",
      {
        schedule: Array.from({ length: 5 }).map((_, index) => ({
          weekDay: index + 1,
          shifts,
        })),
      },
    );

    // logger.info("Setting footer configuration");
    // await ServicesContainer.ConfigurationService().setConfiguration("footer", {
    //   isCustom: false,
    // });

    // logger.info("Setting header configuration");
    // await ServicesContainer.ConfigurationService().setConfiguration("header", {
    //   menu: [],
    // });

    logger.info("Setting social and styling configurations");
    await ServicesContainer.ConfigurationService().setConfiguration(
      "social",
      {},
    );
    await ServicesContainer.ConfigurationService().setConfiguration(
      "styling",
      {},
    );

    logger.info("Creating default connected apps");
    await ServicesContainer.ConnectedAppsService().createNewApp(
      REMINDERS_APP_NAME,
    );
    await ServicesContainer.ConnectedAppsService().createNewApp(
      FOLLOW_UPS_APP_NAME,
    );
    await ServicesContainer.ConnectedAppsService().createNewApp(
      CUSTOMER_EMAIL_NOTIFICATION_APP_NAME,
    );
    await ServicesContainer.ConnectedAppsService().createNewApp(
      CUSTOMER_TEXT_MESSAGE_NOTIFICATION_APP_NAME,
    );

    // const logCleanerAppId =
    //   await ServicesContainer.ConnectedAppService().createNewApp(
    //     LOG_CLEANUP_APP_NAME
    //   );

    // await ServicesContainer.ConnectedAppService().updateApp(logCleanerAppId, {
    //   status: "connected",
    //   statusText: "Installed",
    //   data: {
    //     amount: 1,
    //     type: "weeks",
    //   },
    // });

    logger.info("Creating assets storage app");
    const assetsStorageAppId =
      await ServicesContainer.ConnectedAppsService().createNewApp(
        FILE_SYSTEM_ASSETS_STORAGE_APP_NAME,
      );

    await ServicesContainer.ConnectedAppsService().updateApp(
      assetsStorageAppId,
      {
        status: "connected",
        statusText: "common.statusText.installed",
      },
    );

    logger.info("Setting default apps configuration");
    await ServicesContainer.ConfigurationService().setConfiguration(
      "defaultApps",
      {
        email: {} as any,
        assetsStorage: {
          appId: assetsStorageAppId,
        },
      },
    );

    logger.info("Installation completed successfully");
  } catch (error) {
    logger.error("Installation failed", { error });
    throw error;
  }
}

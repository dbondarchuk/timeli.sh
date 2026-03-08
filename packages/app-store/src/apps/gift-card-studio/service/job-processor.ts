import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  AppJobRequest,
  ConnectedAppData,
  IServicesContainer,
} from "@timelish/types";
import { formatAmountString } from "@timelish/utils";
import { DateTime } from "luxon";
import { Readable } from "stream";
import { png2pdf, renderGiftCard } from "../designer/lib/render/render";
import { GiftCardStudioJobPayload } from "../models/app";
import { GiftCardStudioRepositoryService } from "./repository-service";
import { getFileName } from "./utils";

export class GiftCardStudioJobProcessor {
  protected readonly loggerFactory: LoggerFactory;
  public constructor(
    protected readonly companyId: string,
    protected readonly services: IServicesContainer,
    protected readonly repository: GiftCardStudioRepositoryService,
  ) {
    this.loggerFactory = getLoggerFactory(
      "GiftCardStudioJobProcessor",
      companyId,
    );
  }

  public async processJob(
    appData: ConnectedAppData,
    jobData: AppJobRequest<GiftCardStudioJobPayload>,
  ): Promise<void> {
    const logger = this.loggerFactory("processJob");
    logger.debug(
      { appId: appData._id, jobData },
      "Processing Gift Card Studio job",
    );

    switch (jobData.payload.type) {
      case "generate-gift-card":
        return this.processGenerateGiftCard(
          appData,
          jobData.payload.purchasedGiftCardId,
        );
      case "generate-invoice":
        return this.processGenerateInvoice(
          appData,
          jobData.payload.purchasedGiftCardId,
        );
      default:
        logger.error({ appId: appData._id, jobData }, "Unsupported job type");
        throw new Error("Unsupported job type");
    }
  }

  private async processGenerateGiftCard(
    appData: ConnectedAppData,
    purchasedGiftCardId: string,
  ): Promise<void> {
    const logger = this.loggerFactory("processGenerateGiftCard");
    logger.debug(
      { appId: appData._id, purchasedGiftCardId },
      "Processing Generate Gift Card job",
    );

    try {
      const purchasedGiftCard =
        await this.repository.getPurchasedGiftCardById(purchasedGiftCardId);
      if (!purchasedGiftCard) {
        logger.error(
          { appId: appData._id, purchasedGiftCardId },
          "Purchased gift card not found",
        );
        throw new Error("Purchased gift card not found");
      }

      const design = await this.repository.getDesignById(
        purchasedGiftCard.designId,
      );
      if (!design) {
        logger.error(
          { appId: appData._id, designId: purchasedGiftCard.designId },
          "Design not found",
        );
        throw new Error("Design not found");
      }

      const giftCard = await this.services.giftCardsService.getGiftCard(
        purchasedGiftCard.giftCardId,
      );

      if (!giftCard) {
        logger.error(
          { appId: appData._id, giftCardId: purchasedGiftCard.giftCardId },
          "Gift card not found",
        );
        throw new Error("Gift card not found");
      }

      let expiresAt: DateTime | null = null;
      if (giftCard.expiresAt) {
        const { timeZone, language } =
          await this.services.configurationService.getConfiguration("general");
        expiresAt = DateTime.fromJSDate(giftCard.expiresAt)
          .setZone(timeZone)
          .setLocale(language);
      }

      logger.debug(
        { appId: appData._id, purchasedGiftCardId, expiresAt },
        "Generating gift card",
      );

      const generatedPng = await renderGiftCard({
        design: design.design,
        fields: {
          amount: "$" + formatAmountString(purchasedGiftCard.amountPurchased),
          code: giftCard.code,
          expiresAt,
          to: purchasedGiftCard.toName ?? giftCard.customer.name,
          from: giftCard.customer.name,
          message: purchasedGiftCard.message,
        },
        format: "png",
      });

      const pngFileName = getFileName(
        appData._id,
        purchasedGiftCardId,
        "gift-card",
        "png",
      );
      logger.debug(
        { appId: appData._id, purchasedGiftCardId, pngFileName },
        "Generated gift card PNG",
      );

      const generatedPdf = await png2pdf(design.design, generatedPng);
      const pdfFileName = getFileName(
        appData._id,
        purchasedGiftCardId,
        "gift-card",
        "pdf",
      );
      logger.debug(
        { appId: appData._id, purchasedGiftCardId, pngFileName, pdfFileName },
        "Generated gift card PDF, saving to storage",
      );

      await this.services.assetsStorage.saveFile(
        pngFileName,
        Readable.from(generatedPng),
        generatedPng.length,
      );
      logger.debug(
        { appId: appData._id, purchasedGiftCardId, pngFileName },
        "Saved gift card PNG to storage",
      );

      await this.services.assetsStorage.saveFile(
        pdfFileName,
        Readable.from(generatedPdf),
        generatedPdf.length,
      );

      logger.debug(
        { appId: appData._id, purchasedGiftCardId, pdfFileName },
        "Saved gift card PDF to storage",
      );

      await this.repository.updatePurchasedGiftCardStatus(purchasedGiftCardId, {
        cardGenerationStatus: "completed",
      });

      logger.debug(
        { appId: appData._id, purchasedGiftCardId },
        "Updated purchased gift card with PDF and PNG file names",
      );
    } catch (error) {
      logger.error(
        { appId: appData._id, purchasedGiftCardId, error },
        "Error generating gift card",
      );

      await this.repository.updatePurchasedGiftCardStatus(purchasedGiftCardId, {
        cardGenerationStatus: "failed",
      });

      throw error;
    }
  }

  private async processGenerateInvoice(
    appData: ConnectedAppData,
    purchasedGiftCardId: string,
  ): Promise<void> {
    const logger = this.loggerFactory("processGenerateInvoice");
    logger.debug(
      { appId: appData._id, purchasedGiftCardId },
      "Processing Generate Invoice job",
    );
  }
}

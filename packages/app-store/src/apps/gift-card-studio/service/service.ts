import { getLocale } from "@timelish/i18n/server";
import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  AppJobRequest,
  ConnectedAppData,
  ConnectedAppRequestError,
  DemoArguments,
  IConnectedApp,
  IConnectedAppProps,
  IDemoArgumentsProvider,
  IScheduled,
} from "@timelish/types";
import { formatAmountString } from "@timelish/utils";
import { DateTime } from "luxon";
import { demoPurchasedGiftCard } from "../demo-arguments";
import { renderGiftCard } from "../designer/lib/render/render";
import { FieldKeyValues } from "../designer/lib/types";
import type {
  CreatePurchasedGiftCardAction,
  DeleteDesignAction,
  DeleteDesignsAction,
  DesignModel,
  GiftCardStudioJobPayload,
  SetDesignArchivedAction,
  SetDesignsArchivedAction,
} from "../models";
import {
  CheckDesignNameUniqueActionType,
  CreateDesignActionType,
  CreatePurchasedGiftCardActionType,
  DeleteDesignActionType,
  DeleteDesignsActionType,
  GetDesignByIdActionType,
  GetDesignsActionType,
  GetPreviewActionType,
  GetPurchasedGiftCardByIdActionType,
  GetPurchasedGiftCardsActionType,
  GetSettingsActionType,
  RequestAction,
  requestActionSchema,
  SetDesignArchivedActionType,
  SetDesignsArchivedActionType,
  UpdateDesignActionType,
  UpdateSettingsActionType,
} from "../models";
import { GiftCardStudioSettings } from "../models/settings";
import { GiftCardStudioJobProcessor } from "./job-processor";
import { GiftCardStudioRepositoryService } from "./repository-service";

const generateGiftCardCode = () => {
  return (
    Math.random().toString(36).substring(2, 5).toUpperCase() +
    "-" +
    Math.random().toString(36).substring(2, 5).toUpperCase() +
    "-" +
    Math.random().toString(36).substring(2, 5).toUpperCase()
  );
};

export class GiftCardStudioConnectedApp
  implements IConnectedApp, IScheduled, IDemoArgumentsProvider
{
  protected readonly loggerFactory: LoggerFactory;

  public async getDemoEmailArguments(): Promise<DemoArguments> {
    return { giftCard: demoPurchasedGiftCard };
  }

  public constructor(protected readonly props: IConnectedAppProps) {
    this.loggerFactory = getLoggerFactory(
      "GiftCardStudioConnectedApp",
      props.companyId,
    );
  }

  public async processRequest(
    appData: ConnectedAppData,
    request: RequestAction,
  ): Promise<unknown> {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      { appId: appData._id, type: request.type },
      "Processing Gift Card Studio request",
    );

    const parsed = requestActionSchema.safeParse(request);
    if (!parsed.success) {
      logger.error({ error: parsed.error }, "Invalid request");
      throw new ConnectedAppRequestError(
        "invalid_gift_card_studio_request",
        { request },
        400,
        parsed.error.message,
      );
    }
    const data = parsed.data;

    const repo = this.getRepositoryService(appData._id, appData.companyId);

    switch (data.type) {
      case CreateDesignActionType:
        logger.debug({ designName: data.design?.name }, "Create design");
        return this.processCreateDesign(appData, data, repo);
      case UpdateDesignActionType:
        logger.debug(
          { id: data.id, designName: data.design?.name },
          "Update design",
        );
        return this.processUpdateDesign(appData, data, repo);
      case DeleteDesignActionType:
        logger.debug({ id: data.id }, "Delete design");
        return this.processDeleteDesign(appData, data, repo);
      case DeleteDesignsActionType:
        logger.debug({ ids: data.ids }, "Delete designs");
        return this.processDeleteDesigns(appData, data, repo);
      case SetDesignArchivedActionType:
        logger.debug(
          { id: data.id, isArchived: data.isArchived },
          "Set design public",
        );
        return this.processSetDesignArchived(appData, data, repo);
      case SetDesignsArchivedActionType:
        logger.debug(
          { ids: data.ids, isArchived: data.isArchived },
          "Set designs archived",
        );
        return this.processSetDesignsArchived(appData, data, repo);
      case GetDesignsActionType:
        logger.debug("Get designs");
        return repo.getDesigns(data.query);
      case GetDesignByIdActionType:
        logger.debug({ id: data.id }, "Get design by id");
        return repo.getDesignById(data.id);
      case CheckDesignNameUniqueActionType:
        logger.debug(
          { name: data.name, excludeId: data.id },
          "Check design name unique",
        );
        return repo.checkDesignNameUnique(data.name, data.id);
      case GetPurchasedGiftCardsActionType:
        logger.debug("Get purchased gift cards");
        return repo.getPurchasedGiftCards(data.query);
      case GetPurchasedGiftCardByIdActionType:
        logger.debug({ id: data.id }, "Get purchased gift card by id");
        return repo.getPurchasedGiftCardById(data.id);
      case CreatePurchasedGiftCardActionType:
        logger.debug(
          {
            designId: data.purchase?.designId,
            amount: data.purchase?.amountPurchased,
          },
          "Create purchased gift card",
        );
        return this.processCreatePurchasedGiftCard(appData, data, repo);
      case GetPreviewActionType:
        logger.debug({ designId: data.designId }, "Get preview");
        return this.processGetPreview(appData, data, repo);
      case GetSettingsActionType:
        logger.debug("Get settings");
        return (appData.data as GiftCardStudioSettings) ?? {};
      case UpdateSettingsActionType:
        logger.debug("Update settings");
        return this.processUpdateSettings(appData, data);
      default:
        logger.warn({ type: (data as any).type }, "Unknown request type");
        return null;
    }
  }

  public async install(appData: ConnectedAppData): Promise<void> {
    const logger = this.loggerFactory("install");
    logger.debug({ appId: appData._id }, "Installing Gift Card Studio");

    const repo = this.getRepositoryService(appData._id, appData.companyId);
    await repo.install();
    logger.info({ appId: appData._id }, "Gift Card Studio installed");
  }

  public async unInstall(appData: ConnectedAppData): Promise<void> {
    const logger = this.loggerFactory("unInstall");
    logger.debug({ appId: appData._id }, "Uninstalling Gift Card Studio");

    const repo = this.getRepositoryService(appData._id, appData.companyId);
    await repo.unInstall();
    logger.info({ appId: appData._id }, "Gift Card Studio uninstalled");
  }

  public async processAppCall(
    appData: ConnectedAppData,
    slug: string[],
    request: Request,
  ): Promise<Response> {
    const logger = this.loggerFactory("processAppCall");
    logger.debug({ appId: appData._id, slug }, "Processing app call");

    if (slug[0] === "preview" && request.method === "POST") {
      return this.handlePreviewRequest(appData, request);
    }

    return Response.json(
      { success: false, code: "not_found", error: "Not found" },
      { status: 404 },
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

    const repo = this.getRepositoryService(appData._id, appData.companyId);
    const jobProcessor = new GiftCardStudioJobProcessor(
      appData.companyId,
      this.props.services,
      repo,
    );
    await jobProcessor.processJob(appData, jobData);

    logger.info(
      { appId: appData._id, jobData },
      "Successfully processed Gift Card Studio job",
    );
  }

  private getRepositoryService(appId: string, companyId: string) {
    return new GiftCardStudioRepositoryService(
      appId,
      companyId,
      this.props.getDbConnection,
    );
  }

  private async processCreateDesign(
    appData: ConnectedAppData,
    data: { design: any },
    repo: GiftCardStudioRepositoryService,
  ) {
    const logger = this.loggerFactory("processCreateDesign");
    const isUnique = await repo.checkDesignNameUnique(data.design.name);
    if (!isUnique) {
      logger.warn({ name: data.design.name }, "Design name not unique");
      throw new ConnectedAppRequestError(
        "design_name_not_unique",
        { name: data.design.name },
        400,
        "Design name not unique",
      );
    }
    const created = await repo.createDesign(data.design);
    logger.info(
      { designId: (created as { _id: string })?._id, name: data.design.name },
      "Design created",
    );
    return created;
  }

  private async processUpdateDesign(
    appData: ConnectedAppData,
    data: { id: string; design: any },
    repo: GiftCardStudioRepositoryService,
  ) {
    const logger = this.loggerFactory("processUpdateDesign");
    const isUnique = await repo.checkDesignNameUnique(
      data.design.name,
      data.id,
    );
    if (!isUnique) {
      logger.warn(
        { name: data.design.name, id: data.id },
        "Design name not unique",
      );
      throw new ConnectedAppRequestError(
        "design_name_not_unique",
        { name: data.design.name, id: data.id },
        400,
        "Design name not unique",
      );
    }
    const updated = await repo.updateDesign(data.id, data.design);
    if (!updated) {
      logger.warn({ id: data.id }, "Design not found for update");
      throw new ConnectedAppRequestError(
        "design_not_found",
        { id: data.id },
        404,
        "Design not found",
      );
    }
    logger.info({ id: data.id, name: data.design.name }, "Design updated");
    return updated;
  }

  private async processDeleteDesign(
    appData: ConnectedAppData,
    data: DeleteDesignAction,
    repo: GiftCardStudioRepositoryService,
  ) {
    const logger = this.loggerFactory("processDeleteDesign");
    const deleted = await repo.deleteDesign(data.id);
    if (!deleted) {
      logger.warn({ id: data.id }, "Design not found or has purchases");
      throw new ConnectedAppRequestError(
        "design_not_found_or_has_purchases",
        { id: data.id },
        404,
        "Design not found or has purchases",
      );
    }
    logger.info({ id: data.id }, "Design deleted");
    return deleted;
  }

  private async processDeleteDesigns(
    appData: ConnectedAppData,
    data: DeleteDesignsAction,
    repo: GiftCardStudioRepositoryService,
  ) {
    const logger = this.loggerFactory("processDeleteDesigns");
    const deleted = await repo.deleteDesigns(data.ids);
    if (!deleted) {
      logger.warn({ ids: data.ids }, "Designs not found or have purchases");
      throw new ConnectedAppRequestError(
        "designs_not_found_or_have_purchases",
        { ids: data.ids },
        404,
        "Designs not found or have purchases",
      );
    }

    logger.info({ ids: data.ids }, "Designs deleted");
    return deleted;
  }

  private async processSetDesignArchived(
    appData: ConnectedAppData,
    data: SetDesignArchivedAction,
    repo: GiftCardStudioRepositoryService,
  ) {
    const logger = this.loggerFactory("processSetDesignArchived");
    const ok = await repo.setDesignArchived(data.id, data.isArchived);
    if (!ok) {
      logger.warn({ id: data.id }, "Design not found for set public");
      throw new ConnectedAppRequestError(
        "design_not_found",
        { id: data.id },
        404,
        "Design not found",
      );
    }
    logger.info(
      { id: data.id, isArchived: data.isArchived },
      "Design visibility updated",
    );
    return ok;
  }

  private async processSetDesignsArchived(
    appData: ConnectedAppData,
    data: SetDesignsArchivedAction,
    repo: GiftCardStudioRepositoryService,
  ) {
    const logger = this.loggerFactory("processSetDesignsArchived");
    const ok = await repo.setDesignsArchived(data.ids, data.isArchived);
    if (!ok) {
      logger.warn({ ids: data.ids }, "Designs not found for set public");
      throw new ConnectedAppRequestError(
        "designs_not_found",
        { ids: data.ids },
        404,
        "Designs not found",
      );
    }
    logger.info(
      { ids: data.ids, isArchived: data.isArchived },
      "Designs archived updated",
    );
    return ok;
  }

  private async processCreatePurchasedGiftCard(
    appData: ConnectedAppData,
    { purchase }: CreatePurchasedGiftCardAction,
    repo: GiftCardStudioRepositoryService,
  ) {
    const logger = this.loggerFactory("processCreatePurchasedGiftCard");
    const settings = (appData.data as GiftCardStudioSettings) ?? {};
    const minAmount = settings.minAmount ?? 5;
    const maxAmount = settings.maxAmount ?? 1000000;
    if (purchase.amountPurchased < minAmount) {
      throw new ConnectedAppRequestError(
        "amount_purchased_too_low",
        { amount: purchase.amountPurchased },
        400,
        "Amount purchased is too low",
      );
    }
    if (purchase.amountPurchased > maxAmount) {
      throw new ConnectedAppRequestError(
        "amount_purchased_too_high",
        { amount: purchase.amountPurchased },
        400,
        "Amount purchased is too high",
      );
    }

    logger.debug({ purchase }, "Creating purchased gift card");

    const code = await this.generateUniqueGiftCardCode();
    const paidAt = new Date();

    const payment = await this.props.services.paymentsService.createPayment({
      amount: purchase.amountPurchased,
      status: "paid",
      paidAt,
      customerId: purchase.customerId,
      description: "giftCard",
      type: "payment",
      method: purchase.paymentType,
    });

    logger.debug(
      {
        paymentId: payment._id,
        method: purchase.paymentType,
        amount: purchase.amountPurchased,
      },
      "Payment created",
    );

    const giftCard = await this.props.services.giftCardsService.createGiftCard({
      code,
      amount: purchase.amountPurchased,
      customerId: purchase.customerId,
      paymentId: payment._id,
      expiresAt: DateTime.now()
        .plus({ months: settings.expirationMonths ?? 12 })
        .endOf("day")
        .toJSDate(),
    });

    logger.debug(
      { giftCardId: giftCard._id, code, amount: purchase.amountPurchased },
      "Gift card created",
    );

    const sendGiftCard = purchase.sendGiftCardEmail !== false;
    const sendInvoice = purchase.sendInvoiceToCustomer !== false;

    const purchased = await repo.createPurchasedGiftCard({
      designId: purchase.designId,
      giftCardId: giftCard._id,
      amountPurchased: purchase.amountPurchased,
      customerId: purchase.customerId,
      toName: purchase.toName,
      toEmail: purchase.toEmail || undefined,
      message: purchase.message,
      cardGenerationStatus: "pending",
      invoiceGenerationStatus: "pending",
      recipientDeliveryStatus: "pending",
      customerDeliveryStatus: "pending",
    });

    logger.debug(
      { purchasedId: purchased._id, code, amount: purchase.amountPurchased },
      "Purchased gift card created",
    );

    await this.props.services.jobService.scheduleJob({
      type: "app",
      executeAt: "now",
      appId: appData._id,
      payload: {
        type: "generate-gift-card",
        purchasedGiftCardId: purchased._id,
        sendEmail: sendGiftCard,
      } satisfies GiftCardStudioJobPayload,
    });

    logger.debug(
      {
        purchasedId: purchased._id,
        code,
        amount: purchase.amountPurchased,
        sendEmail: sendGiftCard,
      },
      "Successfully scheduled generate gift card job",
    );

    logger.info(
      {
        purchasedId: purchased._id,
        designId: purchase.designId,
        amount: purchase.amountPurchased,
      },
      "Purchased gift card created",
    );
    return repo.getPurchasedGiftCardById(purchased._id);
  }

  private async generateUniqueGiftCardCode(): Promise<string> {
    const logger = this.loggerFactory("generateUniqueGiftCardCode");
    for (let i = 0; i < 50; i++) {
      const code = generateGiftCardCode();
      const unique =
        await this.props.services.giftCardsService.checkGiftCardCodeUnique(
          code,
        );
      if (unique) return code;
    }
    logger.error("Could not generate unique gift card code after 50 attempts");
    throw new Error("Could not generate unique gift card code");
  }

  private async triggerDeliveriesForPurchase(
    appData: ConnectedAppData,
    purchasedId: string,
    sendGiftCard: boolean,
    sendInvoice: boolean,
  ): Promise<void> {
    const logger = this.loggerFactory("triggerDeliveriesForPurchase");
    const repo = this.getRepositoryService(appData._id, appData.companyId);
    const purchased = await repo.getPurchasedGiftCardById(purchasedId);
    if (!purchased) {
      logger.warn(
        { purchasedId },
        "Purchased gift card not found for deliveries",
      );
      return;
    }

    if (sendGiftCard) {
      await repo.updatePurchasedGiftCardStatus(purchasedId, {
        recipientDeliveryStatus: "scheduled",
      });
      logger.debug({ purchasedId }, "Marked gift card delivered to recipient");
    }
    if (sendInvoice) {
      await repo.updatePurchasedGiftCardStatus(purchasedId, {
        customerDeliveryStatus: "scheduled",
      });
      logger.debug({ purchasedId }, "Marked invoice sent to customer");
    }
  }

  private async processGetPreview(
    appData: ConnectedAppData,
    data: {
      designId: string;
      amount: number;
      name?: string;
      email?: string;
      phone?: string;
      toName?: string;
      toEmail?: string;
      message?: string;
    },
    repo: GiftCardStudioRepositoryService,
  ): Promise<{ success: true; imageDataUrl: string }> {
    const design = await repo.getDesignById(data.designId);
    if (!design) {
      throw new ConnectedAppRequestError(
        "design_not_found",
        { id: data.designId },
        404,
        "Design not found",
      );
    }
    const { timeZone } =
      await this.props.services.configurationService.getConfiguration(
        "general",
      );
    const settings = (appData.data as GiftCardStudioSettings) ?? {};
    const expirationMonths = settings.expirationMonths ?? 12;
    const locale = await getLocale();
    const expiresAt = DateTime.now()
      .plus({ months: expirationMonths })
      .setZone(timeZone)
      .setLocale(locale);

    const payload = {
      designId: data.designId,
      amount: data.amount,
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
      phone: String(data.phone ?? ""),
      toName: String(data.toName ?? ""),
      toEmail: String(data.toEmail ?? ""),
      message: String(data.message ?? ""),
      code: "PREVIEW",
      expiresAt,
    };
    const imageDataUrl = await this.generatePreviewImage(design, payload);
    return { success: true as const, imageDataUrl };
  }

  private async processUpdateSettings(
    appData: ConnectedAppData,
    data: Record<string, unknown>,
  ) {
    const logger = this.loggerFactory("processUpdateSettings");
    const current = (appData.data as GiftCardStudioSettings) ?? {};
    const { type: _t, ...rest } = data;
    const next = { ...current, ...rest };
    await this.props.update({ data: next });
    logger.info({ keys: Object.keys(rest) }, "Settings updated");
    return next;
  }

  private async handlePreviewRequest(
    appData: ConnectedAppData,
    request: Request,
  ): Promise<Response> {
    const logger = this.loggerFactory("handlePreviewRequest");
    try {
      const body = await request.json();
      const { designId, amount, name, email, phone, toName, toEmail, message } =
        body as Record<string, unknown>;

      if (!designId || typeof amount !== "number") {
        logger.debug({ designId, amount }, "Preview rejected: invalid body");
        return Response.json(
          {
            success: false,
            code: "invalid_body",
            error: "designId and amount required",
          },
          { status: 400 },
        );
      }

      const repo = this.getRepositoryService(appData._id, appData.companyId);
      const design = await repo.getDesignById(designId as string);
      if (!design) {
        logger.debug({ designId }, "Preview rejected: design not found");
        return Response.json(
          {
            success: false,
            code: "design_not_found",
            error: "Design not found",
          },
          { status: 404 },
        );
      }
      const settings = (appData.data as GiftCardStudioSettings) ?? {};
      const expirationMonths = settings.expirationMonths ?? 12;
      const locale = await getLocale();
      const { timeZone } =
        await this.props.services.configurationService.getConfiguration(
          "general",
        );
      const expiresAt = DateTime.now()
        .plus({ months: expirationMonths })
        .setLocale(locale)
        .setZone(timeZone);

      const previewCode = "PREVIEW";
      const payload = {
        designId: String(designId ?? ""),
        amount: Number(amount),
        name: String(name ?? ""),
        email: String(email ?? ""),
        phone: String(phone ?? ""),
        toName: String(toName ?? ""),
        toEmail: String(toEmail ?? ""),
        message: String(message ?? ""),
        code: previewCode,
        expiresAt: expiresAt,
      };

      const imageDataUrl = await this.generatePreviewImage(design, payload);
      logger.info(
        { designId, dataUrlLength: imageDataUrl?.length },
        "Preview generated",
      );
      return Response.json({ success: true, imageDataUrl });
    } catch (e) {
      logger.error({ error: e }, "Preview request failed");
      return Response.json(
        { success: false, code: "preview_failed", error: String(e) },
        { status: 500 },
      );
    }
  }

  private async generatePreviewImage(
    designDoc: DesignModel,
    payload: {
      designId: string;
      amount: number;
      name: string;
      email: string;
      phone: string;
      toName: string;
      toEmail: string;
      message: string;
      code: string;
      expiresAt: DateTime;
    },
  ): Promise<string> {
    const logger = this.loggerFactory("generatePreviewImage");
    logger.debug({ designId: payload.designId }, "Generating preview image");
    const design = designDoc.design;
    const fields: FieldKeyValues = {
      amount:
        "$" +
        (typeof payload.amount === "number"
          ? formatAmountString(payload.amount)
          : "0.00"),
      code: payload.code ?? "PREVIEW",
      to: payload.toName ?? "",
      from: payload.name ?? "",
      message: payload.message ?? "",
      expiresAt: payload.expiresAt,
    };

    try {
      logger.debug({ designId: payload.designId }, "Rendering gift card");
      const pngBuffer = await renderGiftCard({
        design,
        fields,
        format: "png",
      });
      const base64 = pngBuffer.toString("base64");
      logger.debug(
        { designId: payload.designId, sizeBytes: pngBuffer.length },
        "Preview rendered via renderGiftCard",
      );
      return `data:image/png;base64,${base64}`;
    } catch (e) {
      logger.warn(
        { error: e, designId: payload.designId },
        "Render failed, using fallback SVG preview",
      );
      return this.generatePreviewImageFallback(payload);
    }
  }

  private generatePreviewImageFallback(payload: {
    amount: number;
    name: string;
    code: string;
  }): string {
    const amount = Number(payload.amount);
    const name = String(payload.name ?? "");
    const code = String(payload.code ?? "PREVIEW");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">
      <rect width="400" height="250" fill="#f8fafc"/>
      <text x="20" y="30" font-family="sans-serif" font-size="16" fill="#0f172a">Gift Card Preview</text>
      <text x="20" y="55" font-family="sans-serif" font-size="12" fill="#0f172a">Amount: $${amount}</text>
      <text x="20" y="75" font-family="sans-serif" font-size="12" fill="#0f172a">From: ${escapeXml(name || "—")}</text>
      <text x="20" y="95" font-family="sans-serif" font-size="12" fill="#0f172a">Code: ${escapeXml(code)}</text>
      <text x="20" y="130" font-family="sans-serif" font-size="14" font-weight="bold" fill="#dc2626">PREVIEW - NOT A REAL CARD</text>
    </svg>`;
    const base64 = Buffer.from(svg, "utf-8").toString("base64");
    return `data:image/svg+xml;base64,${base64}`;
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

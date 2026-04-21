import { createHmac, timingSafeEqual } from "node:crypto";

import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  ApiRequest,
  ApiResponse,
  ConnectedAppData,
  ConnectedAppError,
  ConnectedAppResponse,
  ConnectedOauthAppTokens,
  IConnectedAppProps,
  IConnectedAppWithWebhook,
  IOAuthConnectedApp,
  IPaymentProcessor,
  Payment,
  PaymentFee,
} from "@timelish/types";
import { decrypt, encrypt, getAdminUrl } from "@timelish/utils";
import { SQUARE_APP_NAME } from "./const";
import {
  SquareFormProps,
  SquareMerchantData,
  squareMerchantDataSchema,
  squarePayRequestSchema,
} from "./models";
import { SquareAdminAllKeys } from "./translations/types";
import {
  isSquareSandbox,
  SQUARE_API_VERSION,
  squareApiBaseUrl,
  squareOAuthAuthorizeUrl,
  squareOAuthTokenUrl,
} from "./urls";

/** Square `Payment.processing_fee` entries use `amount_money` (minor units). */
type SquarePaymentProcessingFees = {
  processing_fee?: Array<{
    amount_money?: { amount?: bigint | number | string };
    type?: string;
  }>;
};

type SquareWebhookSubscription = {
  id?: string;
  name?: string;
  enabled?: boolean;
  event_types?: string[];
  notification_url?: string;
  signature_key?: string;
};

function verifySquareWebhookSignature(
  signatureKey: string,
  notificationUrl: string,
  requestBody: string,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader) {
    return false;
  }
  const hmac = createHmac("sha256", signatureKey);
  hmac.update(notificationUrl + requestBody);
  const digest = hmac.digest("base64");
  try {
    const a = Buffer.from(digest, "utf8");
    const b = Buffer.from(signatureHeader, "utf8");
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function parsePaymentUpdatedWebhook(body: unknown): {
  merchantId?: string;
  payment?: SquarePaymentProcessingFees & { id?: string };
} | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  const root = body as Record<string, unknown>;
  if (root.type !== "payment.updated") {
    return null;
  }
  const merchantId =
    typeof root.merchant_id === "string" ? root.merchant_id : undefined;
  const data = root.data;
  if (!data || typeof data !== "object") {
    return null;
  }
  const d = data as Record<string, unknown>;
  const obj = d.object;
  if (!obj || typeof obj !== "object") {
    return null;
  }
  const o = obj as Record<string, unknown>;
  const payment = o.payment;
  if (!payment || typeof payment !== "object") {
    return null;
  }
  return {
    merchantId,
    payment: payment as SquarePaymentProcessingFees & { id?: string },
  };
}

class SquareConnectedApp
  implements
    IOAuthConnectedApp<SquareMerchantData>,
    IPaymentProcessor,
    IConnectedAppWithWebhook<SquareMerchantData>
{
  protected readonly loggerFactory: LoggerFactory;

  public constructor(protected readonly props: IConnectedAppProps) {
    this.loggerFactory = getLoggerFactory(
      "SquareConnectedApp",
      props.organizationId,
    );
  }

  public async getLoginUrl(appId: string): Promise<string> {
    const logger = this.loggerFactory("getLoginUrl");
    const clientId = process.env.SQUARE_APP_APPLICATION_ID;
    if (!clientId) {
      logger.error("Missing SQUARE_APP_APPLICATION_ID");
      throw new ConnectedAppError(
        "app_square_admin.statusText.missing_oauth_config" satisfies SquareAdminAllKeys,
      );
    }

    // Square allows space or "+" between scopes; `URLSearchParams` encodes literal "+" as "%2B",
    // which Square rejects—use spaces so delimiters become "%20" (or "+" per UA rules for space).
    const scope = [
      "MERCHANT_PROFILE_READ",
      "PAYMENTS_READ",
      "PAYMENTS_WRITE",
    ].join(" ");
    const authUrl = new URL(squareOAuthAuthorizeUrl());
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("state", appId);
    if (!isSquareSandbox()) {
      authUrl.searchParams.set("session", "false");
    }

    logger.debug({ appId }, "Built Square OAuth authorize URL");
    return authUrl.toString();
  }

  public async processRedirect(
    request: ApiRequest,
  ): Promise<ConnectedAppResponse> {
    const logger = this.loggerFactory("processRedirect");

    try {
      const url = new URL(request.url);
      const appId = url.searchParams.get("state") as string;
      const denied = url.searchParams.get("error");

      if (denied === "access_denied") {
        return {
          appId,
          error:
            "app_square_admin.statusText.access_denied" satisfies SquareAdminAllKeys,
        };
      }

      const code = url.searchParams.get("code") as string;

      if (!appId) {
        throw new ConnectedAppError(
          "app_square_admin.statusText.redirect_missing_app_id" satisfies SquareAdminAllKeys,
        );
      }

      if (!code) {
        throw new ConnectedAppError(
          "app_square_admin.statusText.redirect_missing_code" satisfies SquareAdminAllKeys,
        );
      }

      const clientId = process.env.SQUARE_APP_APPLICATION_ID;
      const clientSecret = process.env.SQUARE_APP_APPLICATION_SECRET;
      if (!clientId || !clientSecret) {
        throw new ConnectedAppError(
          "app_square_admin.statusText.missing_oauth_config" satisfies SquareAdminAllKeys,
        );
      }

      const tokenRes = await fetch(squareOAuthTokenUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Square-Version": SQUARE_API_VERSION,
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
        }),
      });

      const tokenJson = (await tokenRes.json()) as Record<string, unknown>;

      if (!tokenRes.ok || tokenJson.errors) {
        logger.error(
          { status: tokenRes.status, tokenJson },
          "Square ObtainToken failed",
        );
        throw new ConnectedAppError(
          "app_square_admin.statusText.oauth_error" satisfies SquareAdminAllKeys,
        );
      }

      const accessToken = tokenJson.access_token as string | undefined;
      const refreshToken = tokenJson.refresh_token as string | undefined;
      const expiresAtRaw = tokenJson.expires_at as string | undefined;
      const merchantId = tokenJson.merchant_id as string | undefined;

      if (!accessToken || !refreshToken || !expiresAtRaw || !merchantId) {
        logger.error(
          {
            hasAccess: !!accessToken,
            hasRefresh: !!refreshToken,
            hasExpiry: !!expiresAtRaw,
            hasMerchant: !!merchantId,
          },
          "Square ObtainToken response incomplete",
        );
        throw new ConnectedAppError(
          "app_square_admin.statusText.not_authorized" satisfies SquareAdminAllKeys,
        );
      }

      const expiresOn = new Date(expiresAtRaw);

      const locationId = await this.fetchPrimaryLocationId(accessToken);
      if (!locationId) {
        throw new ConnectedAppError(
          "app_square_admin.statusText.no_locations" satisfies SquareAdminAllKeys,
        );
      }

      const data: SquareMerchantData = {
        locationId,
        merchantId,
      };

      const parsed = squareMerchantDataSchema.safeParse(data);
      if (!parsed.success) {
        throw new ConnectedAppError(
          "app_square_admin.statusText.no_locations" satisfies SquareAdminAllKeys,
        );
      }

      return {
        appId,
        token: {
          accessToken: encrypt(accessToken),
          refreshToken: encrypt(refreshToken),
          expiresOn,
        },
        data: parsed.data,
        account: {
          username: merchantId,
        },
      };
    } catch (e: unknown) {
      logger.error(
        { url: request.url, error: e instanceof Error ? e.message : String(e) },
        "Square OAuth redirect failed",
      );

      const appId = new URL(request.url).searchParams.get("state") as string;

      return {
        appId,
        error:
          e instanceof ConnectedAppError
            ? e.key
            : ("app_square_admin.statusText.oauth_error" satisfies SquareAdminAllKeys),
        errorArgs: e instanceof ConnectedAppError ? e.args : undefined,
      };
    }
  }

  public getFormProps(
    appData: ConnectedAppData<SquareMerchantData>,
  ): SquareFormProps {
    const applicationId = process.env.SQUARE_APP_APPLICATION_ID;
    if (!applicationId) {
      throw new ConnectedAppError(
        "app_square_admin.statusText.missing_oauth_config" satisfies SquareAdminAllKeys,
      );
    }
    if (!appData.data?.locationId) {
      throw new ConnectedAppError(
        "app_square_admin.statusText.app_not_configured" satisfies SquareAdminAllKeys,
      );
    }

    return {
      applicationId,
      locationId: appData.data.locationId,
      isSandbox: isSquareSandbox(),
    };
  }

  public async afterOAuthConnected(
    appData: ConnectedAppData<SquareMerchantData>,
  ): Promise<void> {
    await this.ensurePaymentUpdatedWebhookSubscription(appData);
  }

  public async unInstall(
    appData: ConnectedAppData<SquareMerchantData>,
  ): Promise<void> {
    const logger = this.loggerFactory("unInstall");
    const subId = appData.data?.webhookSubscriptionId;
    if (!subId) {
      return;
    }
    const appToken = this.getSquareApplicationAccessToken();
    if (!appToken) {
      logger.warn(
        { appId: appData._id },
        "SQUARE_APP_ACCESS_TOKEN missing; cannot delete Square webhook subscription",
      );
      return;
    }
    try {
      const res = await fetch(
        `${squareApiBaseUrl()}/v2/webhooks/subscriptions/${encodeURIComponent(subId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${appToken}`,
            "Square-Version": SQUARE_API_VERSION,
          },
        },
      );
      if (!res.ok) {
        const json = (await res.json()) as { errors?: unknown[] };
        logger.warn(
          { appId: appData._id, status: res.status, json },
          "Square DeleteWebhookSubscription returned non-OK",
        );
      }
    } catch (e: unknown) {
      logger.warn(
        {
          appId: appData._id,
          error: e instanceof Error ? e.message : String(e),
        },
        "Square DeleteWebhookSubscription failed",
      );
    }
  }

  public async processWebhook(
    appData: ConnectedAppData<SquareMerchantData>,
    request: ApiRequest,
  ): Promise<ApiResponse> {
    const logger = this.loggerFactory("processWebhook");

    logger.debug(
      {
        url: request.url,
        method: request.method,
        appId: appData._id,
      },
      "Processing Square webhook",
    );

    if (request.method.toUpperCase() !== "POST") {
      return new Response(null, { status: 405 });
    }

    const rawBody = await request.text();
    const notificationUrl = this.squarePaymentUpdatedWebhookUrl(
      appData.organizationId,
      appData._id,
    );

    const encKey = appData.data?.webhookSignatureKey;
    if (!encKey) {
      logger.warn(
        { appId: appData._id },
        "Missing webhook signature key on app",
      );
      return Response.json(
        { error: "webhook_not_configured" },
        { status: 503 },
      );
    }

    let signatureKey: string;
    try {
      signatureKey = decrypt(encKey);
    } catch (e: unknown) {
      logger.error(
        {
          appId: appData._id,
          error: e instanceof Error ? e.message : String(e),
        },
        "Failed to decrypt Square webhook signature key",
      );
      return Response.json({ error: "webhook_misconfigured" }, { status: 503 });
    }

    const sig =
      request.headers.get("x-square-hmacsha256-signature") ??
      request.headers.get("X-Square-Hmacsha256-Signature");

    if (
      !verifySquareWebhookSignature(signatureKey, notificationUrl, rawBody, sig)
    ) {
      logger.warn(
        { appId: appData._id },
        "Square webhook signature verification failed",
      );
      return Response.json({ error: "invalid_signature" }, { status: 403 });
    }

    logger.debug(
      {
        appId: appData._id,
        notificationUrl,
      },
      "Square webhook signature verification successful",
    );

    let parsedJson: unknown;
    try {
      parsedJson = rawBody.length ? JSON.parse(rawBody) : null;
    } catch {
      logger.warn({ appId: appData._id }, "Square webhook body is not JSON");
      return Response.json({ error: "invalid_body" }, { status: 400 });
    }

    const paymentEvent = parsePaymentUpdatedWebhook(parsedJson);
    if (!paymentEvent) {
      logger.warn(
        { appId: appData._id },
        "Square webhook payment event is not valid",
      );

      return Response.json({ ok: true });
    }

    if (
      paymentEvent.merchantId &&
      appData.data?.merchantId &&
      paymentEvent.merchantId !== appData.data.merchantId
    ) {
      logger.warn(
        {
          appId: appData._id,
          eventMerchantId: paymentEvent.merchantId,
          appMerchantId: appData.data.merchantId,
        },
        "Square webhook merchant_id mismatch",
      );
      return Response.json({ error: "merchant_mismatch" }, { status: 403 });
    }

    logger.debug(
      {
        appId: appData._id,
        paymentEvent,
      },
      "Square webhook payment event",
    );

    const squarePaymentId = paymentEvent.payment?.id;
    if (!squarePaymentId || !paymentEvent.payment) {
      logger.warn(
        { appId: appData._id },
        "Square webhook payment event is not valid",
      );
      return Response.json({ ok: true });
    }

    const fees = this.processingFeesFromSquarePayment(paymentEvent.payment);
    if (!fees.length) {
      logger.debug(
        { appId: appData._id },
        "Square webhook payment event has no fees",
      );
      return Response.json({ ok: true });
    }

    logger.debug(
      {
        appId: appData._id,
        fees,
      },
      "Square webhook fees",
    );

    await this.applyFeeUpdatesFromWebhook(squarePaymentId, fees);
    logger.debug(
      {
        appId: appData._id,
        squarePaymentId,
      },
      "Square webhook fees applied successfully",
    );

    return Response.json({ ok: true });
  }

  public async processAppCall(
    appData: ConnectedAppData<SquareMerchantData>,
    slug: string[],
    request: ApiRequest,
  ): Promise<ApiResponse | undefined> {
    const logger = this.loggerFactory("processAppCall");

    if (
      slug.length === 1 &&
      slug[0] === "pay" &&
      request.method.toUpperCase() === "POST"
    ) {
      try {
        logger.debug(
          {
            appId: appData._id,
            slug,
            method: request.method,
          },
          "Square pay handler",
        );

        const body = await request.json();
        const parsed = squarePayRequestSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { success: false, error: parsed.error.message },
            {
              status: 400,
            },
          );
        }

        return await this.createPaymentFromSource(
          appData,
          parsed.data.paymentIntentId,
          parsed.data.sourceId,
        );
      } catch (error: unknown) {
        logger.error(
          {
            appId: appData._id,
            error: error instanceof Error ? error.message : error,
          },
          "Square pay handler error",
        );
        throw error;
      }
    }

    return undefined;
  }

  protected async createPaymentFromSource(
    appData: ConnectedAppData<SquareMerchantData>,
    paymentIntentId: string,
    sourceId: string,
  ): Promise<ApiResponse> {
    const logger = this.loggerFactory("createPaymentFromSource");

    const intent =
      await this.props.services.paymentsService.getIntent(paymentIntentId);
    if (!intent) {
      return Response.json({ error: "intent_not_found" }, { status: 400 });
    }

    if (!appData.data?.locationId) {
      return Response.json({ error: "square_not_configured" }, { status: 400 });
    }

    const accessToken = await this.getMerchantAccessToken(appData);

    const { currency } =
      await this.props.services.configurationService.getConfiguration(
        "general",
      );

    const amountCents = Math.round(intent.amount * 100);

    const idempotencyKey = crypto.randomUUID();

    logger.debug(
      {
        appId: appData._id,
        paymentIntentId,
        sourceId,
      },
      "Square create payment from source",
    );

    const paymentRes = await fetch(`${squareApiBaseUrl()}/v2/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Square-Version": SQUARE_API_VERSION,
      },
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        source_id: sourceId,
        amount_money: {
          amount: amountCents,
          currency,
        },
        location_id: appData.data.locationId,
        reference_id: intent._id,
      }),
    });

    const paymentJson = (await paymentRes.json()) as {
      payment?: SquarePaymentProcessingFees & {
        id?: string;
        status?: string;
      };
      errors?: { detail?: string; code?: string }[];
    };

    if (!paymentRes.ok || paymentJson.errors?.length) {
      logger.error(
        {
          appId: appData._id,
          status: paymentRes.status,
          errors: paymentJson.errors,
        },
        "Square CreatePayment failed",
      );

      await this.props.services.paymentsService.updateIntent(intent._id, {
        status: "failed",
      });

      return Response.json(
        {
          success: false,
          error: paymentJson.errors?.[0]?.detail ?? "create_payment_failed",
        },
        { status: paymentRes.status || 400 },
      );
    }

    const payment = paymentJson.payment;
    const status = payment?.status;
    const ok = status === "COMPLETED" || status === "APPROVED";
    logger.debug(
      {
        appId: appData._id,
        paymentIntentId,
        sourceId,
        status,
        ok,
      },
      "Square create payment from source completed",
    );

    if (!payment?.id || !ok) {
      logger.error({ payment }, "Square payment not in a success state");
      await this.props.services.paymentsService.updateIntent(intent._id, {
        status: "failed",
      });
      return Response.json(
        {
          success: false,
          error: "payment_incomplete",
        },
        { status: 400 },
      );
    }

    // Prefer GET /v2/payments/{id} (with short retries); fall back to CreatePayment body; webhook can still refine later.
    const feesFromCreate = payment
      ? this.processingFeesFromSquarePayment(payment)
      : [];

    logger.debug(
      {
        appId: appData._id,
        paymentId: payment?.id,
      },
      "Square checking fees from create",
    );

    const feesFromGet = await this.fetchProcessingFeesForPayment(
      accessToken,
      payment.id,
      appData._id,
    );

    const fees =
      feesFromGet.length > 0
        ? feesFromGet
        : feesFromCreate.length > 0
          ? feesFromCreate
          : undefined;

    logger.debug(
      {
        appId: appData._id,
        paymentId: payment?.id,
        fees,
      },
      "Square fees",
    );

    await this.props.services.paymentsService.updateIntent(intent._id, {
      status: "paid",
      externalId: payment.id,
      fees,
    });

    logger.debug(
      {
        appId: appData._id,
        paymentId: payment?.id,
      },
      "Square payment updated intent successfully",
    );

    return Response.json({ success: true, payment });
  }

  public async refundPayment(
    appData: ConnectedAppData<SquareMerchantData>,
    payment: Payment,
    amount: number,
  ): Promise<{ success: boolean; error?: string }> {
    const logger = this.loggerFactory("refundPayment");

    if (
      payment.method !== "online" ||
      (payment as { appName?: string }).appName !== SQUARE_APP_NAME ||
      !(payment as { externalId?: string }).externalId
    ) {
      logger.debug(
        {
          appId: appData._id,
          paymentId: payment._id,
          appName: (payment as { appName?: string }).appName,
        },
        "Square refund payment not supported",
      );

      return { success: false, error: "not_supported" };
    }

    const externalId = (payment as { externalId: string }).externalId;

    logger.debug(
      {
        appId: appData._id,
        externalId,
      },
      "Square refund payment external ID",
    );

    try {
      const accessToken = await this.getMerchantAccessToken(appData);
      const { currency } =
        await this.props.services.configurationService.getConfiguration(
          "general",
        );

      const amountCents = Math.round(amount * 100);
      const idempotencyKey = `refund-${payment._id}-${amountCents}`.slice(
        0,
        45,
      );

      logger.debug(
        {
          appId: appData._id,
          externalId,
          amountCents,
          idempotencyKey,
        },
        "Square refund payment",
      );

      const res = await fetch(`${squareApiBaseUrl()}/v2/refunds`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Square-Version": SQUARE_API_VERSION,
        },
        body: JSON.stringify({
          idempotency_key: idempotencyKey,
          payment_id: externalId,
          amount_money: {
            amount: amountCents,
            currency,
          },
          reason: "REQUESTED_BY_CUSTOMER",
        }),
      });

      const json = (await res.json()) as {
        refund?: { status?: string };
        errors?: { detail?: string }[];
      };

      if (!res.ok || json.errors?.length) {
        logger.error(
          { paymentId: payment._id, status: res.status, json },
          "Square refund failed",
        );
        return {
          success: false,
          error: json.errors?.[0]?.detail ?? "refund_failed",
        };
      }

      logger.debug(
        {
          appId: appData._id,
          externalId,
        },
        "Square refund payment completed successfully",
      );

      return { success: true };
    } catch (e: unknown) {
      logger.error(
        {
          paymentId: payment._id,
          error: e instanceof Error ? e.message : String(e),
        },
        "Square refund error",
      );
      return { success: false, error: "refund_error" };
    }
  }

  protected getSquareApplicationAccessToken(): string | null {
    const t = process.env.SQUARE_APP_ACCESS_TOKEN?.trim();
    return t && t.length > 0 ? t : null;
  }

  protected squarePaymentUpdatedWebhookUrl(
    organizationId: string,
    appId: string,
  ): string {
    const base = getAdminUrl().replace(/\/+$/, "");
    return `${base}/apps/${organizationId}/${appId}/webhook`;
  }

  /** Square subscription `name` max length 64; includes org and connected app id. */
  protected squarePaymentUpdatedWebhookName(
    organizationId: string,
    appId: string,
  ): string {
    const raw = `Square payments org:${organizationId} app:${appId}`;
    return raw.length > 64 ? raw.slice(0, 64) : raw;
  }

  protected async listAllWebhookSubscriptions(
    appToken: string,
  ): Promise<SquareWebhookSubscription[] | null> {
    const out: SquareWebhookSubscription[] = [];
    let cursor: string | undefined;
    do {
      const u = new URL(`${squareApiBaseUrl()}/v2/webhooks/subscriptions`);
      if (cursor) {
        u.searchParams.set("cursor", cursor);
      }
      u.searchParams.set("limit", "100");
      const res = await fetch(u.toString(), {
        headers: {
          Authorization: `Bearer ${appToken}`,
          "Square-Version": SQUARE_API_VERSION,
        },
      });
      const json = (await res.json()) as {
        subscriptions?: SquareWebhookSubscription[];
        cursor?: string;
        errors?: unknown[];
      };
      if (!res.ok || json.errors?.length) {
        return null;
      }
      if (json.subscriptions?.length) {
        out.push(...json.subscriptions);
      }
      cursor = json.cursor || undefined;
    } while (cursor);
    return out;
  }

  protected async persistWebhookSubscriptionData(
    appData: ConnectedAppData<SquareMerchantData>,
    subscriptionId: string,
    signatureKeyPlain: string,
  ): Promise<void> {
    const logger = this.loggerFactory("persistWebhookSubscriptionData");
    const merged = {
      ...appData.data,
      webhookSubscriptionId: subscriptionId,
      webhookSignatureKey: encrypt(signatureKeyPlain),
    };
    const parsed = squareMerchantDataSchema.safeParse(merged);
    if (!parsed.success) {
      logger.error(
        { appId: appData._id, issues: parsed.error.issues },
        "Merged Square merchant data failed validation",
      );
      return;
    }

    await this.props.update({ data: parsed.data });

    logger.debug(
      {
        appId: appData._id,
        subscriptionId,
      },
      "Square webhook subscription data persisted successfully",
    );
  }

  protected async applyFeeUpdatesFromWebhook(
    squarePaymentId: string,
    fees: PaymentFee[],
  ): Promise<void> {
    const logger = this.loggerFactory("applyFeeUpdatesFromWebhook");
    const ps = this.props.services.paymentsService;
    const payment = await ps.getPaymentByExternalId(squarePaymentId);
    logger.debug(
      {
        appId: this.props.organizationId,
        squarePaymentId,
        fees,
      },
      "Square webhook fees",
    );

    if (payment?.fees?.length === fees.length) {
      const a = JSON.stringify(payment.fees);
      const b = JSON.stringify(fees);
      if (a === b) {
        logger.debug(
          {
            appId: this.props.organizationId,
            squarePaymentId,
            fees,
          },
          "Square webhook fees are the same, skipping update",
        );
        return;
      }
    }

    logger.debug(
      {
        appId: this.props.organizationId,
        squarePaymentId,
        fees,
      },
      "Square webhook fees are different, updating payment",
    );

    if (payment) {
      await ps.updatePayment(payment._id, { fees }, { actor: "system" });
      logger.debug(
        {
          appId: this.props.organizationId,
          squarePaymentId,
          fees,
        },
        "Square webhook fees updated successfully",
      );
      return;
    }

    const intent = await ps.getIntentByExternalId(squarePaymentId);
    if (intent) {
      logger.debug(
        {
          appId: this.props.organizationId,
          squarePaymentId,
          fees,
        },
        "Square webhook intent found",
      );

      if (intent.fees?.length === fees.length) {
        const a = JSON.stringify(intent.fees);
        const b = JSON.stringify(fees);
        if (a === b) {
          logger.debug(
            {
              appId: this.props.organizationId,
              squarePaymentId,
              fees,
            },
            "Square webhook fees are the same, skipping update",
          );
          return;
        }
      }

      await ps.updateIntent(intent._id, { fees });
      logger.debug(
        {
          appId: this.props.organizationId,
          squarePaymentId,
          fees,
        },
        "Square webhook intent updated successfully",
      );
    }
  }

  protected async ensurePaymentUpdatedWebhookSubscription(
    appData: ConnectedAppData<SquareMerchantData>,
  ): Promise<void> {
    const logger = this.loggerFactory(
      "ensurePaymentUpdatedWebhookSubscription",
    );

    logger.debug(
      {
        appId: appData._id,
      },
      "Ensuring Square payment updated webhook subscription",
    );

    const appToken = this.getSquareApplicationAccessToken();
    if (!appToken) {
      logger.warn(
        { appId: appData._id },
        "SQUARE_APP_ACCESS_TOKEN is not set; skipping Square webhook subscription (add Sandbox/Production access token from Square Developer → your application)",
      );
      return;
    }

    const notificationUrl = this.squarePaymentUpdatedWebhookUrl(
      appData.organizationId,
      appData._id,
    );
    const name = this.squarePaymentUpdatedWebhookName(
      appData.organizationId,
      appData._id,
    );

    logger.debug(
      {
        appId: appData._id,
        notificationUrl,
        name,
      },
      "Square payment updated webhook subscription",
    );

    const all = await this.listAllWebhookSubscriptions(appToken);
    if (!all) {
      logger.error(
        { appId: appData._id },
        "Square ListWebhookSubscriptions failed",
      );
      return;
    }

    const existing = all.find((s) => s.notification_url === notificationUrl);

    // Update does not return a new `signature_key`; delete and recreate so we always persist a key from Create.
    if (existing?.id) {
      logger.debug(
        {
          appId: appData._id,
          subscriptionId: existing.id,
        },
        "Square existing webhook subscription found",
      );

      const delRes = await fetch(
        `${squareApiBaseUrl()}/v2/webhooks/subscriptions/${encodeURIComponent(existing.id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${appToken}`,
            "Square-Version": SQUARE_API_VERSION,
          },
        },
      );
      if (!delRes.ok) {
        const errJson = (await delRes.json().catch(() => ({}))) as {
          errors?: unknown[];
        };
        logger.error(
          {
            appId: appData._id,
            status: delRes.status,
            errJson,
            subscriptionId: existing.id,
          },
          "Square DeleteWebhookSubscription failed (cannot recreate without removing existing)",
        );
        return;
      }
      logger.debug(
        { appId: appData._id, subscriptionId: existing.id },
        "Removed existing Square webhook subscription for recreate",
      );
    }

    const createRes = await fetch(
      `${squareApiBaseUrl()}/v2/webhooks/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${appToken}`,
          "Content-Type": "application/json",
          "Square-Version": SQUARE_API_VERSION,
        },
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID().replace(/-/g, "").slice(0, 45),
          subscription: {
            name,
            enabled: true,
            event_types: ["payment.updated"],
            notification_url: notificationUrl,
            api_version: SQUARE_API_VERSION,
          },
        }),
      },
    );

    const createJson = (await createRes.json()) as {
      subscription?: SquareWebhookSubscription;
      errors?: { detail?: string }[];
    };

    if (
      !createRes.ok ||
      createJson.errors?.length ||
      !createJson.subscription?.id
    ) {
      logger.error(
        {
          appId: appData._id,
          status: createRes.status,
          errors: createJson.errors,
        },
        "Square CreateWebhookSubscription failed",
      );
      return;
    }

    logger.debug(
      {
        appId: appData._id,
        subscription: createJson.subscription,
      },
      "Square created webhook subscription",
    );

    const sub = createJson.subscription;
    if (!sub.id || !sub.signature_key) {
      logger.error(
        { appId: appData._id },
        "Square CreateWebhookSubscription missing id or signature_key",
      );
      return;
    }

    await this.persistWebhookSubscriptionData(
      appData,
      sub.id,
      sub.signature_key,
    );
    logger.debug(
      {
        appId: appData._id,
        subscriptionId: sub.id,
      },
      "Square webhook subscription data persisted",
    );
  }

  /**
   * Retrieves `processing_fee` from GET /v2/payments/{id} (often absent on create response).
   * Retries when the call succeeds but `processing_fee` is still empty (Square eventual consistency).
   */
  protected async fetchProcessingFeesForPayment(
    accessToken: string,
    paymentId: string,
    appId: string,
  ): Promise<PaymentFee[]> {
    const logger = this.loggerFactory("fetchProcessingFeesForPayment");
    const maxAttempts = 4;
    const delayMs = 500;

    logger.debug(
      {
        appId: appId,
        paymentId,
      },
      "Fetching Square processing fees for payment",
    );

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      logger.debug(
        {
          appId: appId,
          paymentId,
          attempt,
        },
        "Square processing fees fetch attempt",
      );

      const res = await fetch(
        `${squareApiBaseUrl()}/v2/payments/${encodeURIComponent(paymentId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Square-Version": SQUARE_API_VERSION,
          },
        },
      );

      const json = (await res.json()) as {
        payment?: SquarePaymentProcessingFees;
        errors?: { detail?: string; code?: string }[];
      };

      if (!res.ok || json.errors?.length || !json.payment) {
        logger.warn(
          {
            appId,
            paymentId,
            status: res.status,
            errors: json.errors,
            attempt,
          },
          "Square GetPayment failed or missing body; continuing without fee breakdown from GET",
        );
        return [];
      }

      logger.debug(
        {
          appId: appId,
          paymentId,
          attempt,
        },
        "Square GetPayment succeeded",
      );

      const fees = this.processingFeesFromSquarePayment(json.payment);
      if (fees.length > 0) {
        if (attempt > 0) {
          logger.debug(
            { appId, paymentId, attempt },
            "Square processing_fee populated after retry",
          );
        }

        logger.debug(
          {
            appId: appId,
            paymentId,
            attempt,
            fees,
          },
          "Square processing fees",
        );

        return fees;
      }

      logger.debug(
        { appId, paymentId, attempt },
        "Square GetPayment succeeded but processing_fee empty; will retry if attempts remain",
      );
    }

    logger.debug(
      { appId, paymentId, attempts: maxAttempts },
      "Square processing_fee still empty after retries",
    );
    return [];
  }

  protected processingFeesFromSquarePayment(
    payment: SquarePaymentProcessingFees,
  ): PaymentFee[] {
    if (!payment.processing_fee?.length) {
      return [];
    }

    let totalMinor = 0;
    for (const fee of payment.processing_fee) {
      const raw = fee.amount_money?.amount;
      if (raw == null) continue;
      const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
      if (Number.isNaN(n) || n <= 0) continue;
      totalMinor += n;
    }

    if (totalMinor <= 0) {
      return [];
    }

    return [{ type: "transaction", amount: totalMinor / 100 }];
  }

  protected async fetchPrimaryLocationId(
    accessToken: string,
  ): Promise<string | null> {
    const logger = this.loggerFactory("fetchPrimaryLocationId");
    logger.debug("Fetching Square primary location ID");

    const res = await fetch(`${squareApiBaseUrl()}/v2/locations`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Square-Version": SQUARE_API_VERSION,
      },
    });

    const json = (await res.json()) as {
      locations?: { id?: string; status?: string }[];
      errors?: unknown[];
    };

    if (!res.ok || !json.locations?.length) {
      logger.warn("Square FetchPrimaryLocationId failed");

      return null;
    }

    const active =
      json.locations.find((l) => l.status === "ACTIVE") ?? json.locations[0];

    logger.debug(
      {
        locationId: active?.id,
      },
      "Square primary location ID found",
    );

    return active?.id ?? null;
  }

  protected async getMerchantAccessToken(
    appData: ConnectedAppData<SquareMerchantData>,
  ): Promise<string> {
    const logger = this.loggerFactory("getMerchantAccessToken");
    const token = appData.token as ConnectedOauthAppTokens | undefined;

    logger.debug(
      {
        appId: appData._id,
      },
      "Getting Square merchant access token",
    );

    if (!token?.accessToken || !token.refreshToken) {
      throw new ConnectedAppError(
        "app_square_admin.statusText.app_not_configured" satisfies SquareAdminAllKeys,
      );
    }

    const expiresOn =
      token.expiresOn instanceof Date
        ? token.expiresOn
        : token.expiresOn
          ? new Date(token.expiresOn as unknown as string)
          : null;

    if (expiresOn && expiresOn.getTime() > Date.now() + 60_000) {
      logger.debug(
        { appId: appData._id },
        "Square OAuth access token is still valid",
      );

      return decrypt(token.accessToken);
    }

    logger.debug(
      { appId: appData._id },
      "Refreshing Square OAuth access token",
    );

    const clientId = process.env.SQUARE_APP_APPLICATION_ID;
    const clientSecret = process.env.SQUARE_APP_APPLICATION_SECRET;
    if (!clientId || !clientSecret) {
      throw new ConnectedAppError(
        "app_square_admin.statusText.missing_oauth_config" satisfies SquareAdminAllKeys,
      );
    }

    const refreshPlain = decrypt(token.refreshToken);

    const res = await fetch(squareOAuthTokenUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Square-Version": SQUARE_API_VERSION,
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshPlain,
      }),
    });

    const body = (await res.json()) as Record<string, unknown>;

    if (!res.ok || body.errors) {
      throw new ConnectedAppError(
        "app_square_admin.statusText.token_refresh_failed" satisfies SquareAdminAllKeys,
      );
    }

    logger.debug(
      {
        appId: appData._id,
      },
      "Square OAuth access token refreshed",
    );

    const accessToken = body.access_token as string | undefined;
    const refreshToken =
      (body.refresh_token as string | undefined) ?? refreshPlain;
    const expiresAtRaw = body.expires_at as string | undefined;

    if (!accessToken || !expiresAtRaw) {
      throw new ConnectedAppError(
        "app_square_admin.statusText.token_refresh_failed" satisfies SquareAdminAllKeys,
      );
    }

    const nextToken: ConnectedOauthAppTokens = {
      accessToken: encrypt(accessToken),
      refreshToken: encrypt(refreshToken),
      expiresOn: new Date(expiresAtRaw),
    };

    await this.props.update({
      token: nextToken,
    });

    logger.debug(
      {
        appId: appData._id,
      },
      "Square OAuth access token updated",
    );

    return accessToken;
  }
}

export default SquareConnectedApp;

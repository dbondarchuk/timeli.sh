import { renderToStaticMarkup } from "@timelish/email-builder/static";
import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  ApiRequest,
  ApiResponse,
  Appointment,
  ConnectedAppData,
  ConnectedAppRequestError,
  ConnectedAppStatusWithText,
  DemoArguments,
  ICommunicationTemplatesProvider,
  IConnectedApp,
  IConnectedAppProps,
  IDemoArgumentsProvider,
  TemplateTemplatesList,
} from "@timelish/types";
import {
  getAdminUrl,
  getArguments,
  getWebsiteUrl,
  templateSafeWithError,
} from "@timelish/utils";
import { createHmac, randomInt, randomUUID } from "node:crypto";
import {
  MY_CABINET_OTP_MAX_REQUESTS,
  MY_CABINET_OTP_RESEND_COOLDOWN_SECONDS,
  MY_CABINET_OTP_TTL_SECONDS,
  MY_CABINET_SESSION_COOKIE,
} from "./const";
import { demoOtpArguments } from "./demo-arguments";
import { myCabinetConfigurationSchema } from "./models";
import { MyCabinetTemplates } from "./templates";
import {
  MyCabinetAdminAllKeys,
  MyCabinetAdminKeys,
  MyCabinetAdminNamespace,
} from "./translations/types";

type OtpState = {
  customerId: string;
  channel: "email" | "phone";
  destination: string;
  code: string;
};

const SESSION_TTL_SECONDS = 60 * 60;

export class MyCabinetConnectedApp
  implements
    IConnectedApp,
    IDemoArgumentsProvider,
    ICommunicationTemplatesProvider
{
  protected readonly loggerFactory: LoggerFactory;

  constructor(private readonly props: IConnectedAppProps) {
    this.loggerFactory = getLoggerFactory(
      "MyCabinetConnectedApp",
      props.organizationId,
    );
  }

  public async processRequest(
    appData: ConnectedAppData,
    request: unknown,
  ): Promise<
    ConnectedAppStatusWithText<MyCabinetAdminNamespace, MyCabinetAdminKeys>
  > {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      { appId: appData._id },
      "Processing My Cabinet app configuration request",
    );

    const { data, success, error } =
      myCabinetConfigurationSchema.safeParse(request);

    if (!success) {
      logger.error({ error }, "Invalid My Cabinet app configuration request");
      throw new ConnectedAppRequestError(
        "invalid_my-cabinet_request",
        { request, error },
        400,
        error.message,
      );
    }

    const status: ConnectedAppStatusWithText<
      MyCabinetAdminNamespace,
      MyCabinetAdminKeys
    > = {
      status: "connected",
      statusText:
        "app_my-cabinet_admin.statusText.successfully_set_up" satisfies MyCabinetAdminAllKeys,
    };

    await this.props.update({
      data,
      ...status,
    });

    logger.info(
      {
        appId: appData._id,
        status: status.status,
        allowPhoneLogin: data.allowPhoneLogin,
      },
      "Successfully configured My Cabinet app",
    );

    return status;
  }

  public async getDemoEmailArguments(): Promise<DemoArguments> {
    const logger = this.loggerFactory("getDemoEmailArguments");
    logger.debug({}, "Returning My Cabinet demo email arguments");
    return demoOtpArguments;
  }

  public async getCommunicationTemplates(): Promise<TemplateTemplatesList> {
    const logger = this.loggerFactory("getCommunicationTemplates");
    logger.debug({}, "Returning My Cabinet communication templates");
    return MyCabinetTemplates;
  }

  public async install(appData: ConnectedAppData): Promise<void> {
    const logger = this.loggerFactory("install");
    logger.debug({ appId: appData._id }, "Installing My Cabinet app");

    try {
      const { configurationService, templatesService } = this.props.services;
      const { language } = await configurationService.getConfiguration("brand");

      logger.debug(
        { appId: appData._id, language },
        "Resolved brand language for My Cabinet template installation",
      );

      let otpEmailTemplateId: string | undefined;
      let otpTextTemplateId: string | undefined;

      const getUniqueName = async (
        baseName: string,
      ): Promise<string | null> => {
        for (let i = 0; i < 10; i++) {
          const candidate = i === 0 ? baseName : `${baseName} (${i + 1})`;
          const isUnique = await templatesService.checkUniqueName(candidate);
          if (isUnique) {
            return candidate;
          }
        }

        logger.warn(
          { appId: appData._id, baseName },
          "Could not generate unique template name after 10 attempts",
        );
        return null;
      };

      for (const [id, templatesByLang] of Object.entries(MyCabinetTemplates)) {
        const source = templatesByLang[language] ?? templatesByLang.en;
        if (!source) {
          logger.warn(
            { appId: appData._id, id, language },
            "No source template found for language",
          );
          continue;
        }

        logger.debug(
          { appId: appData._id, id, language, name: source.name },
          "Creating My Cabinet template",
        );

        const uniqueName = await getUniqueName(source.name);
        if (!uniqueName) continue;

        const created = await templatesService.createTemplate({
          ...source,
          name: uniqueName,
        });

        logger.debug(
          {
            appId: appData._id,
            templateId: created._id,
            templateName: created.name,
            id,
          },
          "Created My Cabinet template",
        );

        if (id === "my-cabinet-otp-email") {
          otpEmailTemplateId = created._id;
        } else if (id === "my-cabinet-otp-text") {
          otpTextTemplateId = created._id;
        }
      }

      const currentSettings = (appData.data as
        | {
            otpEmailTemplateId?: string;
            otpTextTemplateId?: string;
            allowPhoneLogin?: boolean;
          }
        | undefined) ?? { allowPhoneLogin: false };

      await this.props.update({
        data: {
          ...currentSettings,
          otpEmailTemplateId:
            otpEmailTemplateId ?? currentSettings.otpEmailTemplateId,
          otpTextTemplateId:
            otpTextTemplateId ?? currentSettings.otpTextTemplateId,
        },
      });

      logger.info(
        {
          appId: appData._id,
          otpEmailTemplateId,
          otpTextTemplateId,
        },
        "My Cabinet settings updated with installed templates",
      );
    } catch (error) {
      logger.error(
        { appId: appData._id, error },
        "Failed to install My Cabinet templates",
      );
    }

    logger.info({ appId: appData._id }, "My Cabinet app installed");
  }

  public async processAppCall(
    appData: ConnectedAppData,
    slug: string[],
    request: ApiRequest,
  ): Promise<ApiResponse> {
    const action = slug.join("/");
    const logger = this.loggerFactory("processAppCall");
    logger.debug(
      { appId: appData._id, action, method: request.method },
      "Processing My Cabinet app call",
    );

    if (request.method === "POST" && action === "cabinet/auth/request-otp") {
      return this.requestOtp(appData, request);
    }

    if (request.method === "POST" && action === "cabinet/auth/verify-otp") {
      return this.verifyOtp(appData, request);
    }

    if (request.method === "POST" && action === "cabinet/auth/logout") {
      return this.logout(request);
    }

    if (request.method === "GET" && action === "cabinet/auth/options") {
      return this.getAuthOptions(appData);
    }

    if (request.method === "GET" && action === "cabinet/appointments") {
      return this.getAppointments(appData, request);
    }

    if (request.method === "GET" && action === "cabinet/appointments/summary") {
      return this.getAppointmentsSummary(appData, request);
    }

    if (
      request.method === "GET" &&
      action === "cabinet/appointments/upcoming"
    ) {
      return this.getUpcomingAppointments(appData, request);
    }

    if (request.method === "GET" && action === "cabinet/appointments/past") {
      return this.getPastAppointments(appData, request);
    }

    if (request.method === "GET" && action === "cabinet/me") {
      return this.getCustomerMe(appData, request);
    }

    if (request.method === "GET" && action === "cabinet/auth/check") {
      return this.checkSession(appData, request);
    }

    const appointmentByIdMatch = action.match(
      /^cabinet\/appointments\/([^/]+)$/,
    );
    if (request.method === "GET" && appointmentByIdMatch) {
      return this.getAppointmentById(appData, request, appointmentByIdMatch[1]);
    }

    logger.warn({ appId: appData._id, action }, "Unknown My Cabinet app call");

    return Response.json(
      { success: false, error: "not_found" },
      { status: 404 },
    );
  }

  private async requestOtp(
    appData: ConnectedAppData,
    request: Request,
  ): Promise<Response> {
    const logger = this.loggerFactory("requestOtp");
    const body = (await request.json()) as { email?: string; phone?: string };
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim();
    const channel = email ? "email" : phone ? "phone" : null;

    logger.debug(
      { appId: appData._id, hasEmail: !!email, hasPhone: !!phone, channel },
      "Received OTP request payload",
    );

    if (!channel) {
      logger.warn(
        { appId: appData._id },
        "Missing email/phone for OTP request",
      );
      return Response.json(
        { success: false, error: "email_or_phone_required" },
        { status: 400 },
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const destination = channel === "email" ? email! : phone!;
    const rateAllowed = await this.consumeRateLimit(
      appData._id,
      `${ip}:${destination}`,
      "otp-request",
      MY_CABINET_OTP_MAX_REQUESTS,
      MY_CABINET_OTP_RESEND_COOLDOWN_SECONDS,
    );

    if (!rateAllowed) {
      logger.warn(
        { appId: appData._id, channel, destination },
        "OTP request rate limit exceeded",
      );

      return Response.json(
        { success: false, error: "too_many_requests" },
        { status: 429 },
      );
    }

    logger.debug(
      { appId: appData._id, channel, destination },
      "OTP request rate limit check passed",
    );

    const customer =
      await this.props.services.customersService.findCustomerBySearchField(
        destination,
        channel,
      );

    if (!customer) {
      logger.debug(
        { appId: appData._id, channel, destination },
        "Customer not found for OTP request",
      );

      return Response.json({
        success: true,
        otpExpiresAt: Date.now() + MY_CABINET_OTP_TTL_SECONDS * 1000,
        resendAfter: Date.now() + MY_CABINET_OTP_RESEND_COOLDOWN_SECONDS * 1000,
      });
    }

    const code = randomInt(100000, 999999).toString();
    const otpState: OtpState = {
      customerId: customer._id,
      channel,
      destination,
      code,
    };

    await this.props.services.redisClient.set(
      this.getOtpKey(appData._id, destination, channel),
      JSON.stringify(otpState),
      "EX",
      MY_CABINET_OTP_TTL_SECONDS,
    );

    logger.debug(
      {
        appId: appData._id,
        channel,
        destination,
        ttlSeconds: MY_CABINET_OTP_TTL_SECONDS,
      },
      "Stored OTP in Redis",
    );

    const appConfig = appData.data as
      | { otpEmailTemplateId?: string; otpTextTemplateId?: string }
      | undefined;

    const [config, organization] = await Promise.all([
      this.props.services.configurationService.getConfigurations(
        "booking",
        "general",
        "brand",
        "social",
      ),
      this.props.services.organizationService.getOrganization(),
    ]);

    logger.debug(
      { appId: appData._id, organizationSlug: organization?.slug },
      "Fetched config and organization for template args",
    );

    const args = getArguments({
      customer,
      config,
      adminUrl: getAdminUrl(),
      websiteUrl: getWebsiteUrl(organization?.slug, organization?.domain),
      additionalProperties: { otp: code },
    });

    if (channel === "email") {
      const templateId = appConfig?.otpEmailTemplateId;
      if (!templateId) {
        logger.warn(
          { appId: appData._id },
          "OTP email template is not configured",
        );

        return Response.json({
          success: true,
          otpExpiresAt: Date.now() + MY_CABINET_OTP_TTL_SECONDS * 1000,
          resendAfter:
            Date.now() + MY_CABINET_OTP_RESEND_COOLDOWN_SECONDS * 1000,
        });
      }

      const template =
        await this.props.services.templatesService.getTemplate(templateId);

      if (!template || template.type !== "email") {
        logger.warn(
          { appId: appData._id, templateId },
          "OTP email template not found or invalid",
        );

        return Response.json({
          success: true,
          otpExpiresAt: Date.now() + MY_CABINET_OTP_TTL_SECONDS * 1000,
          resendAfter:
            Date.now() + MY_CABINET_OTP_RESEND_COOLDOWN_SECONDS * 1000,
        });
      }

      const subject = templateSafeWithError(template.subject, args, true);

      const body = await renderToStaticMarkup({
        document: template.value,
        args,
      });

      await this.props.services.notificationService.sendEmail({
        email: {
          to: customer.email,
          subject,
          body,
        },
        handledBy:
          "app_my-cabinet_admin.handlers.otp" satisfies MyCabinetAdminAllKeys,
        participantType: "customer",
        customerId: customer._id,
      });

      logger.debug(
        { appId: appData._id, customerId: customer._id, templateId },
        "Queued OTP email notification",
      );
    } else if (customer.phone) {
      const templateId = appConfig?.otpTextTemplateId;
      if (!templateId) {
        logger.warn(
          { appId: appData._id },
          "OTP text template is not configured",
        );

        return Response.json({
          success: true,
          otpExpiresAt: Date.now() + MY_CABINET_OTP_TTL_SECONDS * 1000,
          resendAfter:
            Date.now() + MY_CABINET_OTP_RESEND_COOLDOWN_SECONDS * 1000,
        });
      }

      const template =
        await this.props.services.templatesService.getTemplate(templateId);

      if (!template || template.type !== "text-message") {
        logger.warn(
          { appId: appData._id, templateId },
          "OTP text template not found or invalid",
        );

        return Response.json({
          success: true,
          otpExpiresAt: Date.now() + MY_CABINET_OTP_TTL_SECONDS * 1000,
          resendAfter:
            Date.now() + MY_CABINET_OTP_RESEND_COOLDOWN_SECONDS * 1000,
        });
      }

      await this.props.services.notificationService.sendTextMessage({
        phone: customer.phone,
        body: templateSafeWithError(template.value as string, args, true),
        handledBy:
          "app_my-cabinet_admin.handlers.otp" satisfies MyCabinetAdminAllKeys,
        participantType: "customer",
        customerId: customer._id,
      });

      logger.debug(
        { appId: appData._id, customerId: customer._id, templateId },
        "Queued OTP text notification",
      );
    }

    logger.info(
      { appId: appData._id, customerId: customer._id, channel },
      "OTP sent successfully",
    );

    return Response.json({
      success: true,
      otpExpiresAt: Date.now() + MY_CABINET_OTP_TTL_SECONDS * 1000,
      resendAfter: Date.now() + MY_CABINET_OTP_RESEND_COOLDOWN_SECONDS * 1000,
    });
  }

  private async verifyOtp(
    appData: ConnectedAppData,
    request: Request,
  ): Promise<Response> {
    const logger = this.loggerFactory("verifyOtp");
    const body = (await request.json()) as {
      email?: string;
      phone?: string;
      otp?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim();
    const otp = body.otp?.trim();
    const destination = email || phone;

    logger.debug(
      {
        appId: appData._id,
        hasEmail: !!email,
        hasPhone: !!phone,
        hasOtp: !!otp,
      },
      "Received OTP verify payload",
    );

    if (!destination || !otp) {
      logger.warn({ appId: appData._id }, "Invalid OTP verify payload");
      return Response.json(
        { success: false, error: "invalid_payload" },
        { status: 400 },
      );
    }

    const channel = email ? "email" : "phone";
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const rateAllowed = await this.consumeRateLimit(
      appData._id,
      `${ip}:${destination}`,
      "otp-verify",
      10,
      5 * 60,
    );

    if (!rateAllowed) {
      logger.warn(
        { appId: appData._id, channel, destination },
        "OTP verify rate limit exceeded",
      );

      return Response.json(
        { success: false, error: "too_many_requests" },
        { status: 429 },
      );
    }

    logger.debug(
      { appId: appData._id, channel, destination },
      "OTP verify rate limit check passed",
    );

    const otpRaw = await this.props.services.redisClient.get(
      this.getOtpKey(appData._id, destination, channel),
    );

    logger.debug(
      { appId: appData._id, channel, destination, exists: !!otpRaw },
      "Loaded OTP state from Redis",
    );

    const row = otpRaw ? (JSON.parse(otpRaw) as OtpState) : null;
    if (!row || row.code !== otp) {
      logger.warn(
        { appId: appData._id, channel, destination },
        "Invalid OTP code",
      );

      return Response.json(
        { success: false, error: "invalid_otp" },
        { status: 400 },
      );
    }

    await this.props.services.redisClient.del(
      this.getOtpKey(appData._id, destination, channel),
    );

    logger.debug(
      { appId: appData._id, channel, destination },
      "Deleted OTP state from Redis after successful verification",
    );

    const sessionId = randomUUID();

    const token = this.createJwtToken({
      appId: appData._id,
      customerId: row.customerId,
      organizationId: appData.organizationId,
      sessionId,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    });

    await this.props.services.redisClient.set(
      this.getSessionKey(appData._id, sessionId),
      row.customerId,
      "EX",
      SESSION_TTL_SECONDS,
    );

    logger.debug(
      {
        appId: appData._id,
        customerId: row.customerId,
        sessionId,
        ttlSeconds: SESSION_TTL_SECONDS,
      },
      "Stored session in Redis",
    );

    const customer = await this.props.services.customersService.getCustomer(
      row.customerId,
    );

    logger.debug(
      { appId: appData._id, customerId: row.customerId, found: !!customer },
      "Fetched customer profile for OTP verify response",
    );

    const response = Response.json({
      success: true,
      name: customer?.name,
      email: customer?.email,
      phone: customer?.phone,
    });
    response.headers.append(
      "Set-Cookie",
      `${MY_CABINET_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`,
    );

    logger.info(
      { appId: appData._id, customerId: row.customerId, sessionId },
      "OTP verified and session created",
    );
    return response;
  }

  private async logout(request: Request): Promise<Response> {
    const logger = this.loggerFactory("logout");
    const token = this.readCookie(
      request.headers.get("cookie"),
      MY_CABINET_SESSION_COOKIE,
    );

    const payload = token ? this.verifyJwtToken(token) : null;
    logger.debug(
      { hasToken: !!token, hasPayload: !!payload },
      "Processing logout",
    );

    if (payload?.appId && payload?.sessionId) {
      await this.props.services.redisClient.del(
        this.getSessionKey(payload.appId, payload.sessionId),
      );
      logger.info(
        { appId: payload.appId, sessionId: payload.sessionId },
        "Session deleted on logout",
      );
    }

    const response = Response.json({ success: true });
    response.headers.append(
      "Set-Cookie",
      `${MY_CABINET_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    );
    return response;
  }

  private async getAuthOptions(appData: ConnectedAppData): Promise<Response> {
    const logger = this.loggerFactory("getAuthOptions");
    const appConfig =
      (appData.data as { allowPhoneLogin?: boolean } | undefined) ?? {};
    const allowPhoneLogin = appConfig.allowPhoneLogin ?? false;
    logger.debug(
      { appId: appData._id, allowPhoneLogin },
      "Returning auth options",
    );
    return Response.json({
      success: true,
      allowPhoneLogin,
    });
  }

  private async getAppointments(
    appData: ConnectedAppData,
    request: Request,
  ): Promise<Response> {
    const logger = this.loggerFactory("getAppointments");
    const token = this.readCookie(
      request.headers.get("cookie"),
      MY_CABINET_SESSION_COOKIE,
    );
    logger.debug(
      { appId: appData._id, hasToken: !!token },
      "Reading cabinet session",
    );

    if (!token) {
      logger.warn({ appId: appData._id }, "Missing session cookie");
      return Response.json(
        { success: false, error: "unauthorized" },
        { status: 401 },
      );
    }

    const payload = this.verifyJwtToken(token);
    if (
      !payload ||
      payload.appId !== appData._id ||
      payload.organizationId !== appData.organizationId
    ) {
      logger.warn({ appId: appData._id }, "Invalid JWT payload");
      return Response.json(
        { success: false, error: "unauthorized" },
        { status: 401 },
      );
    }

    logger.debug(
      {
        appId: appData._id,
        customerId: payload.customerId,
        sessionId: payload.sessionId,
      },
      "JWT validated for appointments request",
    );

    const customerId = await this.props.services.redisClient.get(
      this.getSessionKey(appData._id, payload.sessionId),
    );

    if (!customerId || customerId !== payload.customerId) {
      logger.warn(
        { appId: appData._id, sessionId: payload.sessionId },
        "Session not found or customer mismatch",
      );
      return Response.json(
        { success: false, error: "unauthorized" },
        { status: 401 },
      );
    }

    const now = new Date();
    const [upcoming, past] = await Promise.all([
      this.props.services.eventsService.getAppointments({
        customerId: payload.customerId,
        // Show all appointments for now
        // status: ["confirmed", "pending"],
        range: { start: now },
        limit: 20,
        sort: [{ id: "dateTime", desc: false }],
      }),
      this.props.services.eventsService.getAppointments({
        customerId: payload.customerId,
        range: { end: now },
        limit: 20,
        sort: [{ id: "dateTime", desc: true }],
      }),
    ]);

    logger.debug(
      {
        appId: appData._id,
        customerId: payload.customerId,
        upcomingCount: upcoming.items.length,
        pastCount: past.items.length,
      },
      "Returning cabinet appointments",
    );

    const customer = await this.props.services.customersService.getCustomer(
      payload.customerId,
    );

    return Response.json({
      success: true,
      customerId: payload.customerId,
      customer: customer
        ? {
            name: customer.name,
          }
        : undefined,
      upcoming: upcoming.items.map((a) => this.sanitizeAppointment(a)),
      past: past.items.map((a) => this.sanitizeAppointment(a)),
    });
  }

  private async getAppointmentsSummary(
    appData: ConnectedAppData,
    request: Request,
  ): Promise<Response> {
    const authorized = await this.authorizeSession(
      appData,
      request,
      "getAppointmentsSummary",
    );
    if (authorized instanceof Response) return authorized;
    const logger = this.loggerFactory("getAppointmentsSummary");
    logger.debug(
      { appId: appData._id, customerId: authorized.customerId },
      "Fetching appointments summary counts",
    );
    const now = new Date();
    const [upcoming, past] = await Promise.all([
      this.props.services.eventsService.getAppointments({
        customerId: authorized.customerId,
        status: ["confirmed", "pending"],
        range: { start: now },
        limit: 1,
      }),
      this.props.services.eventsService.getAppointments({
        customerId: authorized.customerId,
        range: { end: now },
        limit: 1,
      }),
    ]);
    const upcomingCount = upcoming.total ?? upcoming.items.length;
    const pastCount = past.total ?? past.items.length;
    logger.debug(
      {
        appId: appData._id,
        customerId: authorized.customerId,
        upcomingCount,
        pastCount,
      },
      "Returning appointments summary",
    );
    return Response.json({
      success: true,
      upcomingCount,
      pastCount,
    });
  }

  private async getUpcomingAppointments(
    appData: ConnectedAppData,
    request: Request,
  ): Promise<Response> {
    const authorized = await this.authorizeSession(
      appData,
      request,
      "getUpcomingAppointments",
    );
    if (authorized instanceof Response) return authorized;
    const logger = this.loggerFactory("getUpcomingAppointments");
    logger.debug(
      { appId: appData._id, customerId: authorized.customerId },
      "Fetching upcoming appointments",
    );
    const now = new Date();
    const upcoming = await this.props.services.eventsService.getAppointments({
      customerId: authorized.customerId,
      // Show all appointments for now
      // status: ["confirmed", "pending"],
      range: { start: now },
      limit: 20,
      sort: [{ id: "dateTime", desc: false }],
    });

    logger.debug(
      {
        appId: appData._id,
        customerId: authorized.customerId,
        count: upcoming.items.length,
        total: upcoming.total,
      },
      "Returning upcoming appointments",
    );

    return Response.json({
      success: true,
      items: upcoming.items.map((a) => this.sanitizeAppointment(a)),
      total: upcoming.total,
    });
  }

  private async getPastAppointments(
    appData: ConnectedAppData,
    request: Request,
  ): Promise<Response> {
    const authorized = await this.authorizeSession(
      appData,
      request,
      "getPastAppointments",
    );
    if (authorized instanceof Response) return authorized;
    const logger = this.loggerFactory("getPastAppointments");
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(
      20,
      Math.max(1, Number(url.searchParams.get("limit") ?? 10)),
    );
    const offset = (page - 1) * limit;
    logger.debug(
      {
        appId: appData._id,
        customerId: authorized.customerId,
        page,
        limit,
        offset,
      },
      "Fetching past appointments",
    );
    const now = new Date();
    const past = await this.props.services.eventsService.getAppointments({
      customerId: authorized.customerId,
      range: { end: now },
      limit,
      offset,
      sort: [{ id: "dateTime", desc: true }],
    });
    const total = past.total ?? past.items.length;
    logger.debug(
      {
        appId: appData._id,
        customerId: authorized.customerId,
        count: past.items.length,
        total,
        hasNextPage: page * limit < total,
      },
      "Returning past appointments",
    );
    return Response.json({
      success: true,
      items: past.items.map((a) => this.sanitizeAppointment(a)),
      total,
      page,
      limit,
      hasNextPage: page * limit < total,
    });
  }

  private async checkSession(
    appData: ConnectedAppData,
    request: Request,
  ): Promise<Response> {
    const authorized = await this.authorizeSession(
      appData,
      request,
      "checkSession",
    );
    if (authorized instanceof Response) return authorized;
    const logger = this.loggerFactory("checkSession");
    logger.debug(
      { appId: appData._id, customerId: authorized.customerId },
      "Session valid, fetching customer profile",
    );

    const customer = await this.props.services.customersService.getCustomer(
      authorized.customerId,
    );

    logger.debug(
      {
        appId: appData._id,
        customerId: authorized.customerId,
        found: !!customer,
      },
      "Returning session check result",
    );

    return Response.json({
      valid: true,
      name: customer?.name,
      email: customer?.email,
      phone: customer?.phone,
    });
  }

  private async getCustomerMe(
    appData: ConnectedAppData,
    request: Request,
  ): Promise<Response> {
    const logger = this.loggerFactory("getCustomerMe");
    const authorized = await this.authorizeSession(
      appData,
      request,
      "getCustomerMe",
    );
    if (authorized instanceof Response) return authorized;

    const customer = await this.props.services.customersService.getCustomer(
      authorized.customerId,
    );

    if (!customer) {
      logger.warn(
        { appId: appData._id, customerId: authorized.customerId },
        "Customer not found for me endpoint",
      );
      return Response.json(
        { success: false, error: "not_found" },
        { status: 404 },
      );
    }

    logger.debug(
      { appId: appData._id, customerId: authorized.customerId },
      "Returning customer contact info",
    );

    return Response.json({
      success: true,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });
  }

  private async getAppointmentById(
    appData: ConnectedAppData,
    request: Request,
    appointmentId: string,
  ): Promise<Response> {
    const logger = this.loggerFactory("getAppointmentById");
    const authorized = await this.authorizeSession(
      appData,
      request,
      "getAppointmentById",
    );
    if (authorized instanceof Response) return authorized;

    const appointment =
      await this.props.services.eventsService.getAppointment(appointmentId);

    if (!appointment || appointment.customerId !== authorized.customerId) {
      logger.warn(
        {
          appId: appData._id,
          appointmentId,
          customerId: authorized.customerId,
        },
        "Appointment not found or does not belong to customer",
      );
      return Response.json(
        { success: false, error: "not_found" },
        { status: 404 },
      );
    }

    logger.debug(
      { appId: appData._id, appointmentId, customerId: authorized.customerId },
      "Returning appointment by id",
    );

    return Response.json({
      success: true,
      appointment: this.sanitizeAppointment(appointment),
    });
  }

  private sanitizeAppointment(appointment: Appointment) {
    return {
      _id: appointment._id,
      status: appointment.status,
      dateTime: appointment.dateTime,
      endAt: appointment.endAt,
      totalDuration: appointment.totalDuration,
      totalPrice: appointment.totalPrice,
      timeZone: appointment.timeZone,
      meetingInformation: appointment.meetingInformation,
      option: appointment.option
        ? { _id: appointment.option._id, name: appointment.option.name }
        : undefined,
      addons: appointment.addons?.map((a) => ({ _id: a._id, name: a.name })),
      payments: appointment.payments?.map((p) => ({
        amount: p.amount,
        paidAt: p.paidAt,
        status: p.status,
        type: p.type,
        method: p.method,
        refunds: p.refunds,
        ...("giftCardCode" in p ? { giftCardCode: p.giftCardCode } : {}),
      })),
    };
  }

  private async authorizeSession(
    appData: ConnectedAppData,
    request: Request,
    methodName: string,
  ): Promise<Response | { customerId: string; sessionId: string }> {
    const logger = this.loggerFactory(methodName);
    const token = this.readCookie(
      request.headers.get("cookie"),
      MY_CABINET_SESSION_COOKIE,
    );
    if (!token) {
      logger.warn({ appId: appData._id }, "Missing session cookie");
      return Response.json(
        { success: false, error: "unauthorized" },
        { status: 401 },
      );
    }
    const payload = this.verifyJwtToken(token);
    if (
      !payload ||
      payload.appId !== appData._id ||
      payload.organizationId !== appData.organizationId
    ) {
      logger.warn({ appId: appData._id }, "Invalid JWT payload");
      return Response.json(
        { success: false, error: "unauthorized" },
        { status: 401 },
      );
    }
    const customerId = await this.props.services.redisClient.get(
      this.getSessionKey(appData._id, payload.sessionId),
    );
    if (!customerId || customerId !== payload.customerId) {
      logger.warn(
        { appId: appData._id, sessionId: payload.sessionId },
        "Session not found or customer mismatch",
      );
      return Response.json(
        { success: false, error: "unauthorized" },
        { status: 401 },
      );
    }
    logger.debug(
      {
        appId: appData._id,
        customerId: payload.customerId,
        sessionId: payload.sessionId,
      },
      "Session authorized",
    );
    return { customerId: payload.customerId, sessionId: payload.sessionId };
  }

  private async consumeRateLimit(
    appId: string,
    key: string,
    bucket: string,
    max: number,
    ttlSeconds: number,
  ): Promise<boolean> {
    const logger = this.loggerFactory("consumeRateLimit");
    const rateLimitKey = this.getRateLimitKey(appId, key, bucket);
    const count = await this.props.services.redisClient.incr(rateLimitKey);
    if (count === 1) {
      await this.props.services.redisClient.expire(rateLimitKey, ttlSeconds);
    }

    logger.debug(
      { appId, bucket, count, max, ttlSeconds },
      "Rate limit counter updated",
    );

    return count <= max;
  }

  private createJwtToken(payload: Record<string, any>): string {
    const logger = this.loggerFactory("createJwtToken");
    const secret = process.env.AUTH_SECRET || "my-cabinet-dev-secret";
    const header = { alg: "HS256", typ: "JWT" };
    const h = this.base64Url(JSON.stringify(header));
    const p = this.base64Url(JSON.stringify(payload));
    const signature = createHmac("sha256", secret)
      .update(`${h}.${p}`)
      .digest("base64url");
    const token = `${h}.${p}.${signature}`;

    logger.debug(
      {
        appId: payload.appId,
        customerId: payload.customerId,
        sessionId: payload.sessionId,
      },
      "Created JWT token",
    );

    return token;
  }

  private verifyJwtToken(token: string): Record<string, any> | null {
    const logger = this.loggerFactory("verifyJwtToken");
    const secret = process.env.AUTH_SECRET || "my-cabinet-dev-secret";
    const [h, p, sig] = token.split(".");
    if (!h || !p || !sig) {
      logger.debug({}, "Invalid JWT format");
      return null;
    }

    const expected = createHmac("sha256", secret)
      .update(`${h}.${p}`)
      .digest("base64url");
    if (expected !== sig) {
      logger.debug({}, "JWT signature mismatch");
      return null;
    }

    const payload = JSON.parse(Buffer.from(p, "base64url").toString("utf8"));
    if (
      !payload?.exp ||
      !payload?.sessionId ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      logger.debug({}, "JWT is missing required claims or expired");
      return null;
    }

    logger.debug(
      {
        appId: payload.appId,
        customerId: payload.customerId,
        sessionId: payload.sessionId,
      },
      "JWT verified",
    );

    return payload;
  }

  private base64Url(value: string) {
    return Buffer.from(value, "utf8").toString("base64url");
  }

  private readCookie(
    cookieHeader: string | null,
    name: string,
  ): string | undefined {
    if (!cookieHeader) return undefined;
    return cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`))
      ?.slice(name.length + 1);
  }

  private getOtpKey(
    appId: string,
    destination: string,
    channel: "email" | "phone",
  ) {
    return `my-cabinet:otp:${appId}:${channel}:${destination}`;
  }

  private getRateLimitKey(appId: string, key: string, bucket: string) {
    return `my-cabinet:rate-limit:${appId}:${bucket}:${key}`;
  }

  private getSessionKey(appId: string, sessionId: string) {
    return `my-cabinet:session:${appId}:${sessionId}`;
  }
}

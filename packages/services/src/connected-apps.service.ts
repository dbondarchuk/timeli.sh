import {
  AvailableAppServices,
  ServiceAvailableApps,
} from "@timelish/app-store/services";
import { BaseAllKeys } from "@timelish/i18n";
import {
  ApiRequest,
  App,
  APP_CONNECTED_EVENT_TYPE,
  APP_FAILED_EVENT_TYPE,
  APP_INSTALLED_EVENT_TYPE,
  APP_UNINSTALLED_EVENT_TYPE,
  AppScope,
  ConnectedApp,
  ConnectedAppData,
  ConnectedAppUpdateModel,
  IConnectedApp,
  IConnectedAppProps,
  IConnectedAppsService,
  IConnectedAppWithWebhook,
  IOAuthConnectedApp,
  IServicesContainer,
} from "@timelish/types";
import { ObjectId } from "mongodb";
import pLimit from "p-limit";
import { cache } from "react";
import { getBuiltInAppData, getBuiltInAppsForScope } from "./built-in/utils";
import { CONNECTED_APPS_COLLECTION_NAME } from "./collections";
import { getDbConnection } from "./database";
import { BaseService } from "./services/base.service";

export class ConnectedAppsService
  extends BaseService
  implements IConnectedAppsService
{
  public constructor(
    organizationId: string,
    protected readonly getServices: (
      organizationId?: string,
    ) => IServicesContainer,
  ) {
    super("ConnectedAppsService", organizationId);
  }

  public async createNewApp(name: string, userId: string): Promise<string> {
    const logger = this.loggerFactory("createNewApp");
    logger.debug({ name }, "Creating new app");

    if (!ServiceAvailableApps[name]) {
      logger.error({ name }, "Unknown app type");
      throw new Error("Unknown app type");
    }

    const app: ConnectedAppData = {
      _id: new ObjectId().toString(),
      organizationId: this.organizationId,
      status: "pending",
      statusText: "apps.common.statusText.pending" satisfies BaseAllKeys,
      name,
      userId,
    };

    const db = await getDbConnection();
    const collection = db.collection<ConnectedAppData>(
      CONNECTED_APPS_COLLECTION_NAME,
    );

    await collection.insertOne(app);

    const { app: appData, service } = await this.getAppService(app._id);
    if (service.install) {
      logger.debug(
        { appId: appData._id, appName: appData.name },
        "Running install hook",
      );
      try {
        await service.install(appData);
      } catch (error) {
        logger.error(
          { appId: appData._id, appName: appData.name, error },
          "Install hook failed",
        );
        await this.updateApp(
          appData._id,
          {
            status: "failed",
            statusText: "apps.common.statusText.error" satisfies BaseAllKeys,
          },
          appData.organizationId,
        );
        throw error;
      }
    }

    await this.getServices().eventService.emit(
      APP_INSTALLED_EVENT_TYPE,
      { appId: app._id, appName: app.name },
      {
        actor: "user",
        actorId: userId,
      },
    );

    logger.debug({ name, appId: app._id }, "Successfully created new app");

    return app._id;
  }

  public async deleteApp(appId: string): Promise<void> {
    const logger = this.loggerFactory("deleteApp");
    logger.debug({ appId }, "Deleting app");
    const db = await getDbConnection();
    const collection = db.collection<ConnectedAppData>(
      CONNECTED_APPS_COLLECTION_NAME,
    );

    const { app, service } = await this.getAppService(appId);
    if (service.unInstall) {
      logger.debug({ appId, appName: app.name }, "Running uninstall");
      await service.unInstall(app);
    }

    await collection.deleteOne({
      _id: appId,
      organizationId: this.organizationId,
    });

    await this.getServices().eventService.emit(
      APP_UNINSTALLED_EVENT_TYPE,
      { appId: app._id, appName: app.name },
      { actor: "system" },
    );

    logger.debug({ appId, appName: app.name }, "Successfully deleted app");
  }

  public async updateApp(
    appId: string,
    updateModel: ConnectedAppUpdateModel,
    organizationId?: string,
  ) {
    const logger = this.loggerFactory("updateApp");
    logger.debug(
      { appId, overrideOrganizationId: organizationId },
      "Updating app",
    );

    const db = await getDbConnection();
    const collection = db.collection<ConnectedAppData>(
      CONNECTED_APPS_COLLECTION_NAME,
    );

    const app = await collection.findOne({
      _id: appId,
      organizationId: organizationId ?? this.organizationId,
    });

    if (!app) {
      logger.error(
        { appId, overrideOrganizationId: organizationId },
        "App not found",
      );
      throw new Error("App not found");
    }

    await collection.updateOne(
      {
        _id: appId,
        organizationId: organizationId ?? this.organizationId,
      },
      {
        $set: {
          ...updateModel,
        },
      },
    );

    if (
      typeof updateModel.status !== "undefined" &&
      updateModel.status !== app.status
    ) {
      const eventType =
        updateModel.status === "failed"
          ? APP_FAILED_EVENT_TYPE
          : updateModel.status === "connected"
            ? APP_CONNECTED_EVENT_TYPE
            : null;
      if (eventType) {
        await this.getServices().eventService.emit(
          eventType,
          {
            appId: app._id,
            appName: app.name,
            userId: app.userId,
          },
          { actor: "system" },
        );
      }
    }

    logger.debug(
      { appId, appName: app.name, overrideOrganizationId: organizationId },
      "Successfully updated app",
    );
  }

  public async requestLoginUrl(appId: string): Promise<string> {
    const logger = this.loggerFactory("requestLoginUrl");
    logger.debug({ appId }, "Requesting login URL");

    const db = await getDbConnection();
    const collection = db.collection<ConnectedAppData>(
      CONNECTED_APPS_COLLECTION_NAME,
    );

    const app = await collection.findOne({
      _id: appId,
      organizationId: this.organizationId,
    });

    if (!app) {
      const message = "App not found";
      logger.error({ appId }, message);
      throw new Error(message);
    }

    const appService = ServiceAvailableApps[app.name];
    if (!appService || appService.type !== "oauth") {
      const message = "App type is not supported";
      logger.error(
        { appId, appName: app.name, appType: appService.type },
        message,
      );
      throw new Error(message);
    }

    const service = AvailableAppServices[app.name](
      this.getAppServiceProps(appId),
    );

    const loginUrl = await (service as any as IOAuthConnectedApp).getLoginUrl(
      appId,
    );

    logger.debug({ appId, appName: app.name }, "Successfully got login URL");

    return loginUrl;
  }

  public async processRedirect(name: string, request: ApiRequest, data?: any) {
    const logger = this.loggerFactory("processRedirect");
    logger.debug(
      { name, request: { method: request.method, url: request.url } },
      "Processing OAuth redirect",
    );

    const appService = ServiceAvailableApps[name];
    if (!appService || appService.type !== "oauth") {
      logger.error({ name }, "App type is not supported");
      throw new Error("App type is not supported");
    }

    const service = AvailableAppServices[name](this.getAppServiceProps(""));

    const result = await (service as any as IOAuthConnectedApp).processRedirect(
      request,
      data,
    );

    const db = await getDbConnection();
    const collection = db.collection<ConnectedAppData>(
      CONNECTED_APPS_COLLECTION_NAME,
    );

    const app = await collection.findOne({
      _id: result.appId,
      // WARNING: This is a workaround to allow OAuth redirects to be processed without a organizationId
      //organizationId: this.organizationId,
    });

    if (!app) {
      logger.error({ appId: result.appId }, "App not found");
      throw new Error("App not found");
    }

    if ("error" in result) {
      logger.error(
        { appId: result.appId, error: result.error },
        "OAuth redirect failed",
      );

      await this.updateApp(
        result.appId,
        {
          status: "failed",
          statusText: {
            key: result.error,
            args: result.errorArgs ?? {},
          },
        },
        app.organizationId,
      );
    } else {
      logger.debug({ appId: result.appId }, "OAuth redirect successful");
      await this.updateApp(
        result.appId,
        {
          status: "connected",
          statusText: "apps.common.statusText.connected" satisfies BaseAllKeys,
          ...result,
        },
        app.organizationId,
      );

      const connectedApp = await collection.findOne({
        _id: result.appId,
      });
      if (connectedApp) {
        const postConnectService = AvailableAppServices[connectedApp.name](
          this.getAppServiceProps(result.appId, connectedApp.organizationId),
        ) as any as IOAuthConnectedApp;
        if (typeof postConnectService.afterOAuthConnected === "function") {
          try {
            await postConnectService.afterOAuthConnected(connectedApp);
          } catch (error: unknown) {
            logger.error(
              {
                appId: result.appId,
                appName: connectedApp.name,
                error: error instanceof Error ? error.message : String(error),
              },
              "afterOAuthConnected hook failed",
            );
          }
        }
      }
    }

    logger.debug(
      { appId: result.appId },
      "OAuth redirect processing completed",
    );
  }

  public async processWebhook(appId: string, request: ApiRequest) {
    const logger = this.loggerFactory("processWebhook");
    logger.debug(
      { appId, request: { method: request.method, url: request.url } },
      "Processing webhook",
    );

    const app = await this.getApp(appId);
    const appService = AvailableAppServices[app.name](
      this.getAppServiceProps(appId),
    ) as IConnectedAppWithWebhook;

    if (
      !("processWebhook" in appService) ||
      !appService.processWebhook ||
      typeof appService.processWebhook !== "function"
    ) {
      logger.debug(
        { appId, appName: app.name },
        "App does not process webhooks",
      );
      return Response.json(
        {
          error: `App ${app.name} does not process webhooks`,
        },
        { status: 405 },
      );
    }

    const result = await appService.processWebhook(app, request);
    logger.debug({ appId }, "Returning webhook response");
    return result;
  }

  public async processStaticWebhook(appName: string, request: ApiRequest) {
    const logger = this.loggerFactory("processStaticWebhook");
    logger.debug(
      { appName, request: { method: request.method, url: request.url } },
      "Processing static app webhook",
    );

    const app = ServiceAvailableApps[appName];
    if (!app) {
      logger.error({ appName }, "App not found");
      throw new Error("App not found");
    }

    const service = AvailableAppServices[appName](
      this.getAppServiceProps(""),
    ) as IConnectedAppWithWebhook;

    if (
      !("processStaticWebhook" in service) ||
      !service.processStaticWebhook ||
      typeof service.processStaticWebhook !== "function"
    ) {
      logger.debug({ appName }, "App does not process webhooks");
      return Response.json(
        {
          error: `App ${appName} does not process webhooks`,
        },
        { status: 405 },
      );
    }

    const result = await service.processStaticWebhook(
      request,
      (organizationId) =>
        this.getServices(
          organizationId,
        ).connectedAppsService.getAppServiceProps(organizationId),
    );
    logger.debug({ appName }, "Returning static app webhook response");
    return result;
  }

  public async processAppCall(
    appId: string,
    slug: string[],
    request: ApiRequest,
  ) {
    const logger = this.loggerFactory("processAppCall");
    logger.debug(
      { appId, slug, request: { method: request.method, url: request.url } },
      "Processing app call",
    );

    const app = await this.getApp(appId);
    const appService = AvailableAppServices[app.name](
      this.getAppServiceProps(appId),
    ) as IConnectedAppWithWebhook;

    if (!("processAppCall" in appService) || !appService.processAppCall) {
      logger.debug(
        { appId, appName: app.name },
        "App does not process app calls",
      );
      return Response.json(
        {
          error: `App ${app.name} does not process app calls`,
        },
        { status: 405 },
      );
    }

    const result = await appService.processAppCall(app, slug, request);
    logger.debug({ appId, slug }, "Returning app call response");

    return result;
  }

  public async processAppExternalCall(
    appId: string,
    slug: string[],
    request: Request,
  ): Promise<Response | undefined> {
    const logger = this.loggerFactory("processAppExternalCall");
    logger.debug(
      { appId, slug, request: { method: request.method, url: request.url } },
      "Processing external app call",
    );

    const app = await this.getApp(appId);
    const appService = AvailableAppServices[app.name](
      this.getAppServiceProps(appId),
    );

    if (
      !("processAppExternalCall" in appService) ||
      !appService.processAppExternalCall
    ) {
      logger.debug(
        { appId, appName: app.name },
        "App does not process external app calls",
      );
      return new Response(
        JSON.stringify({
          error: `App ${app.name} does not process external app calls`,
        }),
        { status: 405, headers: { "Content-Type": "application/json" } },
      );
    }

    const result = await appService.processAppExternalCall(app, slug, request);
    logger.debug({ appId, slug }, "Returning external app call response");

    return result;
  }

  public async processRequest(
    appId: string,
    data: any,
    request: ApiRequest,
    userId: string,
  ): Promise<any> {
    const logger = this.loggerFactory("processRequest");
    logger.debug({ appId, data }, "Processing request");
    const app = await this.getApp(appId);

    const appService = AvailableAppServices[app.name](
      this.getAppServiceProps(appId),
    );

    if (!appService.processRequest) {
      logger.error(
        { appId, appName: app.name },
        "App does not implement processRequest",
      );

      throw new Error(`App ${app.name} does not implement processRequest`);
    }

    const result = await appService.processRequest(app, data, request, userId);

    logger.debug({ appId }, "Returning request response");
    return result;
  }

  public async processStaticRequest(
    appName: string,
    data: any,
    request: ApiRequest,
    userId: string,
  ): Promise<any> {
    const logger = this.loggerFactory("processStaticRequest");
    logger.debug({ appName }, "Processing static request");
    const appService = AvailableAppServices[appName](
      this.getAppServiceStaticProps(appName),
    );

    if (!appService.processStaticRequest) {
      logger.error({ appName }, "App does not support static requests");
      throw new Error(`App ${appName} does not support static requests`);
    }

    logger.debug({ appName }, "Returning static request response");
    return await appService.processStaticRequest(data, request, userId);
  }

  public async processFormRequest(
    appId: string,
    formData: FormData,
    request: ApiRequest,
    userId: string,
  ): Promise<any> {
    const logger = this.loggerFactory("processFormRequest");
    logger.debug({ appId, formData }, "Processing form request");
    const app = await this.getApp(appId);
    const appService = AvailableAppServices[app.name](
      this.getAppServiceProps(appId),
    );

    if (!appService.processFormRequest) {
      logger.error(
        { appId, appName: app.name },
        "App does not implement processFormRequest",
      );
      throw new Error(`App ${app.name} does not implement processFormRequest`);
    }

    const result = await appService.processFormRequest(
      app,
      formData,
      request,
      userId,
    );

    logger.debug({ appId }, "Returning form request response");
    return result;
  }

  public async getAppStatus(appId: string): Promise<ConnectedApp> {
    const logger = this.loggerFactory("getAppStatus");
    logger.debug({ appId }, "Getting app status");
    const db = await getDbConnection();
    const collection = db.collection<ConnectedAppData>(
      CONNECTED_APPS_COLLECTION_NAME,
    );

    const result = await collection.findOne({
      _id: appId,
      organizationId: this.organizationId,
    });

    if (!result) {
      logger.error({ appId }, "App not found");
      throw new Error("App not found");
    }

    const { data: __, token: ____, ...app } = result;

    logger.debug({ appId }, "Returning app status");
    return app;
  }

  public async getApps(): Promise<ConnectedApp[]> {
    const logger = this.loggerFactory("getApps");
    logger.debug({}, "Getting all apps");
    const db = await getDbConnection();
    const collection = db.collection<ConnectedAppData>(
      CONNECTED_APPS_COLLECTION_NAME,
    );

    const result = await collection
      .find({ organizationId: this.organizationId })
      .toArray();

    logger.debug({ count: result.length }, "Returning all apps");
    return result.map(({ data: __, token: ___, ...app }) => app);
  }

  public async getAppsByScope(...scope: AppScope[]): Promise<ConnectedApp[]> {
    const logger = this.loggerFactory("getAppsByScope");
    logger.debug({ scope }, "Getting apps by scope");
    const result = await this.getAppsByScopeWithData(...scope);

    logger.debug({ scope, count: result.length }, "Returning apps by scope");
    return result.map(({ data: __, token: ___, ...app }) => app);
  }

  public async getAppsByApp(...appNames: string[]): Promise<ConnectedApp[]> {
    const logger = this.loggerFactory("getAppsByApp");
    if (appNames.length === 0) {
      return [];
    }
    logger.debug({ appNames }, "Getting apps by app names");
    const db = await getDbConnection();
    const collection = db.collection<ConnectedAppData>(
      CONNECTED_APPS_COLLECTION_NAME,
    );

    const result = await collection
      .find({
        name: { $in: appNames },
        organizationId: this.organizationId,
      })
      .toArray();

    logger.debug({ appNames, count: result.length }, "Returning apps by names");
    return result.map(({ data: __, token: ___, ...app }) => app);
  }

  public async getAppsByScopeWithData(
    ...scope: AppScope[]
  ): Promise<ConnectedAppData[]> {
    const logger = this.loggerFactory("getAppsByScopeWithData");
    logger.debug({ scope }, "Getting apps by scope with data");
    const db = await getDbConnection();
    const collection = db.collection<ConnectedAppData>(
      CONNECTED_APPS_COLLECTION_NAME,
    );

    const possibleAppNames = Object.keys(ServiceAvailableApps).filter(
      (appName) =>
        ServiceAvailableApps[appName].scope.some((s) => scope.includes(s)),
    );

    const result = await collection
      .find({
        name: {
          $in: possibleAppNames,
        },
        organizationId: this.organizationId,
      })
      .toArray();

    logger.debug(
      { scope, count: result.length },
      "Returning apps by scope with data",
    );
    return result;
  }

  public async getAppsByType(type: App["type"]) {
    const logger = this.loggerFactory("getAppsByType");
    logger.debug({ type }, "Getting apps by type");
    const db = await getDbConnection();
    const collection = db.collection<ConnectedAppData>(
      CONNECTED_APPS_COLLECTION_NAME,
    );

    const possibleAppNames = Object.keys(ServiceAvailableApps).filter(
      (appName) => ServiceAvailableApps[appName].type === type,
    );

    const result = await collection
      .find({
        name: {
          $in: possibleAppNames,
        },
        organizationId: this.organizationId,
      })
      .map((app) => ({ id: app._id, name: app.name }))
      .toArray();

    logger.debug({ type, count: result.length }, "Returning apps by type");
    return result;
  }

  public async getApp(appId: string): Promise<ConnectedAppData> {
    const logger = this.loggerFactory("getApp");
    logger.debug({ appId }, "Getting app data");
    const db = await getDbConnection();
    const collection = db.collection<ConnectedAppData>(
      CONNECTED_APPS_COLLECTION_NAME,
    );

    const result = await collection.findOne({
      _id: appId,
      organizationId: this.organizationId,
    });

    if (!result) {
      logger.error({ appId }, "App not found");
      throw new Error("App not found");
    }

    logger.debug({ appId }, "Returning app data");
    return result;
  }

  public async getAppsData(appIds: string[]): Promise<ConnectedAppData[]> {
    const logger = this.loggerFactory("getAppsData");
    logger.debug({ appIds }, "Getting apps data");
    const db = await getDbConnection();
    const collection = db.collection<ConnectedAppData>(
      CONNECTED_APPS_COLLECTION_NAME,
    );

    const result = await collection
      .find({
        _id: {
          $in: appIds,
        },
        organizationId: this.organizationId,
      })
      .toArray();

    logger.debug({ appIds, count: result.length }, "Returning apps data");
    return result;
  }

  public async getAppService<T>(
    appId: string,
  ): Promise<{ service: IConnectedApp & T; app: ConnectedApp }> {
    const logger = this.loggerFactory("getAppService");
    logger.debug({ appId }, "Getting app service");
    const db = await getDbConnection();
    const collection = db.collection<ConnectedAppData>(
      CONNECTED_APPS_COLLECTION_NAME,
    );

    const app = await collection.findOne({
      _id: appId,
      organizationId: this.organizationId,
    });

    if (!app) {
      logger.error({ appId }, "App not found");
      throw new Error(`App ${appId} was not found`);
    }

    const service = AvailableAppServices[app.name](
      this.getAppServiceProps(appId),
    ) as any as T & IConnectedApp;

    logger.debug({ appId }, "Returning app service");
    return { app, service };
  }

  public getAppServiceProps(
    appId: string,
    organizationId?: string,
  ): IConnectedAppProps {
    return {
      update: (updateModel) =>
        this.updateApp(appId, updateModel, organizationId),
      services: this.getServices(),
      getDbConnection: getDbConnection,
      organizationId: organizationId ?? this.organizationId,
    };
  }

  public getAppServiceStaticProps(appName: string): IConnectedAppProps {
    const logger = this.loggerFactory("getAppServiceStaticProps");
    logger.debug({ appName }, "Getting app service static props");
    try {
      const appService = AvailableAppServices[appName];
      if (!appService) {
        logger.error({ appName }, "App service not found");
        throw new Error(`App service ${appName} was not found`);
      }

      return {
        organizationId: this.organizationId,
        update: async (updateModel) => {
          logger.error(
            { appName },
            `App called update method from static request`,
          );
          throw new Error(
            `App ${appName} called update method from static request`,
          );
        },
        services: this.getServices(),
        getDbConnection: getDbConnection,
      };
    } catch (error) {
      logger.error(
        { appName, error },
        "Error getting app service static props",
      );
      throw error;
    }
  }

  public async invokeAppsByScope<T, TReturn = void>(
    scope: AppScope,
    callback: (app: ConnectedAppData, service: T) => Promise<TReturn>,
    options?: {
      concurrencyLimit?: number;
      ignoreErrors?: boolean;
    },
  ): Promise<(TReturn | undefined)[]> {
    const logger = this.loggerFactory("invokeAppsByScope");
    logger.debug({ scope }, "Invoking apps for scope");

    const { concurrencyLimit = 10, ignoreErrors = false } = options ?? {};
    const limit = pLimit(concurrencyLimit);

    const apps = await this.getAppsByScopeWithData(scope);

    logger.debug({ scope, count: apps.length }, "Retrieved apps for scope");

    const appPromises = apps.map(async (appData) => {
      logger.debug(
        { appName: appData.name, appId: appData._id },
        "Invoking app callback",
      );

      const service = AvailableAppServices[appData.name](
        this.getAppServiceProps(appData._id),
      ) as any as T;

      try {
        const result = await callback(appData, service);
        logger.debug(
          { appName: appData.name, appId: appData._id },
          "App callback completed",
        );

        return result;
      } catch (error) {
        if (!ignoreErrors) {
          logger.error(
            { appName: appData.name, appId: appData._id, error },
            "Error in app callback",
          );
          throw error;
        } else {
          logger.warn(
            { appName: appData.name, appId: appData._id, error },
            "Error in app callback, ignoring",
          );
        }
      }
    });

    const builtIns = getBuiltInAppsForScope(scope);

    logger.debug(
      { builtIns: builtIns.map((h) => h.name), scope },
      "Built-in apps for scope",
    );

    const builtInAppPromises = builtIns.map(async (app) => {
      logger.debug({ appName: app.name }, "Invoking built-in app");

      try {
        const services = this.getServices();
        const service = new app.getService(this.organizationId, services);
        const users = await services.userService.getOrganizationAdminUsers();
        const user = users[0];
        if (!user) {
          logger.error(
            { appName: app.name },
            "Organization admin user not found",
          );
          throw new Error("Organization admin user not found");
        }

        return await callback(
          getBuiltInAppData(this.organizationId, user._id.toString(), app.name),
          service,
        );
      } catch (error) {
        if (!ignoreErrors) {
          logger.error(
            { appName: app.name, error },
            "Error invoking built-in app",
          );
          throw error;
        } else {
          logger.warn(
            { appName: app.name, error },
            "Error invoking built-in app, ignoring",
          );
        }
      }
    });

    const allPromises = [...builtInAppPromises, ...appPromises];

    const results = await Promise.all(allPromises.map((p) => limit(() => p)));

    logger.debug({ scope }, "invokeAppsByScope finished");
    return results;
  }
}

export class CachedConnectedAppsService extends ConnectedAppsService {
  private cachedGetApps = cache(async () => {
    const logger = this.loggerFactory("cachedGetApps");
    logger.debug({}, "Getting apps");
    const db = await getDbConnection();
    const collection = db.collection<ConnectedAppData>(
      CONNECTED_APPS_COLLECTION_NAME,
    );
    const apps = await collection
      .find({ organizationId: this.organizationId })
      .toArray();
    logger.debug({ count: apps.length }, "Returning apps");

    return apps;
  });

  public async getApps(): Promise<ConnectedApp[]> {
    const apps = await this.cachedGetApps();
    return apps.map(({ data: __, ...app }) => app);
  }

  public async getAppsByScopeWithData(
    ...scope: AppScope[]
  ): Promise<ConnectedAppData[]> {
    const apps = await this.cachedGetApps();
    return apps.filter((app) =>
      scope.some((s) =>
        (ServiceAvailableApps[app.name]?.scope ?? []).includes(s),
      ),
    );
  }

  public async getAppsByScope(...scope: AppScope[]): Promise<ConnectedApp[]> {
    const apps = await this.cachedGetApps();
    return apps
      .filter((app) =>
        scope.some((s) =>
          (ServiceAvailableApps[app.name]?.scope ?? []).includes(s),
        ),
      )
      .map(({ data: __, token: ___, ...app }) => app);
  }

  public async getAppsByApp(...appNames: string[]): Promise<ConnectedApp[]> {
    if (appNames.length === 0) {
      return [];
    }
    const set = new Set(appNames);
    const apps = await this.cachedGetApps();
    return apps
      .filter((app) => set.has(app.name))
      .map(({ data: __, token: ___, ...app }) => app);
  }

  public async getApp(appId: string): Promise<ConnectedAppData> {
    const apps = await this.cachedGetApps();
    const app = apps.find((app) => app._id === appId);

    if (!app) {
      throw new Error(`App ${appId} not found`);
    }

    return app;
  }
}

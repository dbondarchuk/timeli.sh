import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  ApiRequest,
  ApiResponse,
  ConnectedAppData,
  ConnectedAppStatusWithText,
  IConnectedApp,
  IConnectedAppProps,
} from "@timelish/types";
import {
  BlogConfiguration,
  blogConfigurationSchema,
  CheckBlogPostSlugUniqueAction,
  CheckBlogPostSlugUniqueActionType,
  CreateBlogPostAction,
  CreateBlogPostActionType,
  DeleteBlogPostAction,
  DeleteBlogPostActionType,
  DeleteSelectedBlogPostsAction,
  DeleteSelectedBlogPostsActionType,
  GetBlogPostAction,
  GetBlogPostActionType,
  GetBlogPostsAction,
  GetBlogPostsActionType,
  GetBlogTagsAction,
  GetBlogTagsActionType,
  RequestAction,
  SetConfigurationActionType,
  UpdateBlogPostAction,
  UpdateBlogPostActionType,
} from "../models";
import {
  BlogAdminAllKeys,
  BlogAdminKeys,
  BlogAdminNamespace,
} from "../translations/types";
import {
  BLOG_POSTS_COLLECTION_NAME,
  BlogRepositoryService,
} from "./repository-service";

export class BlogConnectedApp implements IConnectedApp {
  protected readonly loggerFactory: LoggerFactory;

  public constructor(protected readonly props: IConnectedAppProps) {
    this.loggerFactory = getLoggerFactory("BlogConnectedApp", props.companyId);
  }

  public async processRequest(
    appData: ConnectedAppData,
    data: RequestAction,
  ): Promise<any> {
    const logger = this.loggerFactory("processRequest");
    logger.debug({ appId: appData._id }, "Processing blog request");

    switch (data.type) {
      case GetBlogPostsActionType:
        return this.processGetBlogPostsRequest(appData, data);
      case GetBlogPostActionType:
        return this.processGetBlogPostRequest(appData, data);
      case CreateBlogPostActionType:
        return this.processCreateBlogPostRequest(appData, data);
      case UpdateBlogPostActionType:
        return this.processUpdateBlogPostRequest(appData, data);
      case DeleteBlogPostActionType:
        return this.processDeleteBlogPostRequest(appData, data);
      case DeleteSelectedBlogPostsActionType:
        return this.processDeleteBlogPostsRequest(appData, data);
      case GetBlogTagsActionType:
        return this.processGetBlogTagsRequest(appData, data);
      case CheckBlogPostSlugUniqueActionType:
        return this.processCheckBlogPostSlugUniqueRequest(appData, data);
      case SetConfigurationActionType:
      default:
        return this.processSetConfigurationRequest(appData, data.configuration);
    }
  }

  public async unInstall(appData: ConnectedAppData): Promise<void> {
    const logger = this.loggerFactory("unInstall");
    logger.debug({ appId: appData._id }, "Uninstalling blog app");

    try {
      const db = await this.props.getDbConnection();
      const collection = db.collection(BLOG_POSTS_COLLECTION_NAME);
      await collection.deleteMany({
        appId: appData._id,
      });

      const count = await collection.countDocuments({});
      if (count === 0) {
        await db.dropCollection(BLOG_POSTS_COLLECTION_NAME);
      }

      logger.info({ appId: appData._id }, "Successfully uninstalled blog app");
    } catch (error: any) {
      logger.error(
        { appId: appData._id, error: error?.message || error?.toString() },
        "Error uninstalling blog app",
      );
      throw error;
    }
  }

  public async install(appData: ConnectedAppData): Promise<void> {
    const logger = this.loggerFactory("install");
    logger.debug({ appId: appData._id }, "Installing blog app");

    try {
      const repositoryService = this.getRepositoryService(
        appData._id,
        appData.companyId,
      );
      await repositoryService.install();

      logger.debug({ appId: appData._id }, "Blog app installed successfully");
    } catch (error: any) {
      logger.error({ appId: appData._id, error }, "Error installing blog app");
      throw error;
    }
  }

  public async processAppCall(
    appData: ConnectedAppData,
    slug: string[],
    request: ApiRequest,
  ): Promise<ApiResponse> {
    return Response.json(
      { success: false, error: "Unknown request" },
      { status: 404 },
    );
  }

  protected getRepositoryService(appId: string, companyId: string) {
    return new BlogRepositoryService(
      appId,
      companyId,
      this.props.getDbConnection,
      this.props.services,
    );
  }

  private async processGetBlogPostsRequest(
    appData: ConnectedAppData,
    data: GetBlogPostsAction,
  ) {
    const logger = this.loggerFactory("processGetBlogPostsRequest");
    logger.debug({ appId: appData._id }, "Processing get blog posts request");

    try {
      const repositoryService = this.getRepositoryService(
        appData._id,
        appData.companyId,
      );
      const result = await repositoryService.getBlogPosts(data.query);

      logger.debug({ appId: appData._id }, "Successfully retrieved blog posts");
      return result;
    } catch (error: any) {
      logger.error(
        { appId: appData._id, error },
        "Error retrieving blog posts",
      );
      throw error;
    }
  }

  private async processGetBlogPostRequest(
    appData: ConnectedAppData,
    data: GetBlogPostAction,
  ) {
    const logger = this.loggerFactory("processGetBlogPostRequest");
    logger.debug({ appId: appData._id }, "Processing get blog post request");

    try {
      const repositoryService = this.getRepositoryService(
        appData._id,
        appData.companyId,
      );
      const result = await repositoryService.getBlogPost(data.id, data.slug);

      logger.debug({ appId: appData._id }, "Successfully retrieved blog post");
      return result;
    } catch (error: any) {
      logger.error({ appId: appData._id, error }, "Error retrieving blog post");
      throw error;
    }
  }

  private async processCreateBlogPostRequest(
    appData: ConnectedAppData,
    data: CreateBlogPostAction,
  ) {
    const logger = this.loggerFactory("processCreateBlogPostRequest");
    logger.debug({ appId: appData._id }, "Processing create blog post request");

    try {
      const repositoryService = this.getRepositoryService(
        appData._id,
        appData.companyId,
      );
      const result = await repositoryService.createBlogPost(data.post);

      logger.debug({ appId: appData._id }, "Successfully created blog post");
      return result;
    } catch (error: any) {
      logger.error({ appId: appData._id, error }, "Error creating blog post");
      throw error;
    }
  }

  private async processUpdateBlogPostRequest(
    appData: ConnectedAppData,
    data: UpdateBlogPostAction,
  ) {
    const logger = this.loggerFactory("processUpdateBlogPostRequest");
    logger.debug({ appId: appData._id }, "Processing update blog post request");

    try {
      const repositoryService = this.getRepositoryService(
        appData._id,
        appData.companyId,
      );
      const result = await repositoryService.updateBlogPost(data.id, data.post);

      logger.debug({ appId: appData._id }, "Successfully updated blog post");
      return result;
    } catch (error: any) {
      logger.error({ appId: appData._id, error }, "Error updating blog post");
      throw error;
    }
  }

  private async processDeleteBlogPostRequest(
    appData: ConnectedAppData,
    data: DeleteBlogPostAction,
  ) {
    const logger = this.loggerFactory("processDeleteBlogPostRequest");
    logger.debug({ appId: appData._id }, "Processing delete blog post request");

    try {
      const repositoryService = this.getRepositoryService(
        appData._id,
        appData.companyId,
      );
      const result = await repositoryService.deleteBlogPost(data.id);

      logger.debug({ appId: appData._id }, "Successfully deleted blog post");
      return result;
    } catch (error: any) {
      logger.error({ appId: appData._id, error }, "Error deleting blog post");
      throw error;
    }
  }

  private async processDeleteBlogPostsRequest(
    appData: ConnectedAppData,
    data: DeleteSelectedBlogPostsAction,
  ) {
    const logger = this.loggerFactory("processDeleteBlogPostsRequest");
    logger.debug(
      { appId: appData._id },
      "Processing delete blog posts request",
    );

    try {
      const repositoryService = this.getRepositoryService(
        appData._id,
        appData.companyId,
      );
      const result = await repositoryService.deleteBlogPosts(data.ids);

      logger.debug({ appId: appData._id }, "Successfully deleted blog posts");
      return result;
    } catch (error: any) {
      logger.error({ appId: appData._id, error }, "Error deleting blog posts");
      throw error;
    }
  }

  private async processGetBlogTagsRequest(
    appData: ConnectedAppData,
    data: GetBlogTagsAction,
  ) {
    const logger = this.loggerFactory("processGetBlogTagsRequest");
    logger.debug({ appId: appData._id }, "Processing get blog tags request");

    try {
      const repositoryService = this.getRepositoryService(
        appData._id,
        appData.companyId,
      );
      const result = await repositoryService.getBlogTags(
        data.sortBy,
        data.sortOrder,
      );

      logger.debug({ appId: appData._id }, "Successfully retrieved blog tags");
      return result;
    } catch (error: any) {
      logger.error({ appId: appData._id, error }, "Error retrieving blog tags");
      throw error;
    }
  }

  private async processCheckBlogPostSlugUniqueRequest(
    appData: ConnectedAppData,
    data: CheckBlogPostSlugUniqueAction,
  ) {
    const logger = this.loggerFactory("processCheckBlogPostSlugUniqueRequest");
    logger.debug(
      { appId: appData._id, slug: data.slug, id: data.id },
      "Processing check blog post slug uniqueness request",
    );

    try {
      const repositoryService = this.getRepositoryService(
        appData._id,
        appData.companyId,
      );
      
      const result = await repositoryService.checkBlogPostSlugUnique(
        data.slug,
        data.id,
      );

      logger.debug(
        { appId: appData._id, slug: data.slug, id: data.id, result },
        "Successfully checked blog post slug uniqueness",
      );
      return result;
    } catch (error: any) {
      logger.error(
        { appId: appData._id, slug: data.slug, error },
        "Error checking blog post slug uniqueness",
      );
      throw error;
    }
  }

  private async processSetConfigurationRequest(
    appData: ConnectedAppData,
    data: BlogConfiguration,
  ): Promise<ConnectedAppStatusWithText<BlogAdminNamespace, BlogAdminKeys>> {
    const logger = this.loggerFactory("processSetConfigurationRequest");
    logger.debug(
      { appId: appData._id },
      "Processing set configuration request",
    );

    try {
      // Validate configuration
      const validatedConfig = blogConfigurationSchema.parse(data);

      logger.debug(
        { appId: appData._id },
        "Configuration validated successfully, installing blog app...",
      );

      await this.install(appData);

      const status: ConnectedAppStatusWithText<
        BlogAdminNamespace,
        BlogAdminKeys
      > = {
        status: "connected",
        statusText:
          "app_blog_admin.statusText.successfully_set_up" satisfies BlogAdminAllKeys,
      };

      this.props.update({
        data: validatedConfig,
        ...status,
      });

      logger.info(
        { appId: appData._id, status: status.status },
        "Successfully configured blog",
      );

      return status;
    } catch (error: any) {
      logger.error(
        { appId: appData._id, error },
        "Error processing blog configuration",
      );

      this.props.update({
        status: "failed",
        statusText:
          "app_blog_admin.statusText.error_processing_configuration" satisfies BlogAdminAllKeys,
      });

      throw error;
    }
  }
}

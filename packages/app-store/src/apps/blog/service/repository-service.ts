import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import { IConnectedAppProps, Query, WithTotal } from "@timelish/types";
import { escapeRegex } from "@timelish/utils";
import { ObjectId, type Filter, type Sort } from "mongodb";
import {
  BlogPost,
  BlogPostEntity,
  BlogPostUpdateModel,
} from "../models/blog-post";
import { BLOG_PAGES } from "./pages";

export const BLOG_POSTS_COLLECTION_NAME = "blog-posts";

export class BlogRepositoryService {
  protected readonly loggerFactory: LoggerFactory;

  public constructor(
    protected readonly appId: string,
    protected readonly companyId: string,
    protected readonly getDbConnection: IConnectedAppProps["getDbConnection"],
    protected readonly services: IConnectedAppProps["services"],
  ) {
    this.loggerFactory = getLoggerFactory(
      "BlogRepositoryService",
      this.companyId,
    );
  }

  public async createBlogPost(post: BlogPostUpdateModel): Promise<BlogPost> {
    const logger = this.loggerFactory("createBlogPost");
    logger.debug({ post }, "Creating blog post");

    const db = await this.getDbConnection();
    const blogPost = {
      ...post,
      _id: new ObjectId().toString(),
      appId: this.appId,
      createdAt: new Date(),
      updatedAt: new Date(),
      companyId: this.companyId,
    } satisfies BlogPostEntity;

    await db
      .collection<BlogPostEntity>(BLOG_POSTS_COLLECTION_NAME)
      .insertOne(blogPost);

    logger.debug({ blogPost }, "Blog post created");

    return blogPost as BlogPost;
  }

  public async updateBlogPost(
    id: string,
    post: BlogPostUpdateModel,
  ): Promise<BlogPost | null> {
    const logger = this.loggerFactory("updateBlogPost");
    logger.debug({ id, post }, "Updating blog post");

    const db = await this.getDbConnection();
    const { modifiedCount } = await db
      .collection<BlogPostEntity>(BLOG_POSTS_COLLECTION_NAME)
      .updateOne(
        { _id: id, companyId: this.companyId },
        {
          $set: {
            ...post,
            updatedAt: new Date(),
          },
        },
      );

    if (modifiedCount === 0) {
      logger.warn({ id }, "Blog post not found");
      return null;
    }

    const updatedPost = await this.getBlogPost(id);
    logger.debug({ id }, "Blog post updated");

    return updatedPost;
  }

  public async deleteBlogPost(id: string): Promise<boolean> {
    const logger = this.loggerFactory("deleteBlogPost");
    logger.debug({ id }, "Deleting blog post");

    const db = await this.getDbConnection();
    const { deletedCount } = await db
      .collection<BlogPostEntity>(BLOG_POSTS_COLLECTION_NAME)
      .deleteOne({ _id: id, companyId: this.companyId });

    if (deletedCount === 0) {
      logger.warn({ id }, "Blog post not found");
      return false;
    }

    logger.debug({ id }, "Blog post deleted");
    return true;
  }

  public async getBlogPosts(
    query: Query & {
      tag?: string;
      isPublished?: boolean;
    },
  ): Promise<WithTotal<BlogPost>> {
    const logger = this.loggerFactory("getBlogPosts");
    logger.debug({ query }, "Getting blog posts");

    const db = await this.getDbConnection();

    const sort: Sort = query.sort?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr.desc ? -1 : 1,
      }),
      {},
    ) || { publicationDate: -1, createdAt: -1 };

    const $and: Filter<BlogPost>[] = [
      {
        companyId: this.companyId,
        appId: this.appId,
      },
    ];

    if (query.isPublished !== undefined) {
      $and.push({
        isPublished: query.isPublished,
      });
    }

    if (query.tag) {
      $and.push({
        tags: { $in: [query.tag] },
      });
    }

    if (query.search) {
      const $regex = new RegExp(escapeRegex(query.search), "i");
      $and.push({
        $or: [{ title: { $regex } }, { slug: { $regex } }],
      });
    }

    const filter: Filter<BlogPost> = $and.length > 0 ? { $and } : {};

    const [result] = await db
      .collection<BlogPost>(BLOG_POSTS_COLLECTION_NAME)
      .aggregate([
        {
          $match: filter,
        },
        {
          $sort: sort,
        },
        {
          $facet: {
            paginatedResults:
              query.limit === 0
                ? undefined
                : [
                    ...(typeof query.offset !== "undefined"
                      ? [{ $skip: query.offset }]
                      : []),
                    ...(typeof query.limit !== "undefined"
                      ? [{ $limit: query.limit }]
                      : []),
                  ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ])
      .toArray();

    const response = {
      total: result.totalCount?.[0]?.count || 0,
      items: result.paginatedResults || [],
    };

    logger.info(
      {
        result: { total: response.total, count: response.items.length },
        query,
      },
      "Fetched blog posts",
    );

    return response;
  }

  public async getBlogPost(
    id?: string,
    slug?: string,
  ): Promise<BlogPost | null> {
    const logger = this.loggerFactory("getBlogPost");
    logger.debug({ id, slug }, "Getting blog post");

    if (!id && !slug) {
      logger.warn({ id, slug }, "Neither id nor slug provided");
      return null;
    }

    const db = await this.getDbConnection();
    const filter: Filter<BlogPost> = {
      companyId: this.companyId,
      appId: this.appId,
    };

    if (id) {
      filter._id = id;
    } else if (slug) {
      filter.slug = slug;
    }

    const blogPost = await db
      .collection<BlogPost>(BLOG_POSTS_COLLECTION_NAME)
      .findOne(filter);

    if (!blogPost) {
      logger.warn({ id, slug }, "Blog post not found");
    } else {
      logger.debug({ id, slug, title: blogPost.title }, "Blog post found");
    }

    return blogPost as BlogPost | null;
  }

  public async getBlogTags(
    sortBy: "alphabetical" | "count" = "alphabetical",
    sortOrder: "asc" | "desc" = "asc",
  ): Promise<Array<{ tag: string; count: number }>> {
    const logger = this.loggerFactory("getBlogTags");
    logger.debug({ sortBy, sortOrder }, "Getting blog tags");

    const db = await this.getDbConnection();

    const result = await db
      .collection<BlogPost>(BLOG_POSTS_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            companyId: this.companyId,
            appId: this.appId,
            isPublished: true,
            tags: { $exists: true, $ne: [] },
          },
        },
        {
          $unwind: "$tags",
        },
        {
          $group: {
            _id: "$tags",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            tag: "$_id",
            count: 1,
            _id: 0,
          },
        },
        {
          $sort:
            sortBy === "alphabetical"
              ? { tag: sortOrder === "asc" ? 1 : -1 }
              : { count: sortOrder === "asc" ? 1 : -1 },
        },
      ])
      .toArray();

    logger.debug({ count: result.length }, "Blog tags retrieved");

    return result as Array<{ tag: string; count: number }>;
  }

  public async install(): Promise<void> {
    const logger = this.loggerFactory("install");
    logger.debug("Installing blog app");

    const db = await this.getDbConnection();

    logger.debug("Creating blog posts collection");
    const collection = await db.createCollection(BLOG_POSTS_COLLECTION_NAME);
    logger.debug("Blog posts collection created");

    const indexes = {
      companyId_appId_1: { companyId: 1, appId: 1 },
      companyId_appId_slug_1: { companyId: 1, appId: 1, slug: 1 },
      companyId_appId_isPublished_1: { companyId: 1, appId: 1, isPublished: 1 },
      companyId_appId_tags_1: { companyId: 1, appId: 1, tags: 1 },
      companyId_appId_createdAt_1: { companyId: 1, appId: 1, createdAt: 1 },
      companyId_appId_updatedAt_1: { companyId: 1, appId: 1, updatedAt: 1 },
      companyId_appId_publicationDate_1: {
        companyId: 1,
        appId: 1,
        publicationDate: 1,
      },
    };

    for (const [name, index] of Object.entries(indexes)) {
      logger.debug(`Checking if index ${name} exists`);
      if (await collection.indexExists(name)) {
        logger.debug(`Index ${name} already exists`);
        continue;
      }

      logger.debug(`Creating index ${name}`);
      await collection.createIndex(index, { name });
    }

    logger.debug("Blog posts collection indexed. Creating blog pages");

    const header = await this.services.pagesService.getPageHeaders({
      limit: 1,
    });

    const footer = await this.services.pagesService.getPageFooters({
      limit: 1,
    });

    const headerId = header.items[0]?._id;
    const footerId = footer.items[0]?._id;

    logger.debug({ headerId, footerId }, "Using blog pages header and footer");

    const pages = BLOG_PAGES(this.appId, headerId, footerId);

    for (const page of pages) {
      logger.debug(`Creating blog page ${page.title} (${page.slug})`);
      const isUnique = await this.services.pagesService.checkUniqueSlug(
        page.slug,
      );
      if (!isUnique) {
        logger.warn(`Blog page ${page.title} (${page.slug}) already exists`);
        continue;
      }

      logger.debug(
        `Blog page ${page.title} (${page.slug}) is unique. Creating...`,
      );
      await this.services.pagesService.createPage(page);
      logger.debug(`Blog page ${page.title} (${page.slug}) created`);
    }

    logger.debug("Blog pages created");
    logger.debug("Blog app installed");
  }
}

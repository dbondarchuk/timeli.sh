import {
  IPagesService,
  Page,
  PageFooter,
  PageFooterListModel,
  PageFooterUpdateModel,
  PageHeader,
  PageHeaderListModel,
  PageHeaderUpdateModel,
  PageListModel,
  PageUpdateModel,
  Query,
  WithTotal,
} from "@vivid/types";
import { buildSearchQuery, escapeRegex } from "@vivid/utils";
import { DateTime } from "luxon";
import { Filter, ObjectId, Sort } from "mongodb";
import {
  PAGES_COLLECTION_NAME,
  PAGE_FOOTERS_COLLECTION_NAME,
  PAGE_HEADERS_COLLECTION_NAME,
} from "./collections";
import { getDbConnection } from "./database";
import { BaseService } from "./services/base.service";

export class PagesService extends BaseService implements IPagesService {
  public constructor(companyId: string) {
    super("PagesService", companyId);
  }

  public async getPage(id: string): Promise<Page | null> {
    const logger = this.loggerFactory("getPage");
    logger.debug({ pageId: id }, "Getting page by id");

    const db = await getDbConnection();
    const pages = db.collection<Page>(PAGES_COLLECTION_NAME);

    const page = await pages.findOne({
      _id: id,
      companyId: this.companyId,
    });

    if (!page) {
      logger.warn({ pageId: id }, "Page not found");
    } else {
      logger.debug(
        {
          pageId: id,
          title: page.title,
          slug: page.slug,
          published: page.published,
        },
        "Page found",
      );
    }

    return page;
  }

  public async getPageBySlug(slug: string): Promise<Page | null> {
    const logger = this.loggerFactory("getPageBySlug");
    logger.debug({ slug }, "Getting page by slug");

    const db = await getDbConnection();
    const pages = db.collection<Page>(PAGES_COLLECTION_NAME);

    const page = await pages.findOne({
      slug,
      companyId: this.companyId,
    });

    if (!page) {
      logger.warn({ slug }, "Page not found by slug");
    } else {
      logger.debug(
        {
          slug,
          pageId: page._id,
          title: page.title,
          published: page.published,
        },
        "Page found by slug",
      );
    }

    return page;
  }

  public async getPages(
    query: Query & {
      publishStatus: boolean[];
      maxPublishDate?: Date;
      tags?: string[];
    },
  ): Promise<WithTotal<PageListModel>> {
    const logger = this.loggerFactory("getPages");
    logger.debug({ query }, "Getting pages");

    const db = await getDbConnection();

    const sort: Sort = query.sort?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr.desc ? -1 : 1,
      }),
      {},
    ) || { updatedAt: -1 };

    const filter: Filter<Page> = {
      companyId: this.companyId,
    };

    if (query.publishStatus) {
      filter.published = {
        $in: query.publishStatus,
      };
    }

    if (query.maxPublishDate) {
      filter.publishDate = {
        $lte: query.maxPublishDate,
      };
    }

    if (query.tags) {
      filter.tags = {
        $all: query.tags,
      };
    }

    if (query.search) {
      const $regex = new RegExp(escapeRegex(query.search), "i");
      const queries = buildSearchQuery<Page>(
        { $regex },
        "slug",
        "keywords",
        "title",
        "description",
      );

      filter.$or = queries;
    }

    const [result] = await db
      .collection<Page>(PAGES_COLLECTION_NAME)
      .aggregate([
        {
          $match: filter,
        },
        {
          $sort: sort,
        },
        {
          $project: {
            content: 0,
          },
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

    logger.debug(
      {
        query,
        result: { total: response.total, count: response.items.length },
      },
      "Fetched pages",
    );

    return response;
  }

  public async createPage(page: PageUpdateModel): Promise<Page> {
    const logger = this.loggerFactory("createPage");
    logger.debug(
      { page: { slug: page.slug, title: page.title } },
      "Creating new page",
    );

    const dbPage: Page = {
      ...page,
      companyId: this.companyId,
      _id: new ObjectId().toString(),
      updatedAt: DateTime.utc().toJSDate(),
      createdAt: DateTime.utc().toJSDate(),
    };

    if (!this.checkUniqueSlug(page.slug)) {
      logger.error({ slug: page.slug }, "Slug already exists");
      throw new Error("Slug already exists");
    }

    const db = await getDbConnection();
    const pages = db.collection<Page>(PAGES_COLLECTION_NAME);

    await pages.insertOne(dbPage);

    logger.debug(
      { pageId: dbPage._id, slug: dbPage.slug },
      "Successfully created page",
    );

    return dbPage;
  }

  public async updatePage(id: string, update: PageUpdateModel): Promise<void> {
    const logger = this.loggerFactory("updatePage");
    logger.debug(
      { pageId: id, update: { slug: update.slug, title: update.title } },
      "Updating page",
    );

    const db = await getDbConnection();
    const pages = db.collection<Page>(PAGES_COLLECTION_NAME);

    const { _id, companyId, ...updateObj } = update as Page; // Remove fields in case it slips here

    if (!this.checkUniqueSlug(update.slug, id)) {
      logger.error({ pageId: id, slug: update.slug }, "Slug already exists");
      throw new Error("Slug already exists");
    }

    updateObj.updatedAt = DateTime.utc().toJSDate();

    await pages.updateOne(
      {
        _id: id,
        companyId: this.companyId,
      },
      {
        $set: updateObj,
      },
    );

    logger.debug({ pageId: id }, "Successfully updated page");
  }

  public async deletePage(id: string): Promise<Page | null> {
    const logger = this.loggerFactory("deletePage");
    logger.debug({ pageId: id }, "Deleting page");

    const db = await getDbConnection();
    const pages = db.collection<Page>(PAGES_COLLECTION_NAME);

    const page = await pages.findOne({ _id: id });
    if (!page) {
      logger.warn({ pageId: id }, "Page not found for deletion");
      return null;
    }
    if (page.slug === "home") {
      logger.error({ pageId: id, slug: page.slug }, "Cannot delete home page");
      throw new Error("Can not delete home page");
    }

    await pages.deleteOne({
      _id: id,
      companyId: this.companyId,
    });

    logger.debug({ pageId: id, slug: page.slug }, "Successfully deleted page");

    return page;
  }

  public async deletePages(ids: string[]): Promise<void> {
    const logger = this.loggerFactory("deletePages");
    logger.debug({ pageIds: ids }, "Deleting multiple pages");

    const db = await getDbConnection();
    const pages = db.collection<Page>(PAGES_COLLECTION_NAME);

    const homePage = await pages.findOne({
      _id: {
        $in: ids,
      },
      slug: "home",
      companyId: this.companyId,
    });

    if (homePage) {
      logger.error({ pageIds: ids }, "Cannot delete home page");
      throw new Error("Can not delete home page");
    }

    const { deletedCount } = await pages.deleteMany({
      _id: {
        $in: ids,
      },
      companyId: this.companyId,
    });

    logger.debug(
      { pageIds: ids, count: deletedCount },
      "Successfully deleted multiple pages",
    );
  }

  public async checkUniqueSlug(slug: string, id?: string): Promise<boolean> {
    const logger = this.loggerFactory("checkUniqueSlug");
    logger.debug({ slug, id }, "Checking unique slug");
    const db = await getDbConnection();
    const pages = db.collection<Page>(PAGES_COLLECTION_NAME);

    const filter: Filter<Page> = {
      slug,
      companyId: this.companyId,
    };

    if (id) {
      filter._id = {
        $ne: id,
      };
    }

    const hasNext = await pages.aggregate([{ $match: filter }]).hasNext();

    logger.debug({ slug, id, hasNext }, "Slug check result");
    return !hasNext;
  }

  /** Page Headers */

  public async getPageHeader(id: string): Promise<PageHeader | null> {
    const logger = this.loggerFactory("getPageHeader");
    logger.debug({ pageHeaderId: id }, "Getting page header by id");

    const db = await getDbConnection();
    const pageHeaders = db.collection<PageHeader>(PAGE_HEADERS_COLLECTION_NAME);

    const pageHeader = await pageHeaders.findOne({
      _id: id,
      companyId: this.companyId,
    });

    if (!pageHeader) {
      logger.warn({ pageHeaderId: id }, "Page header not found");
    } else {
      logger.debug(
        { pageHeaderId: id, name: pageHeader.name },
        "Page header found",
      );
    }

    return pageHeader;
  }

  public async getPageHeaders(
    query: Query & { priorityIds?: string[] },
  ): Promise<WithTotal<PageHeaderListModel>> {
    const logger = this.loggerFactory("getPageHeaders");
    logger.debug({ query }, "Getting page headers");

    const sort: Sort = query.sort?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr.desc ? -1 : 1,
      }),
      {},
    ) || { updatedAt: -1 };

    const db = await getDbConnection();

    const filter: Filter<PageHeader> = {};
    if (query.search) {
      const $regex = new RegExp(escapeRegex(query.search), "i");
      const queries = buildSearchQuery<PageHeader>({ $regex }, "name");

      filter.$or = queries;
    }

    const priorityStages = query.priorityIds
      ? [
          {
            $facet: {
              priority: [
                {
                  $match: {
                    _id: {
                      $in: query.priorityIds,
                    },
                  },
                },
              ],
              other: [
                {
                  $match: {
                    ...filter,
                    _id: {
                      $nin: query.priorityIds,
                    },
                  },
                },
                {
                  $sort: sort,
                },
              ],
            },
          },
          {
            $project: {
              values: {
                $concatArrays: ["$priority", "$other"],
              },
            },
          },
          {
            $unwind: {
              path: "$values",
            },
          },
          {
            $replaceRoot: {
              newRoot: "$values",
            },
          },
        ]
      : [
          {
            $match: filter,
          },
          {
            $sort: sort,
          },
        ];

    const [result] = await db
      .collection<PageHeader>(PAGE_HEADERS_COLLECTION_NAME)
      .aggregate([
        {
          $project: {
            menu: 0,
          },
        },
        {
          $match: {
            companyId: this.companyId,
          },
        },
        {
          $lookup: {
            from: PAGES_COLLECTION_NAME,
            localField: "_id",
            foreignField: "headerId",
            as: "usedCount",
            pipeline: [
              {
                $match: {
                  companyId: this.companyId,
                },
              },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$usedCount",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            usedCount: {
              $ifNull: ["$usedCount.count", 0],
            },
          },
        },
        ...priorityStages,
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

    logger.debug(
      {
        query,
        result: { total: response.total, count: response.items.length },
      },
      "Fetched page headers",
    );

    return response;
  }

  public async createPageHeader(
    pageHeader: PageHeaderUpdateModel,
  ): Promise<PageHeader> {
    const logger = this.loggerFactory("createPageHeader");
    logger.debug(
      { pageHeader: { name: pageHeader.name } },
      "Creating new page header",
    );

    const dbPageHeader: PageHeader = {
      ...pageHeader,
      companyId: this.companyId,
      _id: new ObjectId().toString(),
      updatedAt: DateTime.utc().toJSDate(),
    };

    const db = await getDbConnection();
    const pageHeaders = db.collection<PageHeader>(PAGE_HEADERS_COLLECTION_NAME);

    await pageHeaders.insertOne(dbPageHeader);

    logger.debug(
      { pageHeaderId: dbPageHeader._id, name: dbPageHeader.name },
      "Successfully created page header",
    );

    return dbPageHeader;
  }

  public async updatePageHeader(
    id: string,
    update: PageHeaderUpdateModel,
  ): Promise<void> {
    const logger = this.loggerFactory("updatePageHeader");
    logger.debug(
      { pageHeaderId: id, update: { name: update.name } },
      "Updating page header",
    );

    const db = await getDbConnection();
    const pageHeaders = db.collection<PageHeader>(PAGE_HEADERS_COLLECTION_NAME);

    const { _id, companyId, ...updateObj } = update as PageHeader; // Remove fields in case it slips here

    updateObj.updatedAt = DateTime.utc().toJSDate();

    await pageHeaders.updateOne(
      {
        _id: id,
        companyId: this.companyId,
      },
      {
        $set: updateObj,
      },
    );

    logger.debug({ pageHeaderId: id }, "Successfully updated page header");
  }

  public async deletePageHeader(id: string): Promise<PageHeader | null> {
    const logger = this.loggerFactory("deletePageHeader");
    logger.debug({ pageHeaderId: id }, "Deleting page header");

    const db = await getDbConnection();
    const pageHeaders = db.collection<PageHeader>(PAGE_HEADERS_COLLECTION_NAME);

    const pageHeader = await pageHeaders.findOneAndDelete({
      _id: id,
      companyId: this.companyId,
    });
    if (!pageHeader) {
      logger.warn({ pageHeaderId: id }, "Page header not found for deletion");
      return null;
    }

    logger.debug({ pageHeaderId: id }, "Successfully deleted page header");
    return pageHeader;
  }

  public async deletePageHeaders(ids: string[]): Promise<void> {
    const logger = this.loggerFactory("deletePageHeaders");
    logger.debug({ pageHeaderIds: ids }, "Deleting multiple page headers");

    const db = await getDbConnection();
    const pageHeaders = db.collection<PageHeader>(PAGE_HEADERS_COLLECTION_NAME);

    const { deletedCount } = await pageHeaders.deleteMany({
      _id: {
        $in: ids,
      },
      companyId: this.companyId,
    });

    logger.debug(
      { pageHeaderIds: ids, count: deletedCount },
      "Successfully deleted multiple page headers",
    );
  }

  public async checkUniquePageHeaderName(
    name: string,
    id?: string,
  ): Promise<boolean> {
    const logger = this.loggerFactory("checkUniquePageHeaderName");
    logger.debug({ name, id }, "Checking unique page header name");
    const db = await getDbConnection();
    const pageHeaders = db.collection<PageHeader>(PAGE_HEADERS_COLLECTION_NAME);

    const filter: Filter<PageHeader> = {
      name,
      companyId: this.companyId,
    };

    if (id) {
      filter._id = {
        $ne: id,
      };
    }

    const hasNext = await pageHeaders.aggregate([{ $match: filter }]).hasNext();

    logger.debug({ name, id, hasNext }, "Name check result");
    return !hasNext;
  }

  /** Page Footers */

  public async getPageFooter(id: string): Promise<PageFooter | null> {
    const logger = this.loggerFactory("getPageFooter");
    logger.debug({ pageFooterId: id }, "Getting page footer by id");

    const db = await getDbConnection();
    const pageFooters = db.collection<PageFooter>(PAGE_FOOTERS_COLLECTION_NAME);

    const pageFooter = await pageFooters.findOne({
      _id: id,
      companyId: this.companyId,
    });

    if (!pageFooter) {
      logger.warn({ pageFooterId: id }, "Page footer not found");
    } else {
      logger.debug(
        { pageFooterId: id, name: pageFooter.name },
        "Page footer found",
      );
    }

    return pageFooter;
  }

  public async getPageFooters(
    query: Query & { priorityIds?: string[] },
  ): Promise<WithTotal<PageFooterListModel>> {
    const logger = this.loggerFactory("getPageFooters");
    logger.debug({ query }, "Getting page footers");

    const sort: Sort = query.sort?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr.desc ? -1 : 1,
      }),
      {},
    ) || { updatedAt: -1 };

    const db = await getDbConnection();

    const filter: Filter<PageFooter> = {
      companyId: this.companyId,
    };

    if (query.search) {
      const $regex = new RegExp(escapeRegex(query.search), "i");
      const queries = buildSearchQuery<PageFooter>({ $regex }, "name");

      filter.$or = queries;
    }

    const priorityStages = query.priorityIds
      ? [
          {
            $facet: {
              priority: [
                {
                  $match: {
                    _id: {
                      $in: query.priorityIds,
                    },
                  },
                },
              ],
              other: [
                {
                  $match: {
                    ...filter,
                    _id: {
                      $nin: query.priorityIds,
                    },
                  },
                },
                {
                  $sort: sort,
                },
              ],
            },
          },
          {
            $project: {
              values: {
                $concatArrays: ["$priority", "$other"],
              },
            },
          },
          {
            $unwind: {
              path: "$values",
            },
          },
          {
            $replaceRoot: {
              newRoot: "$values",
            },
          },
        ]
      : [
          {
            $match: filter,
          },
          {
            $sort: sort,
          },
        ];

    const [result] = await db
      .collection<PageFooter>(PAGE_FOOTERS_COLLECTION_NAME)
      .aggregate([
        {
          $project: {
            content: 0,
          },
        },
        {
          $match: {
            companyId: this.companyId,
          },
        },
        {
          $lookup: {
            from: PAGES_COLLECTION_NAME,
            localField: "_id",
            foreignField: "footerId",
            as: "usedCount",
            pipeline: [
              {
                $match: {
                  companyId: this.companyId,
                },
              },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$usedCount",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            usedCount: {
              $ifNull: ["$usedCount.count", 0],
            },
          },
        },
        ...priorityStages,
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

    logger.debug(
      {
        query,
        result: { total: response.total, count: response.items.length },
      },
      "Fetched page footers",
    );

    return response;
  }

  public async createPageFooter(
    pageFooter: PageFooterUpdateModel,
  ): Promise<PageFooter> {
    const logger = this.loggerFactory("createPageFooter");
    logger.debug(
      { pageFooter: { name: pageFooter.name } },
      "Creating new page footer",
    );

    const dbPageFooter: PageFooter = {
      ...pageFooter,
      companyId: this.companyId,
      _id: new ObjectId().toString(),
      updatedAt: DateTime.utc().toJSDate(),
    };

    const db = await getDbConnection();
    const pageFooters = db.collection<PageFooter>(PAGE_FOOTERS_COLLECTION_NAME);

    await pageFooters.insertOne(dbPageFooter);

    logger.debug(
      { pageFooterId: dbPageFooter._id, name: dbPageFooter.name },
      "Successfully created page footer",
    );

    return dbPageFooter;
  }

  public async updatePageFooter(
    id: string,
    update: PageFooterUpdateModel,
  ): Promise<void> {
    const logger = this.loggerFactory("updatePageFooter");
    logger.debug(
      {
        pageFooterId: id,
        update: { name: update.name },
        companyId: this.companyId,
      },
      "Updating page footer",
    );

    const db = await getDbConnection();
    const pageFooters = db.collection<PageFooter>(PAGE_FOOTERS_COLLECTION_NAME);

    const { _id, companyId, ...updateObj } = update as PageFooter; // Remove fields in case it slips here

    updateObj.updatedAt = DateTime.utc().toJSDate();

    await pageFooters.updateOne(
      {
        _id: id,
        companyId: this.companyId,
      },
      {
        $set: updateObj,
      },
    );

    logger.debug({ pageFooterId: id }, "Successfully updated page footer");
  }

  public async deletePageFooter(id: string): Promise<PageFooter | null> {
    const logger = this.loggerFactory("deletePageFooter");
    logger.debug({ pageFooterId: id }, "Deleting page footer");

    const db = await getDbConnection();
    const pageFooters = db.collection<PageFooter>(PAGE_FOOTERS_COLLECTION_NAME);

    const pageFooter = await pageFooters.findOneAndDelete({
      _id: id,
      companyId: this.companyId,
    });
    if (!pageFooter) {
      logger.warn({ pageFooterId: id }, "Page footer not found for deletion");
      return null;
    }

    logger.debug({ pageFooterId: id }, "Successfully deleted page footer");

    return pageFooter;
  }

  public async deletePageFooters(ids: string[]): Promise<void> {
    const logger = this.loggerFactory("deletePageFooters");
    logger.debug({ pageFooterIds: ids }, "Deleting multiple page footers");

    const db = await getDbConnection();
    const pageFooters = db.collection<PageFooter>(PAGE_FOOTERS_COLLECTION_NAME);

    const { deletedCount } = await pageFooters.deleteMany({
      _id: {
        $in: ids,
      },
      companyId: this.companyId,
    });

    logger.debug(
      { pageFooterIds: ids, count: deletedCount },
      "Successfully deleted multiple page footers",
    );
  }

  public async checkUniquePageFooterName(
    name: string,
    id?: string,
  ): Promise<boolean> {
    const logger = this.loggerFactory("checkUniquePageFooterName");
    logger.debug({ name, id }, "Checking unique page footer name");
    const db = await getDbConnection();
    const pageFooters = db.collection<PageFooter>(PAGE_FOOTERS_COLLECTION_NAME);

    const filter: Filter<PageFooter> = {
      name,
      companyId: this.companyId,
    };

    if (id) {
      filter._id = {
        $ne: id,
      };
    }

    const hasNext = await pageFooters.aggregate([{ $match: filter }]).hasNext();

    logger.debug({ name, id, hasNext }, "Name check result");
    return !hasNext;
  }
}

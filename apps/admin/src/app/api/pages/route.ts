import { getServicesContainer } from "@/app/utils";
import { pagesSearchParamsLoader } from "@timelish/api-sdk";
import { getLoggerFactory } from "@timelish/logger";
import { PageListModelWithUrl, pageSchema } from "@timelish/types";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/pages")("GET");
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      url: request.url,
      method: request.method,
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    },
    "Processing pages API request",
  );

  const params = pagesSearchParamsLoader(request.nextUrl.searchParams);

  const page = params.page;
  const search = params.search || undefined;
  const limit = params.limit;
  const sort = params.sort;
  const publishStatus = params.published;
  const tags = params.tags || undefined;

  const offset = (page - 1) * limit;

  logger.debug(
    {
      page,
      search,
      limit,
      sort,
      offset,
    },
    "Fetching pages with parameters",
  );

  const response = await servicesContainer.pagesService.getPages({
    search,
    limit,
    sort,
    offset,
    publishStatus,
    tags,
  });

  logger.debug(
    {
      total: response.total,
      count: response.items.length,
    },
    "Successfully retrieved pages",
  );

  const items = response.items.map(
    (page) =>
      ({
        ...page,
        slug: page.slug === "home" ? "" : page.slug,
        url: `${request.nextUrl.origin}/${page.slug === "home" ? "" : page.slug}`,
      }) satisfies PageListModelWithUrl,
  );

  return NextResponse.json({ ...response, items });
}

export async function POST(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/pages")("POST");
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      url: request.url,
      method: request.method,
    },
    "Processing pages API request",
  );

  const body = await request.json();

  const { data, error, success } = pageSchema.safeParse(body);
  if (!success) {
    logger.warn({ error }, "Invalid page update model format");
    return NextResponse.json(
      { error, success: false, code: "invalid_request_format" },
      { status: 400 },
    );
  }

  logger.debug(
    {
      pageTitle: data.title,
      pageSlug: data.slug,
      hasContent: !!data.content,
    },
    "Creating new page",
  );

  try {
    const result = await servicesContainer.pagesService.createPage(data);

    logger.debug(
      {
        pageId: result._id,
        pageTitle: data.title,
        pageSlug: data.slug,
      },
      "Page created successfully",
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    logger.error(
      {
        pageTitle: data.title,
        pageSlug: data.slug,
        error: error?.message || error?.toString(),
      },
      "Failed to create page",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to create page",
        code: "create_page_failed",
      },
      { status: 500 },
    );
  }
}

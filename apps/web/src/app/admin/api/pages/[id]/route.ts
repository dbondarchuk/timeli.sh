import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { okStatus, pageSchema } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/pages/[id]")("PUT");

  const { id } = await params;

  logger.debug(
    {
      url: request.url,
      method: request.method,
      pageId: id,
    },
    "Processing page update request",
  );

  const body = await request.json();

  const { data, error, success } = pageSchema.safeParse(body);
  if (!success) {
    logger.warn({ error, pageId: id }, "Invalid page update model format");
    return NextResponse.json(
      { error, success: false, code: "invalid_request_format" },
      { status: 400 },
    );
  }

  logger.debug(
    {
      pageId: id,
      pageTitle: data.title,
      pageSlug: data.slug,
      hasContent: !!data.content,
    },
    "Updating page",
  );

  try {
    await ServicesContainer.PagesService().updatePage(id, data);

    logger.debug(
      {
        pageId: id,
        pageTitle: data.title,
        pageSlug: data.slug,
      },
      "Page updated successfully",
    );

    return NextResponse.json(okStatus);
  } catch (error: any) {
    logger.error(
      {
        pageId: id,
        pageTitle: data.title,
        pageSlug: data.slug,
        error: error?.message || error?.toString(),
      },
      "Failed to update page",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to update page",
        code: "update_page_failed",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/pages/[id]")("DELETE");

  const { id } = await params;

  logger.debug(
    {
      url: request.url,
      method: request.method,
      pageId: id,
    },
    "Processing page delete request",
  );

  logger.debug(
    {
      pageId: id,
    },
    "Deleting page",
  );

  try {
    const page = await ServicesContainer.PagesService().deletePage(id);

    if (!page) {
      logger.warn({ pageId: id }, "Page not found for deletion");
      return NextResponse.json(
        {
          success: false,
          error: "Page not found",
          code: "page_not_found",
        },
        { status: 404 },
      );
    }

    logger.debug(
      {
        pageId: id,
        pageTitle: page.title,
        pageSlug: page.slug,
      },
      "Page deleted successfully",
    );

    return NextResponse.json(page);
  } catch (error: any) {
    logger.error(
      {
        pageId: id,
        error: error?.message || error?.toString(),
      },
      "Failed to delete page",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to delete page",
        code: "delete_page_failed",
      },
      { status: 500 },
    );
  }
}

import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@timelish/logger";
import { fileNameToMimeType, readableToWebStream } from "@timelish/utils";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { sanitizePath } from "sanitize-filepath";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/files/[[...slug]]">,
): Promise<NextResponse> {
  const params = await ctx.params;
  const servicesContainer = await getServicesContainer();
  const logger = getLoggerFactory("AdminAPI/files/[...slug]")("GET");

  const unSafeFilePath = params.slug?.join("/");
  if (!unSafeFilePath) {
    logger.warn({ unSafeFilePath }, "No filename provided");
    return notFound();
  }

  const filePath = sanitizePath(unSafeFilePath);
  const inline = request.nextUrl.searchParams.has("inline");

  logger.debug({ filePath }, "Resolving file delivery");

  const delivery = await servicesContainer.assetsStorage.getFileDelivery(
    filePath,
    inline,
  );
  if (!delivery) {
    logger.warn({ filePath }, "File not found");
    return notFound();
  }

  if (delivery.kind === "redirect") {
    return NextResponse.redirect(delivery.url, { status: 302 });
  }

  const { stream, contentLength } = delivery;
  const contentType =
    fileNameToMimeType(filePath) || "application/octet-stream";
  const fileName = path.basename(filePath);

  return new NextResponse(readableToWebStream(stream), {
    status: 200,
    headers: {
      "content-disposition": inline
        ? "inline"
        : `attachment; filename=${fileName}`,
      "content-type": contentType,
      "content-length": `${contentLength}`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

import { getOrganizationId, getServicesContainer } from "@/utils/utils";
import { readableToWebStream } from "@timelish/utils";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

type Props = RouteContext<"/assets/[[...slug]]">;

export async function GET(
  request: NextRequest,
  props: Props,
): Promise<NextResponse> {
  const params = await props.params;

  const filePath = params?.slug?.join("/");
  if (!filePath) {
    return notFound();
  }

  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return notFound();
  }

  const inline = request.nextUrl.searchParams.has("inline");
  const servicesContainer = await getServicesContainer();
  const delivery = await servicesContainer.assetsService.getAssetDelivery(
    filePath,
    inline,
  );
  if (!delivery) {
    return notFound();
  }

  if (delivery.kind === "redirect") {
    const response = NextResponse.redirect(delivery.url, { status: 308 });
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable",
    );
    return response;
  }

  const { asset, stream } = delivery;
  const fileName = path.basename(filePath);

  return new NextResponse(readableToWebStream(stream), {
    status: 200,
    headers: {
      "content-disposition": inline
        ? "inline"
        : `attachment; filename=${fileName}`,
      "content-type": asset.mimeType,
      "content-length": `${asset.size}`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

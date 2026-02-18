import { getServicesContainer, getWebsiteUrl } from "@/app/utils";
import { assetsSearchParamsLoader } from "@timelish/api-sdk";
import { getLoggerFactory } from "@timelish/logger";
import { UploadedFile } from "@timelish/types";
import {
  fileNameToMimeType,
  getAppointmentBucket,
  getCustomerBucket,
} from "@timelish/utils";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/assets")("GET");
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      url: request.url,
      method: request.method,
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    },
    "Processing assets API request",
  );

  const params = assetsSearchParamsLoader(request.nextUrl.searchParams);

  const page = params.page;
  const search = params.search || undefined;
  const limit = params.limit;
  const sort = params.sort;

  const accept = params.accept || undefined;

  const customerIds = params.customerId || undefined;
  const appointmentIds = params.appointmentId || undefined;

  const offset = (page - 1) * limit;

  logger.debug(
    {
      page,
      search,
      limit,
      sort,
      offset,
    },
    "Fetching assets with parameters",
  );

  const response = await servicesContainer.assetsService.getAssets({
    search,
    accept,
    limit,
    sort,
    offset,
    customerId: customerIds,
    appointmentId: appointmentIds,
  });

  logger.debug(
    {
      total: response.total,
      count: response.items.length,
    },
    "Successfully retrieved assets",
  );

  const websiteUrl = await getWebsiteUrl();

  const items = response.items.map(
    (asset) =>
      ({
        ...asset,
        url: `${websiteUrl}/assets/${asset.filename}`,
      }) satisfies UploadedFile,
  );

  return NextResponse.json({ ...response, items });
}

export async function POST(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI")("assets");
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      url: request.url,
      method: request.method,
    },
    "Processing assets upload request",
  );

  const formData = await request.formData();

  const file = formData.get("file");
  let bucket = formData.get("bucket") as string;
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      {
        success: false,
        error: "File is required",
        code: "missing_file",
      },
      { status: 400 },
    );
  }

  const fileType = fileNameToMimeType(file.name);

  const appointmentId = (formData.get("appointmentId") as string) ?? undefined;
  const customerId = (formData.get("customerId") as string) ?? undefined;

  if (appointmentId) {
    bucket = getAppointmentBucket(appointmentId);
  } else if (customerId) {
    bucket = getCustomerBucket(customerId);
  }

  try {
    const asset = await servicesContainer.assetsService.createAsset(
      {
        filename: `${bucket ? `${bucket}/` : ""}${v4()}-${file.name}`,
        mimeType: fileType,
        description: (formData.get("description") as string) ?? undefined,
        appointmentId,
        customerId,
      },
      file,
    );

    logger.debug(
      {
        filename: asset.filename,
        size: asset.size,
      },
      "Successfully uploaded asset",
    );

    const websiteUrl = await getWebsiteUrl();

    const uploadedFile: UploadedFile = {
      ...asset,
      url: `${websiteUrl}/assets/${asset.filename}`,
    };

    return NextResponse.json(uploadedFile, { status: 201 });
  } catch (error: any) {
    logger.error(
      {
        filename: file.name,
        error: error?.message || error?.toString(),
      },
      "Failed to upload asset",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to upload asset",
        code: "upload_asset_failed",
      },
      { status: 500 },
    );
  }
}

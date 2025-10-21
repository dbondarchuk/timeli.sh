import { assetsSearchParamsLoader } from "@vivid/api-sdk";
import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { UploadedFile } from "@vivid/types";
import { getAppointmentBucket, getCustomerBucket } from "@vivid/utils";
import mimeType from "mime-type/with-db";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export async function GET(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/assets")("GET");

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

  const response = await ServicesContainer.AssetsService().getAssets({
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

  const { url } =
    await ServicesContainer.ConfigurationService().getConfiguration("general");

  const items = response.items.map(
    (asset) =>
      ({
        ...asset,
        url: `${url}/assets/${asset.filename}`,
      }) satisfies UploadedFile,
  );

  return NextResponse.json({ ...response, items });
}

export async function POST(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI")("assets");
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

  let fileType = mimeType.lookup(file.name);
  if (!fileType) {
    fileType = "application/octet-stream";
  } else if (Array.isArray(fileType)) {
    fileType = fileType[0];
  }

  const appointmentId = (formData.get("appointmentId") as string) ?? undefined;
  const customerId = (formData.get("customerId") as string) ?? undefined;

  if (appointmentId) {
    bucket = getAppointmentBucket(appointmentId);
  } else if (customerId) {
    bucket = getCustomerBucket(customerId);
  }

  try {
    const asset = await ServicesContainer.AssetsService().createAsset(
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

    const { url } =
      await ServicesContainer.ConfigurationService().getConfiguration(
        "general",
      );

    const uploadedFile: UploadedFile = {
      ...asset,
      url: `${url}/assets/${asset.filename}`,
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

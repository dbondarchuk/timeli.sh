import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { baseSearchParams } from "@vivid/ui-admin";
import { NextRequest, NextResponse } from "next/server";
import { createLoader } from "nuqs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/appointments/[id]/history")("GET");
  const { id: appointmentId } = await params;

  logger.debug(
    {
      url: request.url,
      method: request.method,
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    },
    "Processing appointment history API request",
  );

  const loader = createLoader(baseSearchParams);
  const searchParams = loader(request.nextUrl.searchParams);

  const page = searchParams.page;
  const search = searchParams.search ?? undefined;
  const limit = searchParams.limit;
  const sort = searchParams.sort ?? [
    {
      id: "dateTime",
      desc: true,
    },
  ];

  const offset = (page - 1) * limit;

  logger.debug(
    {
      page,
      limit,
      offset,
    },
    "Fetching appointment history with parameters",
  );

  const res = await ServicesContainer.EventsService().getAppointmentHistory({
    offset,
    limit,
    search,
    sort: sort ?? undefined,
    appointmentId,
  });

  logger.debug(
    {
      total: res.total,
      count: res.items.length,
    },
    "Successfully retrieved appointment history",
  );

  return NextResponse.json(res);
}

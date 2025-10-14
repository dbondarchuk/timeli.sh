import { ServicesContainer } from "@vivid/services";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const response =
    await ServicesContainer.EventsService().getAppointmentOptions();

  return NextResponse.json(response);
}

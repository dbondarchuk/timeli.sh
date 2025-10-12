import { NextRequest, NextResponse } from "next/server";
import { getOptions } from "./utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const response = await getOptions();

  return NextResponse.json(response);
}

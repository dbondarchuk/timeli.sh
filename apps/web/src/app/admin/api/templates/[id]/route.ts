import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { okStatus, templateSchema } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";

export const fetchCache = "force-cache";
export const revalidate = 10;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/templates/[id]")("GET");
  const { id } = await params;

  logger.debug(
    {
      url: request.url,
      method: request.method,
      templateId: id,
    },
    "Processing template by ID API request",
  );

  const template = await ServicesContainer.TemplatesService().getTemplate(id);

  if (!template) {
    logger.warn({ templateId: id }, "Template not found");
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  logger.debug(
    {
      templateId: id,
      templateName: template.name,
      templateType: template.type,
    },
    "Successfully retrieved template",
  );

  const headers = new Headers();
  headers.append("Cache-Control", "max-age=10");

  return NextResponse.json(template, { headers });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/templates/[id]")("PUT");
  const { id } = await params;

  logger.debug(
    {
      url: request.url,
      method: request.method,
      templateId: id,
    },
    "Processing update template by ID API request",
  );

  const body = await request.json();
  const { data, success, error } = templateSchema.safeParse(body);

  if (!success) {
    return NextResponse.json(
      { error: error.message, code: "invalid_request", success: false },
      { status: 400 },
    );
  }

  await ServicesContainer.TemplatesService().updateTemplate(id, data);
  logger.debug("Template updated successfully", {
    templateId: id,
    templateName: data.name,
    templateType: data.type,
  });

  return NextResponse.json(okStatus);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/templates/[id]")("DELETE");
  const { id } = await params;

  logger.debug(
    {
      url: request.url,
      method: request.method,
      templateId: id,
    },
    "Processing delete template by ID API request",
  );

  const result = await ServicesContainer.TemplatesService().deleteTemplate(id);

  if (!result) {
    logger.warn({ templateId: id }, "Template not found");
    return NextResponse.json(
      { error: "Template not found", code: "not_found", success: false },
      { status: 404 },
    );
  }

  logger.debug("Template deleted successfully", {
    templateId: id,
  });

  return NextResponse.json(result);
}

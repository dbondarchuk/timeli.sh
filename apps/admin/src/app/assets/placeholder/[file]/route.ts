import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const generatePlaceholderImage = async ({
  width,
  height,
  r = 128,
  g = 128,
  b = 128,
  text,
  format = "png",
}: {
  width: number;
  height: number;
  r?: number;
  g?: number;
  b?: number;
  text: string;
  format?: "png" | "jpg";
}) => {
  const overlay = `<svg width="${width - 20}" height="${height - 20}">
    <text x="50%" y="50%" font-family="sans-serif" font-size="16" text-anchor="middle">${text}</text>
  </svg>`;

  return await sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r, g, b, alpha: 1 },
    },
  })
    .composite([
      {
        input: Buffer.from(overlay),
        gravity: "center",
      },
    ])
    [format === "jpg" ? "jpeg" : "png"]()
    .toBuffer();
};

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/assets/placeholder/[file]">,
): Promise<NextResponse> {
  const { file } = await ctx.params;

  const lastDotIndex = file.lastIndexOf(".");
  const filename = file.substring(0, lastDotIndex).toLowerCase().split("x", 2);
  const ext = file.substring(lastDotIndex + 1);

  const width = parseInt(filename[0]);
  const height = parseInt(filename[1]);

  if (!width || !height || !["jpg", "png"].includes(ext)) {
    return notFound();
  }

  const result = await generatePlaceholderImage({
    width,
    height,
    format: ext as any,
    text: `${width}X${height}`,
  });

  if (!result) {
    return notFound();
  }

  const contentType = `image/${ext}`;
  const inline = request.nextUrl.searchParams.has("inline");

  const res = new NextResponse(Buffer.from(result), {
    status: 200,
    headers: new Headers({
      //Headers
      "content-disposition": inline ? "inline" : `attachment; filename=${file}`, //State that this is a file attachment
      "content-type": contentType,
      "content-length": `${result.length}`,
    }),
  });

  return res;
}

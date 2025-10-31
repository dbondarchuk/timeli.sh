import { getServicesContainer, getWebsiteUrl } from "@/utils/utils";
import { getLoggerFactory } from "@vivid/logger";
import { NextRequest } from "next/server";

type Sitemap = {
  url: string;
  lastModified: Date;
  priority: number;
}[];

function generateSiteMap(pages: Sitemap) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${pages
       .map(({ url, lastModified, priority }) => {
         return `
       <url>
           <loc>${url}</loc>
           <lastmod>${lastModified.toISOString()}</lastmod>
           <priority>${priority}</priority>
       </url>
     `;
       })
       .join("")}
   </urlset>
 `;
}

export async function GET(req: NextRequest) {
  const logger = getLoggerFactory("API/sitemap")("GET");

  logger.debug(
    {
      url: req.url,
      method: req.method,
    },
    "Processing sitemap.xml request",
  );

  const url = await getWebsiteUrl();
  const servicesContainer = await getServicesContainer();

  const pages = await servicesContainer.pagesService.getPages({
    publishStatus: [true],
  });

  const sitemap: Sitemap = [
    {
      url,
      lastModified: new Date(),
      priority: 1,
    },
    ...pages.items.map((page) => ({
      url: `${url}/${page.slug}`,
      lastModified: page.updatedAt,
      priority: 0.8,
    })),
  ];

  logger.debug(
    {
      baseUrl: url,
      pageCount: pages.items.length,
      totalUrls: sitemap.length,
    },
    "Successfully generated sitemap",
  );

  return new Response(generateSiteMap(sitemap), {
    headers: { "Content-Type": "text/xml" },
  });
}

export const dynamic = "force-dynamic";

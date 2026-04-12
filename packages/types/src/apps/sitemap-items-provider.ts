import type { Page } from "../pages/page";
import type { ConnectedAppData } from "./connected-app.data";

export type SitemapUrlEntry = {
  url: string;
  lastModified: Date;
  priority: number;
};

/**
 * Optional methods implemented by connected apps that declare the
 * `sitemap-items-provider` scope.
 */
export interface ISitemapItemsProvider {
  /**
   * Additional sitemap URLs (already absolute) for this connected app.
   */
  provideSitemapUrls?: (
    appData: ConnectedAppData,
    websiteUrl: string,
  ) => Promise<SitemapUrlEntry[]>;

  /**
   * Expand a CMS page whose slug contains route placeholders (e.g. `blog/[slug]`).
   * Return concrete URLs to include; return undefined/empty when this app does not
   * handle this page. The placeholder page itself is never listed in the sitemap.
   */
  expandPlaceholderPageSitemapItems?: (
    appData: ConnectedAppData,
    websiteUrl: string,
    page: Page,
  ) => Promise<SitemapUrlEntry[] | undefined>;
}

/** True when any path segment is a bracket placeholder, e.g. `[slug]`. */
export function pageSlugHasPlaceholder(slug: string): boolean {
  return slug.split("/").some((segment) => /^\[[^\]]+\]$/.test(segment));
}

import { Query, WithTotal } from "../database";
import {
  Page,
  PageFooter,
  PageFooterListModel,
  PageFooterUpdateModel,
  PageHeader,
  PageHeaderListModel,
  PageHeaderUpdateModel,
  PageListModel,
  PageUpdateModel,
} from "../pages";

export interface IPagesService {
  /** Pages */

  getPage(id: string): Promise<Page | null>;
  getPageBySlug(slug: string): Promise<Page | null>;
  getPages(
    query: Query & {
      publishStatus: boolean[];
      maxPublishDate?: Date;
      tags?: string[];
    },
  ): Promise<WithTotal<PageListModel>>;
  createPage(page: PageUpdateModel): Promise<Page>;
  updatePage(id: string, update: PageUpdateModel): Promise<void>;
  deletePage(id: string): Promise<Page | null>;
  deletePages(ids: string[]): Promise<void>;
  checkUniqueSlug(slug: string, id?: string): Promise<boolean>;

  /** Page Headers */

  getPageHeader(id: string): Promise<PageHeader | null>;
  getPageHeaders(
    query: Query & { priorityIds?: string[] },
  ): Promise<WithTotal<PageHeaderListModel>>;
  createPageHeader(pageHeader: PageHeaderUpdateModel): Promise<PageHeader>;
  updatePageHeader(id: string, update: PageHeaderUpdateModel): Promise<void>;
  deletePageHeader(id: string): Promise<PageHeader | null>;
  deletePageHeaders(ids: string[]): Promise<void>;
  checkUniquePageHeaderName(name: string, id?: string): Promise<boolean>;

  /** Page Footers */

  getPageFooter(id: string): Promise<PageFooter | null>;
  getPageFooters(
    query: Query & { priorityIds?: string[] },
  ): Promise<WithTotal<PageFooterListModel>>;
  createPageFooter(pageFooter: PageFooterUpdateModel): Promise<PageFooter>;
  updatePageFooter(id: string, update: PageFooterUpdateModel): Promise<void>;
  deletePageFooter(id: string): Promise<PageFooter | null>;
  deletePageFooters(ids: string[]): Promise<void>;
  checkUniquePageFooterName(name: string, id?: string): Promise<boolean>;
}

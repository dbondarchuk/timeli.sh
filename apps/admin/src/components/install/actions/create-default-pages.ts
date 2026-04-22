"use server";

import { WAITLIST_APP_NAME } from "@timelish/app-store";
import type { Language } from "@timelish/i18n";
import { getI18nAsync } from "@timelish/i18n/server";
import { getLoggerFactory } from "@timelish/logger";
import { deserializeMarkdown } from "@timelish/rte";
import { systemEventSource, type IServicesContainer } from "@timelish/types";
import { bookDefaultPage } from "../defaults/book";
import { footerDefaultPage } from "../defaults/footer";
import { homeDefaultPage, TemplateServiceArg } from "../defaults/home";
import { modifyDefaultPage } from "../defaults/modify";

type CompleteInstallPagesInput = {
  services: IServicesContainer;
  isCancelRescheduleEnabled: boolean;
  isBlogEnabled: boolean;
  language: Language;
  businessName: string;
  hasAddress: boolean;
};

const DEFAULT_HEADER_NAME = "Default Header";
const DEFAULT_FOOTER_NAME = "Default Footer";
const DEFAULT_HOME_TITLE = "Home";

function getByPath(
  value: Record<string, unknown>,
  path: string,
): string | undefined {
  let current: unknown = value;
  for (const part of path.split(".")) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

function replaceSimpleTokens(
  template: string,
  context: Record<string, unknown>,
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, token) => {
    if (token === ".") {
      const self = context["."];
      return typeof self === "string" ? self : "";
    }
    const value = getByPath(context, token);
    return value ?? "";
  });
}

function toJsonString(value: unknown): string {
  return JSON.stringify(value);
}

async function getInstallPageDefaultsLabels(language: Language) {
  const logger = getLoggerFactory("InstallActions")(
    "getInstallPageDefaultsLabels",
  );
  logger.debug({ language }, "Resolving install page default labels");
  const t = await getI18nAsync({ locale: language, namespace: "install" });
  return {
    headerBookLabel: t("wizard.finish.pageDefaults.header.bookLabel"),
    headerBlogLabel: t("wizard.finish.pageDefaults.header.blogLabel"),
    footer: {
      contactUsLabel: t("wizard.finish.pageDefaults.footer.contactUsLabel"),
      phoneLabel: t("wizard.finish.pageDefaults.footer.phoneLabel"),
      emailLabel: t("wizard.finish.pageDefaults.footer.emailLabel"),
      addressLabel: t("wizard.finish.pageDefaults.footer.addressLabel"),
      bookNowLabel: t("wizard.finish.pageDefaults.footer.bookNowLabel"),
      cancelOrRescheduleLabel: t(
        "wizard.finish.pageDefaults.footer.cancelOrRescheduleLabel",
      ),
      policiesLabel: t("wizard.finish.pageDefaults.footer.policiesLabel"),
    },
    homeLabels: {
      title: t("wizard.finish.pageDefaults.home.title"),
      description: t("wizard.finish.pageDefaults.home.description"),
      cancelOrRescheduleLabel: t(
        "wizard.finish.pageDefaults.home.cancelOrRescheduleLabel",
      ),
      bookNowLabel: t("wizard.finish.pageDefaults.home.bookNowLabel"),
      ourServicesLabel: t("wizard.finish.pageDefaults.home.ourServicesLabel"),
      galleryLabel: t("wizard.finish.pageDefaults.home.galleryLabel"),
    },
    bookLabels: {
      bookNowLabel: t("wizard.finish.pageDefaults.book.bookNowLabel"),
      manageYourAppointment: t(
        "wizard.finish.pageDefaults.book.manageYourAppointment",
      ),
      policiesText: t("wizard.finish.pageDefaults.book.policiesText"),
    },
  };
}

async function getTemplateServices(
  services: IServicesContainer,
): Promise<TemplateServiceArg[]> {
  const logger = getLoggerFactory("InstallActions")("getTemplateServices");
  logger.debug("Building template services payload");
  const booking =
    (await services.configurationService.getConfiguration("booking")) ?? null;
  const optionIds = (booking?.options ?? [])
    .map((o) => o.id)
    .filter((id): id is string => Boolean(id));

  const output: TemplateServiceArg[] = [];
  for (const optionId of optionIds) {
    const option = await services.servicesService.getOption(optionId);
    if (!option) continue;

    const descriptionMarkdown =
      typeof option.description === "string" ? option.description : "";
    const descriptionPlate = deserializeMarkdown(descriptionMarkdown);

    output.push({
      id: optionId,
      name: String(option.name ?? "").trim() || "Service",
      description: descriptionPlate,
    });
  }

  logger.debug({ count: output.length }, "Built template services payload");
  return output;
}

async function upsertDefaultHeader(
  services: IServicesContainer,
  isBlogEnabled: boolean,
  bookLabel: string,
  blogLabel: string,
): Promise<string> {
  const logger = getLoggerFactory("InstallActions")("upsertDefaultHeader");
  logger.debug("Upserting default header");
  const pagesService = services.pagesService;
  const headers = await pagesService.getPageHeaders({
    search: DEFAULT_HEADER_NAME,
    limit: 50,
    offset: 0,
  });
  const existing = headers.items.find(
    (item) => item.name === DEFAULT_HEADER_NAME,
  );

  const headerData = {
    name: DEFAULT_HEADER_NAME,
    showLogo: true,
    sticky: false,
    shadow: "none" as const,
    menu: [
      ...(isBlogEnabled
        ? [
            {
              type: "button" as const,
              label: blogLabel,
              url: "/blog",
              variant: "ghost" as const,
              size: "default" as const,
            },
          ]
        : []),
      {
        type: "button" as const,
        label: bookLabel,
        url: "/book",
        variant: "primary" as const,
        size: "default" as const,
      },
    ],
  };

  if (existing) {
    await pagesService.updatePageHeader(
      existing._id,
      headerData,
      systemEventSource,
    );
    logger.debug({ headerId: existing._id }, "Updated default header");
    return existing._id;
  }

  const created = await pagesService.createPageHeader(
    headerData,
    systemEventSource,
  );
  logger.debug({ headerId: created._id }, "Created default header");
  return created._id;
}

async function upsertDefaultFooter(
  services: IServicesContainer,
  hasAddress: boolean,
  footerLabels: Record<string, string>,
): Promise<string> {
  const logger = getLoggerFactory("InstallActions")("upsertDefaultFooter");
  logger.debug("Upserting default footer");
  const pagesService = services.pagesService;
  const footers = await pagesService.getPageFooters({
    search: DEFAULT_FOOTER_NAME,
    limit: 50,
    offset: 0,
  });
  const existing = footers.items.find(
    (item) => item.name === DEFAULT_FOOTER_NAME,
  );

  const footerContent = footerDefaultPage(hasAddress, footerLabels);

  const footerData = {
    name: DEFAULT_FOOTER_NAME,
    content: footerContent,
  };

  if (existing) {
    await pagesService.updatePageFooter(
      existing._id,
      footerData,
      systemEventSource,
    );
    logger.debug({ footerId: existing._id }, "Updated default footer");
    return existing._id;
  }

  const created = await pagesService.createPageFooter(
    footerData,
    systemEventSource,
  );
  logger.debug({ footerId: created._id }, "Created default footer");
  return created._id;
}

async function upsertDefaultHomePage(
  services: IServicesContainer,
  args: {
    businessName: string;
    language: Language;
    headerId: string;
    footerId: string;
    homeLabels: Record<string, string>;
    templateServices: TemplateServiceArg[];
  },
): Promise<void> {
  const logger = getLoggerFactory("InstallActions")("upsertDefaultHomePage");
  logger.debug("Upserting default home page");
  const pagesService = services.pagesService;
  const homePage = await pagesService.getPageBySlug("home");

  const homeContent = homeDefaultPage(args.templateServices, args.homeLabels);

  const pageData = {
    title: DEFAULT_HOME_TITLE,
    description: `${args.businessName} home page`,
    keywords: `${args.businessName}, booking, services`,
    slug: "home",
    published: true,
    publishDate: new Date(),
    headerId: args.headerId,
    footerId: args.footerId,
    content: homeContent,
  };

  if (homePage) {
    await pagesService.updatePage(homePage._id, pageData, systemEventSource);
    logger.debug(
      { pageId: homePage._id, slug: "home" },
      "Updated default home page",
    );
    return;
  }

  await pagesService.createPage(pageData, systemEventSource);
  logger.debug({ slug: "home" }, "Created default home page");
}

async function upsertDefaultBookPage(
  services: IServicesContainer,
  args: {
    businessName: string;
    language: Language;
    headerId: string;
    footerId: string;
    bookLabels: Record<string, string>;
  },
): Promise<void> {
  const logger = getLoggerFactory("InstallActions")("upsertDefaultBookPage");
  logger.debug("Upserting default book page");
  const pagesService = services.pagesService;
  const bookPage = await pagesService.getPageBySlug("book");
  const waitlistApp = (
    await services.connectedAppsService.getAppsByApp(WAITLIST_APP_NAME)
  )[0];

  const bookContent = bookDefaultPage(waitlistApp?._id, args.bookLabels);

  const pageData = {
    title: args.bookLabels.bookNowLabel || "Book now",
    description: `${args.businessName} booking page`,
    keywords: `${args.businessName}, book, appointment`,
    slug: "book",
    published: true,
    publishDate: new Date(),
    headerId: args.headerId,
    footerId: args.footerId,
    content: bookContent,
  };

  if (bookPage) {
    await pagesService.updatePage(bookPage._id, pageData, systemEventSource);
    logger.debug(
      { pageId: bookPage._id, slug: "book" },
      "Updated default book page",
    );
    return;
  }

  await pagesService.createPage(pageData, systemEventSource);
  logger.debug({ slug: "book" }, "Created default book page");
}

async function upsertDefaultModifyPage(
  services: IServicesContainer,
  isCancelRescheduleEnabled: boolean,
  args: {
    businessName: string;
    language: Language;
    headerId: string;
    footerId: string;
    bookLabels: Record<string, string>;
  },
): Promise<void> {
  const logger = getLoggerFactory("InstallActions")("upsertDefaultModifyPage");
  logger.debug("Upserting default modify page");
  const pagesService = services.pagesService;
  const modifyPage = await pagesService.getPageBySlug("book/modify");

  const modifyContent = modifyDefaultPage(args.bookLabels);

  const pageData = {
    title: args.bookLabels.manageYourAppointment || "Manage appointment",
    description: `${args.businessName} modify appointment page`,
    keywords: `${args.businessName}, appointment, modify, cancel, reschedule`,
    slug: "book/modify",
    published: isCancelRescheduleEnabled,
    publishDate: new Date(),
    headerId: args.headerId,
    footerId: args.footerId,
    content: modifyContent,
  };

  if (modifyPage) {
    await pagesService.updatePage(
      modifyPage._id,
      pageData,
      systemEventSource,
    );
    logger.debug(
      { pageId: modifyPage._id, slug: "book/modify" },
      "Updated default modify page",
    );
    return;
  }

  await pagesService.createPage(pageData, systemEventSource);
  logger.debug({ slug: "book/modify" }, "Created default modify page");
}

export async function createInstallDefaultPages(
  input: CompleteInstallPagesInput,
): Promise<void> {
  const logger = getLoggerFactory("InstallActions")(
    "createInstallDefaultPages",
  );
  logger.debug({ language: input.language }, "Creating install default pages");

  const labels = await getInstallPageDefaultsLabels(input.language);
  const templateServices = await getTemplateServices(input.services);
  const headerId = await upsertDefaultHeader(
    input.services,
    input.isBlogEnabled,
    labels.headerBookLabel,
    labels.headerBlogLabel,
  );
  const footerId = await upsertDefaultFooter(
    input.services,
    input.hasAddress,
    labels.footer,
  );

  await upsertDefaultHomePage(input.services, {
    businessName: input.businessName,
    language: input.language,
    headerId,
    footerId,
    homeLabels: labels.homeLabels,
    templateServices,
  });

  await upsertDefaultBookPage(input.services, {
    businessName: input.businessName,
    language: input.language,
    headerId,
    footerId,
    bookLabels: labels.bookLabels,
  });

  await upsertDefaultModifyPage(
    input.services,
    input.isCancelRescheduleEnabled,
    {
      businessName: input.businessName,
      language: input.language,
      headerId,
      footerId,
      bookLabels: labels.bookLabels,
    },
  );
  logger.debug({ language: input.language }, "Created install default pages");
}

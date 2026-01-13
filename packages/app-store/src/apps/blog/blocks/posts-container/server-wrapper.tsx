import { I18nText } from "@timelish/i18n";
import { BlogPost } from "../../models";
import { BlogPublicAllKeys } from "../../translations/types";
import { BlogPostsContainerComponent } from "./component";
import { BlogPostsContainerReaderProps } from "./schema";

type BlogPostsContainerServerWrapperProps = {
  props: BlogPostsContainerReaderProps["props"];
  style: BlogPostsContainerReaderProps["style"];
  blockBase?: { className?: string; id?: string };
  restProps: any;
  appId?: string;
  args?: {
    posts?: BlogPost[];
    totalPosts?: number;
    page?: number;
    postsPerPage?: number;
    tag?: string;
    searchParams?: Record<string, string | string[] | undefined>;
  };
};

export const BlogPostsContainerServerWrapper = async ({
  props,
  style,
  blockBase,
  restProps,
  appId,
  args,
}: BlogPostsContainerServerWrapperProps) => {
  const { headers } = await import("next/headers");
  const { ServicesContainer } = await import("@timelish/services");
  const { BlogRepositoryService } = await import(
    "../../service/repository-service"
  );

  const children = props?.children ?? [];
  const postsPerPage = props?.postsPerPage ?? 10;

  // If posts already provided in args, use them
  if (args?.posts) {
    return (
      <BlogPostsContainerComponent
        posts={args.posts}
        totalPosts={args.totalPosts ?? args.posts.length}
        page={args.page ?? 1}
        postsPerPage={postsPerPage}
        tag={args.tag}
        children={children}
        style={style}
        blockBase={blockBase}
        restProps={restProps}
        isEditor={false}
        appId={appId}
        args={args}
      />
    );
  }

  // Fetch from database if appId is provided
  if (!appId) {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-red-500">
          <I18nText
            text={
              "app_blog_public.errors.blogAppNotConfigured.title" satisfies BlogPublicAllKeys
            }
          />
        </div>
        <p className="text-sm text-gray-500">
          <I18nText
            text={
              "app_blog_public.errors.blogAppNotConfigured.description" satisfies BlogPublicAllKeys
            }
          />
        </p>
      </div>
    );
  }

  // Get page and tag from search params
  const searchParams = args?.searchParams || {};
  const page = searchParams.page ? parseInt(String(searchParams.page), 10) : 1;
  const tag = searchParams.tag ? String(searchParams.tag) : undefined;

  // Get services and fetch posts
  const headersList = await headers();
  const companyId = headersList.get("x-company-id") as string;

  if (!companyId) {
    // Fallback to empty array if no companyId
    return (
      <BlogPostsContainerComponent
        posts={[]}
        totalPosts={0}
        page={1}
        postsPerPage={postsPerPage}
        children={children}
        style={style}
        blockBase={blockBase}
        restProps={restProps}
        isEditor={false}
        appId={appId}
        args={args}
      />
    );
  }

  const servicesContainer = ServicesContainer(companyId);

  // Get app service props to access getDbConnection
  const appServiceProps =
    servicesContainer.connectedAppsService.getAppServiceProps(appId);

  // Create repository service directly
  const repositoryService = new BlogRepositoryService(
    appId,
    companyId,
    appServiceProps.getDbConnection,
    appServiceProps.services,
  );

  const limit = postsPerPage;
  const offset = (page - 1) * limit;

  const result = await repositoryService.getBlogPosts({
    offset,
    limit,
    tag,
    isPublished: true,
  });

  return (
    <BlogPostsContainerComponent
      posts={result.items || []}
      totalPosts={result.total}
      page={page}
      postsPerPage={postsPerPage}
      tag={tag}
      children={children}
      style={style}
      blockBase={blockBase}
      restProps={restProps}
      isEditor={false}
      appId={appId}
      args={args}
    />
  );
};

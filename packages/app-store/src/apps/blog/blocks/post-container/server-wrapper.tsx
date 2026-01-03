import { BlogPost } from "../../models";
import { BlogPublicAllKeys } from "../../translations/types";
import { BlogPostContainerComponent } from "./component";
import { BlogPostContainerReaderProps } from "./schema";

type BlogPostContainerServerWrapperProps = {
  props: BlogPostContainerReaderProps["props"];
  style: BlogPostContainerReaderProps["style"];
  blockBase?: { className?: string; id?: string };
  restProps: any;
  appId?: string;
  args?: {
    post?: BlogPost;
    _item?: BlogPost;
    slug?: string;
    params?: {
      slug?: string;
    };
  };
};

export const BlogPostContainerServerWrapper = async ({
  props,
  style,
  blockBase,
  restProps,
  appId,
  args,
}: BlogPostContainerServerWrapperProps) => {
  const { headers } = await import("next/headers");
  const { ServicesContainer } = await import("@timelish/services");
  const { BlogRepositoryService } = await import(
    "../../service/repository-service"
  );

  const children = props?.children ?? [];

  // Get postUrl from props
  const postUrl = props?.postUrl ?? "/blog/[slug]";

  // Get post from _item (from ForeachContainer) or post (direct injection)
  let post = args?._item ?? args?.post ?? null;
  let error: BlogPublicAllKeys | null = null;

  // Generate postLink by replacing [slug] with actual slug
  const generatePostLink = (slug: string | undefined): string | null => {
    if (!slug) return null;
    return postUrl.replace("[slug]", slug);
  };

  // If post already exists, use it
  if (post) {
    const postLink = generatePostLink(post.slug);
    return (
      <BlogPostContainerComponent
        args={args}
        post={post}
        error={null}
        postLink={postLink}
        children={children}
        style={style}
        blockBase={blockBase}
        restProps={restProps}
        isEditor={false}
        appId={appId}
      />
    );
  }

  // Try to get post by slug from args
  const slug = args?.params?.slug;
  if (!slug || !appId) {
    if (!slug) {
      error = "app_blog_public.notInBlogContext" satisfies BlogPublicAllKeys;
    } else {
      error = "app_blog_public.blogPostNotFound" satisfies BlogPublicAllKeys;
    }
    return (
      <BlogPostContainerComponent
        args={args}
        post={null}
        error={error}
        postLink={null}
        children={children}
        style={style}
        blockBase={blockBase}
        restProps={restProps}
        isEditor={false}
        appId={appId}
      />
    );
  }

  // Fetch post by slug from database
  const headersList = await headers();
  const companyId = headersList.get("x-company-id") as string;

  if (!companyId) {
    error = "app_blog_public.blogPostNotFound" satisfies BlogPublicAllKeys;
    return (
      <BlogPostContainerComponent
        args={args}
        post={null}
        error={error}
        postLink={null}
        children={children}
        style={style}
        blockBase={blockBase}
        restProps={restProps}
        isEditor={false}
        appId={appId}
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

  const fetchedPost = await repositoryService.getBlogPost(undefined, slug);

  if (!fetchedPost) {
    error = "app_blog_public.blogPostNotFound" satisfies BlogPublicAllKeys;
  }

  const postLink = generatePostLink(fetchedPost?.slug);

  return (
    <BlogPostContainerComponent
      args={args}
      post={fetchedPost}
      error={error}
      postLink={postLink}
      children={children}
      style={style}
      blockBase={blockBase}
      restProps={restProps}
      isEditor={false}
      appId={appId}
    />
  );
};

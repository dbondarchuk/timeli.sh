import { BlogPostNavigationButtonComponent } from "./component";
import {
  BlogPostNavigationButtonProps,
  BlogPostNavigationButtonPropsDefaults,
} from "./schema";

type BlogPostNavigationButtonServerWrapperProps = {
  props: BlogPostNavigationButtonProps["props"];
  style: BlogPostNavigationButtonProps["style"];
  blockBase?: { className?: string; id?: string };
  args?: {
    totalPosts?: number;
    page?: number;
    postsPerPage?: number;
    path?: string;
    searchParams?: Record<string, string | string[] | undefined>;
    params?: Record<string, string | string[] | undefined>;
  };
};

export const BlogPostNavigationButtonServerWrapper = async ({
  props,
  style,
  blockBase,
  args,
}: BlogPostNavigationButtonServerWrapperProps) => {
  const direction =
    props?.direction ?? BlogPostNavigationButtonPropsDefaults.props.direction;

  // Get pagination data from args
  const totalPosts = args?.totalPosts ?? 0;
  const page = args?.page ?? 1;
  const postsPerPage = args?.postsPerPage ?? 10;

  // Determine visibility
  let shouldShow = false;
  let targetPage = 1;

  if (direction === "next") {
    shouldShow = page > 1;
    targetPage = page - 1;
  } else {
    // prev
    const currentStart = page * postsPerPage;
    shouldShow = currentStart < totalPosts;
    targetPage = page + 1;
  }

  // Don't render if shouldn't show
  if (!shouldShow) {
    return null;
  }

  // Generate URL with updated page param
  const searchParams = args?.searchParams || {};
  const params = new URLSearchParams();

  // Copy existing search params
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, String(v)));
      } else {
        params.set(key, String(value));
      }
    }
  });

  // Update page param
  if (targetPage === 1) {
    params.delete("page");
  } else {
    params.set("page", targetPage.toString());
  }

  const queryString = params.toString();
  const path = args?.path || "";
  const href = `${path}?${queryString}`;

  return (
    <BlogPostNavigationButtonComponent
      direction={direction}
      href={href}
      style={style}
      blockBase={blockBase}
    />
  );
};

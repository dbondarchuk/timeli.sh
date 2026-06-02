import { BlogCommentNavigationButtonComponent } from "./component";
import {
  BlogCommentNavigationButtonPropsDefaults,
  BlogCommentNavigationButtonReaderProps,
} from "./schema";

export const BlogCommentNavigationButtonReader = ({
  props,
  style,
  block,
  args,
}: BlogCommentNavigationButtonReaderProps & { isEditor?: boolean }) => {
  const direction =
    props?.direction ??
    BlogCommentNavigationButtonPropsDefaults.props.direction;

  const totalComments = args?.totalComments ?? 0;
  const page = args?.page ?? 1;
  const commentsPerPage = args?.commentsPerPage ?? 10;

  let shouldShow = false;
  let targetPage = 1;

  if (direction === "next") {
    shouldShow = page > 1;
    targetPage = page - 1;
  } else {
    shouldShow = page * commentsPerPage < totalComments;
    targetPage = page + 1;
  }

  if (!shouldShow) {
    return null;
  }

  const searchParams = args?.searchParams || {};
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, String(v)));
      } else {
        params.set(key, String(value));
      }
    }
  });

  if (targetPage === 1) {
    params.delete("commentsPage");
  } else {
    params.set("commentsPage", targetPage.toString());
  }

  const queryString = params.toString();
  const path = `/${args?.path || ""}`;
  const href = `${queryString ? `${path}?${queryString}` : path}#comments`;

  return (
    <BlogCommentNavigationButtonComponent
      direction={direction}
      href={href}
      style={style}
      blockBase={block.base}
    />
  );
};

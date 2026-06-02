export const BLOG_COMMENTS_REFETCH_EVENT = "blog-comments-refetch";

/** Notifies all comment list shells on the page to reset to page 1 and reload. */
export const requestBlogCommentsRefetch = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(BLOG_COMMENTS_REFETCH_EVENT));
  }
};

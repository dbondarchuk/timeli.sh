import { BlogPost, BlogPostAuthor } from "../../models/blog-post";
import { getBlogAuthorUserName } from "./get-blog-author-user-name";

export const resolveAuthorName = (
  author: BlogPostAuthor | undefined,
  usersById?: ReadonlyMap<string, string>,
): string | null => {
  if (!author) {
    return null;
  }

  if (author.type === "user") {
    return usersById?.get(author.id) ?? null;
  }

  return author.name.trim() || null;
};

export const resolveAuthorNameFromPost = (
  post: Pick<BlogPost, "author"> | null | undefined,
  usersById?: ReadonlyMap<string, string>,
): string | null => {
  return resolveAuthorName(post?.author, usersById);
};

export const resolveAuthorNameFromPostAsync = async (
  post: Pick<BlogPost, "author"> | null | undefined,
  organizationId: string,
): Promise<string | null> => {
  const author = post?.author;
  if (!author) {
    return null;
  }

  if (author.type === "user") {
    return getBlogAuthorUserName(organizationId, author.id);
  }

  return author.name.trim() || null;
};

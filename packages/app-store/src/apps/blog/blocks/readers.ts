import { ReaderDocumentBlocksDictionary } from "@timelish/builder";
import { BlogPostContainerReader } from "./post-container/reader";
import { BlogPostContentReader } from "./post-content/reader";
import { BlogPostNavigationButtonReader } from "./post-navigation-button/reader";
import { BlogPostPublishDateReader } from "./post-publish-date/reader";
import { BlogPostTagReader } from "./post-tag/reader";
import { BlogPostTitleReader } from "./post-title/reader";
import { BlogPostsContainerReader } from "./posts-container/reader";
import type { BlogBlocksSchema } from "./schema";

export const BlogReaders: ReaderDocumentBlocksDictionary<
  typeof BlogBlocksSchema
> = {
  BlogPostContainer: {
    Reader: BlogPostContainerReader,
  },
  BlogPostTitle: {
    Reader: BlogPostTitleReader,
  },
  BlogPostContent: {
    Reader: BlogPostContentReader,
  },
  BlogPostTag: {
    Reader: BlogPostTagReader,
  },
  BlogPostPublishDate: {
    Reader: BlogPostPublishDateReader,
  },
  BlogPostsContainer: {
    Reader: BlogPostsContainerReader,
  },
  BlogPostNavigationButton: {
    Reader: BlogPostNavigationButtonReader,
  },
};

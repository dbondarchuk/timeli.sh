import { ReaderDocumentBlocksDictionary } from "@timelish/builder";
import { BlogPostsListReader } from "./posts-list/reader";
import { BlogBlocksSchema } from "./schema";
import { BlogPostContentReader } from "./post-content/reader";
import { BlogTagListReader } from "./tag-list/reader";

export const BlogReaders: ReaderDocumentBlocksDictionary<
  typeof BlogBlocksSchema
> = {
  BlogPostsList: {
    Reader: BlogPostsListReader,
  },
  BlogPostContent: {
    Reader: BlogPostContentReader,
  },
  BlogTagList: {
    Reader: BlogTagListReader,
  },
};


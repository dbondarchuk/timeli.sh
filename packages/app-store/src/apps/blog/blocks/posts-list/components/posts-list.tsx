import { PlateStaticEditor } from "@timelish/rte";
import { Link } from "@timelish/ui";
import { DateTime } from "luxon";
import { BlogPost } from "../../../models";

export const BlogPostsList: React.FC<
  {
    appId: string;
    posts: BlogPost[];
    page: number;
    tag: string;
    hasPrevious: boolean;
    hasNext: boolean;
    previousText: string;
    nextText: string;
    isEditor?: boolean;
  } & React.HTMLAttributes<HTMLDivElement>
> = ({
  appId,
  page,
  tag,
  posts,
  hasPrevious,
  hasNext,
  previousText,
  nextText,
  isEditor,
  ...props
}) => {
  return (
    <div {...props}>
      <div className="grid gap-4 post-list">
        {posts.map((post) => (
          <article key={post._id} className="border rounded p-4 post-item">
            <h2 className="text-xl font-semibold mb-2 post-item-title">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <div className="text-sm text-muted-foreground mb-2 post-item-date">
              {DateTime.fromJSDate(post.publicationDate).toLocaleString(
                DateTime.DATE_MED,
              )}
            </div>
            {post.content && (
              <div className="prose max-w-none post-item-content">
                <PlateStaticEditor value={post.content} />
              </div>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 post-item-tags">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-secondary rounded-md post-item-tag"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
      <div className="flex justify-between items-center mt-8">
        {hasPrevious && (
          <Link
            href={`?page=${page - 1}${tag ? `&tag=${tag}` : ""}`}
            button
            variant="outline"
            aria-disabled={isEditor}
          >
            {previousText}
          </Link>
        )}
        {hasNext && (
          <Link
            href={`?page=${page + 1}${tag ? `&tag=${tag}` : ""}`}
            button
            variant="outline"
            aria-disabled={isEditor}
          >
            {nextText}
          </Link>
        )}
      </div>
    </div>
  );
};

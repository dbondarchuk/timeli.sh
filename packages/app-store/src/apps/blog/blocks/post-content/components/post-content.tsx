import { PlateStaticEditor } from "@timelish/rte";
import { cn } from "@timelish/ui";
import { DateTime } from "luxon";
import { BlogPost } from "../../../models";

export const BlogPostContent: React.FC<
  {
    appId?: string;
    post: BlogPost;
    publishedOnText: string;
  } & React.HTMLAttributes<HTMLDivElement>
> = ({ appId, post, className, id, publishedOnText, ...rest }) => {
  return (
    <article className={cn("prose blog-post", className)} id={id} {...rest}>
      <h2 className="blog-post-title">{post.title}</h2>
      <p className="text-muted-foreground blog-post-date">
        {publishedOnText}{" "}
        {DateTime.fromJSDate(post.publicationDate).toLocaleString(
          DateTime.DATE_MED,
        )}
      </p>
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 my-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-secondary rounded-md blog-post-tag"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {post.content && (
        <div className="mt-4 blog-post-content">
          <PlateStaticEditor value={post.content} />
        </div>
      )}
    </article>
  );
};

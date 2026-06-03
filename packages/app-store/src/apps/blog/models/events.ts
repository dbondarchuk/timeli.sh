/** Blog app domain events (emitted from app-store). */

export const BLOG_POST_CREATED_EVENT_TYPE = "blog.post.created" as const;
export const BLOG_POST_UPDATED_EVENT_TYPE = "blog.post.updated" as const;
export const BLOG_POST_DELETED_EVENT_TYPE = "blog.post.deleted" as const;
export const BLOG_COMMENT_CREATED_EVENT_TYPE = "blog.comment.created" as const;
export const BLOG_COMMENT_DELETED_EVENT_TYPE = "blog.comment.deleted" as const;
export const BLOG_COMMENT_STATUS_CHANGED_EVENT_TYPE =
  "blog.comment.statusChanged" as const;

export type BlogPostCreatedPayload = {
  post: { _id: string; title: string; slug: string };
};

export type BlogPostUpdatedPayload = {
  post: { _id: string; title: string; slug: string };
};

export type BlogPostDeletedPayload = { postId: string };

export type BlogCommentCreatedPayload = {
  appId: string;
  status: "pending" | "approved";
  comment: {
    _id: string;
    postId: string;
    authorName: string;
    authorEmail: string;
    body: string;
  };
  post: { _id: string; title: string; slug: string };
};

export type BlogCommentDeletedPayload = {
  commentId: string;
  postId: string;
};

export type BlogCommentStatusChangedPayload = {
  comment: { _id: string; postId: string; authorName: string };
  status: "approved" | "rejected";
};

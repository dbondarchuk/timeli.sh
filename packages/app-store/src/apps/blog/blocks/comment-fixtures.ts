import { BlogCommentPublic } from "../models";

export const blogCommentFixtures: BlogCommentPublic[] = [
  {
    _id: "fixture-comment-1",
    postId: "1",
    authorName: "Alex Reader",
    body: "Great article, thanks for sharing!",
    createdAt: new Date("2025-01-12T14:30:00"),
  },
  {
    _id: "fixture-comment-2",
    postId: "1",
    authorName: "Sam Taylor",
    body: "This helped me organize my week.",
    createdAt: new Date("2025-01-11T09:15:00"),
  },
];

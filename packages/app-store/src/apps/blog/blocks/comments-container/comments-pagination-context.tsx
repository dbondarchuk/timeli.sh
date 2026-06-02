"use client";

import { createContext, useContext } from "react";
import { BlogCommentPublic } from "../../models";

export type CommentsPaginationContextValue = {
  page: number;
  setPage: (page: number) => void;
  totalComments: number;
  commentsPerPage: number;
  comments: BlogCommentPublic[];
  isLoading: boolean;
  refetch: () => void;
};

export const CommentsPaginationContext =
  createContext<CommentsPaginationContextValue | null>(null);

export const useCommentsPagination = () => {
  const ctx = useContext(CommentsPaginationContext);
  return ctx;
};

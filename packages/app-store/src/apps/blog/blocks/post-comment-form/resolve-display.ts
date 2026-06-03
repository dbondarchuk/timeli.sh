import { BlogConfiguration } from "../../models";
import { BlogPublicKeys } from "../../translations/types";
import {
  BlogPostCommentFormDisplayConfig,
  BlogPostCommentFormProps,
  BlogPostCommentFormPropsDefaults,
} from "./schema";

type TranslateFn = (
  key: BlogPublicKeys,
  values?: Record<string, string | number>,
) => string;

export const resolveCommentFormDisplay = (
  props: BlogPostCommentFormProps["props"],
  config: Pick<BlogConfiguration, "commentsEnabled" | "commentsPremoderation">,
  t: TranslateFn,
): BlogPostCommentFormDisplayConfig => {
  const merged = { ...BlogPostCommentFormPropsDefaults.props, ...props };

  return {
    commentsEnabled: config.commentsEnabled,
    commentsPremoderation: config.commentsPremoderation,
    nameLabel:
      merged.nameLabel?.trim() ||
      t("block.postCommentForm.nameLabel" satisfies BlogPublicKeys),
    namePlaceholder:
      merged.namePlaceholder?.trim() ||
      t("block.postCommentForm.namePlaceholder" satisfies BlogPublicKeys),
    emailLabel:
      merged.emailLabel?.trim() ||
      t("block.postCommentForm.emailLabel" satisfies BlogPublicKeys),
    emailPlaceholder:
      merged.emailPlaceholder?.trim() ||
      t("block.postCommentForm.emailPlaceholder" satisfies BlogPublicKeys),
    bodyLabel:
      merged.bodyLabel?.trim() ||
      t("block.postCommentForm.bodyLabel" satisfies BlogPublicKeys),
    bodyPlaceholder:
      merged.bodyPlaceholder?.trim() ||
      t("block.postCommentForm.bodyPlaceholder" satisfies BlogPublicKeys),
    submitLabel:
      merged.submitLabel?.trim() ||
      t("block.postCommentForm.submitLabel" satisfies BlogPublicKeys),
    successMessage:
      merged.successMessage?.trim() ||
      (config.commentsPremoderation
        ? t("block.postCommentForm.successPending" satisfies BlogPublicKeys)
        : t("block.postCommentForm.success" satisfies BlogPublicKeys)),
  };
};

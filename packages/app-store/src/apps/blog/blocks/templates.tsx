import {
  generateId as generateBlockId,
  generateId,
  generateId as generateLinkId,
  TEditorBlock,
  TemplatesConfiguration,
} from "@timelish/builder";
import { AllKeys } from "@timelish/i18n";
import { COLORS } from "@timelish/page-builder-base/style";
import {
  ArrowLeftRight,
  FileText,
  Heading,
  ListOrdered,
  Tag,
} from "lucide-react";
import { BlogAdminKeys, BlogAdminNamespace } from "../translations/types";
import { BlogPostContainerPropsDefaults } from "./post-container/schema";
import { BlogPostContentPropsDefaults } from "./post-content/schema";
import { BlogPostNavigationButtonPropsDefaults } from "./post-navigation-button/schema";
import { BlogPostPublishDatePropsDefaults } from "./post-publish-date/schema";
import { BlogPostTagPropsDefaults } from "./post-tag/schema";
import { BlogPostTitlePropsDefaults } from "./post-title/schema";
import { BlogPostsContainerPropsDefaults } from "./posts-container/schema";

// Define InlineContainerPropsDefaults inline to avoid import issues
const InlineContainerPropsDefaults = {
  style: {
    padding: [
      {
        value: {
          top: { value: 0, unit: "rem" },
          bottom: { value: 0, unit: "rem" },
          left: { value: 0, unit: "rem" },
          right: { value: 0, unit: "rem" },
        },
      },
    ],
    display: [
      {
        value: "inline-flex",
      },
    ],
    flexDirection: [
      {
        value: "row",
      },
    ],
    alignItems: [
      {
        value: "center",
      },
    ],
    justifyContent: [
      {
        value: "center",
      },
    ],
    gap: [
      {
        value: {
          value: 0.5,
          unit: "rem",
        },
      },
    ],
  },
  props: {
    children: [],
  },
};

const getLinkPropsDefaults = () => ({
  props: {
    url: "/",
    target: "_self",
    children: [
      {
        type: "InlineContainer",
        id: generateLinkId(),
        data: {
          style: {
            ...InlineContainerPropsDefaults.style,
            textDecoration: [
              {
                value: "underline",
              },
            ],
          },
          props: {
            children: [
              {
                type: "InlineText",
                id: generateLinkId(),
                data: {
                  props: {
                    text: "Link",
                  },
                },
              },
            ],
          },
        },
      },
    ],
  },
  style: {
    color: [
      {
        value: COLORS["primary"].value,
      },
    ],
    fontSize: [
      {
        value: {
          value: 1,
          unit: "rem",
        },
      },
    ],
    fontWeight: [
      {
        value: "normal",
      },
    ],
    textAlign: [
      {
        value: "left",
      },
    ],
    width: [
      {
        value: "max-content",
      },
    ],
    display: [
      {
        value: "inline",
      },
    ],
    transition: [
      {
        value: "color 0.2s ease",
      },
    ],
  },
});

// Defaults for ForeachContainer
const ForeachContainerPropsDefaults = {
  props: {
    value: "",
    children: [],
  },
  style: {
    display: [
      {
        value: "flex",
      },
    ],
    flexDirection: [
      {
        value: "column",
      },
    ],
    width: [
      {
        value: { value: 100, unit: "%" },
      },
    ],
    gap: [
      {
        value: {
          value: 0.5,
          unit: "rem",
        },
      },
    ],
  },
};

// Defaults for InlineContainer style
const inlineContainerStyle = {
  padding: [
    {
      value: {
        top: { value: 0, unit: "rem" },
        bottom: { value: 0, unit: "rem" },
        left: { value: 0, unit: "rem" },
        right: { value: 0, unit: "rem" },
      },
    },
  ],
  display: [
    {
      value: "inline-flex",
    },
  ],
  flexDirection: [
    {
      value: "row",
    },
  ],
  alignItems: [
    {
      value: "center",
    },
  ],
  justifyContent: [
    {
      value: "center",
    },
  ],
  gap: [
    {
      value: {
        value: 0.5,
        unit: "rem",
      },
    },
  ],
};

// Defaults for Heading
const getHeadingPropsDefaults = (isPostPage?: boolean) => ({
  props: {
    level: isPostPage ? "h1" : ("h2" as const),
    children: [
      {
        type: "InlineContainer",
        id: generateBlockId(),
        data: {
          style: inlineContainerStyle,
          props: {
            children: [],
          },
        },
      },
    ],
  },
  style: {
    textAlign: [
      {
        value: !isPostPage ? "left" : "center",
      },
    ],
    fontWeight: [
      {
        value: "bold",
      },
    ],
    fontFamily: [
      {
        value: "SECONDARY",
      },
    ],
  },
});

export const BlogTemplates: (
  appName: string,
  appId: string,
) => TemplatesConfiguration = (appName: string, appId: string) => ({
  PostTitleHeader: {
    displayName:
      "app_blog_admin.block.templates.postTitleHeader.displayName" satisfies AllKeys<
        BlogAdminNamespace,
        BlogAdminKeys
      >,
    icon: <Heading />,
    category: "app_blog_admin.block.category.blog" satisfies AllKeys<
      BlogAdminNamespace,
      BlogAdminKeys
    >,
    getBlock: (): TEditorBlock => {
      const titleId = generateId();
      return {
        id: generateLinkId(),
        type: "Heading",
        data: {
          ...getHeadingPropsDefaults(),
          props: {
            ...getHeadingPropsDefaults().props,
            children: [
              {
                type: "BlogPostTitle",
                id: titleId,
                data: BlogPostTitlePropsDefaults,
              },
            ],
          },
        },
      };
    },
  },
  PostTags: {
    displayName:
      "app_blog_admin.block.templates.postTags.displayName" satisfies AllKeys<
        BlogAdminNamespace,
        BlogAdminKeys
      >,
    icon: <Tag />,
    category: "app_blog_admin.block.category.blog" satisfies AllKeys<
      BlogAdminNamespace,
      BlogAdminKeys
    >,
    getBlock: (): TEditorBlock => {
      const foreachId = generateId();
      const tagId = generateId();
      return {
        id: foreachId,
        type: "ForeachContainer",
        data: {
          ...ForeachContainerPropsDefaults,
          props: {
            value: "post.tags",
            itemName: "tag",
            children: [
              {
                type: "BlogPostTag",
                id: tagId,
                data: BlogPostTagPropsDefaults,
              },
            ],
          },
          style: {
            ...ForeachContainerPropsDefaults.style,
            flexDirection: [
              {
                value: "row",
              },
            ],
            flexWrap: [
              {
                value: "wrap",
              },
            ],
          },
        },
      };
    },
  },
  BlogPost: {
    displayName:
      "app_blog_admin.block.templates.post.displayName" satisfies AllKeys<
        BlogAdminNamespace,
        BlogAdminKeys
      >,
    icon: <FileText />,
    category: "app_blog_admin.block.category.blog" satisfies AllKeys<
      BlogAdminNamespace,
      BlogAdminKeys
    >,
    getBlock: (): TEditorBlock => {
      const containerId = generateId();
      const titleHeaderId = generateId();
      const titleId = generateId();
      const publishDateId = generateId();
      const contentId = generateId();
      const tagsId = generateId();
      const foreachId = generateId();
      const tagId = generateId();

      return {
        id: containerId,
        type: "BlogPostContainer",
        metadata: {
          blogAppName: appName,
          blogAppId: appId,
        },
        data: {
          ...BlogPostContainerPropsDefaults,
          props: {
            children: [
              {
                type: "Heading",
                id: generateLinkId(),
                data: {
                  ...getHeadingPropsDefaults(true),
                  props: {
                    ...getHeadingPropsDefaults(true).props,
                    children: [
                      {
                        type: "BlogPostTitle",
                        id: titleId,
                        data: BlogPostTitlePropsDefaults,
                      },
                    ],
                  },
                },
              },
              ,
              {
                type: "BlogPostPublishDate",
                id: publishDateId,
                data: BlogPostPublishDatePropsDefaults,
              },
              {
                type: "BlogPostContent",
                id: contentId,
                data: BlogPostContentPropsDefaults,
              },
              {
                id: foreachId,
                type: "ForeachContainer",
                data: {
                  ...ForeachContainerPropsDefaults,
                  props: {
                    value: "post.tags",
                    itemName: "tag",
                    children: [
                      {
                        type: "BlogPostTag",
                        id: tagId,
                        data: {
                          ...BlogPostTagPropsDefaults,
                          props: {
                            ...BlogPostTagPropsDefaults.props,
                            blogListUrl: "/blog",
                          },
                        },
                      },
                    ],
                  },
                  style: {
                    ...ForeachContainerPropsDefaults.style,
                    flexDirection: [
                      {
                        value: "row",
                      },
                    ],
                    flexWrap: [
                      {
                        value: "wrap",
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      };
    },
  },
  PostsListNavigation: {
    displayName:
      "app_blog_admin.block.templates.postsListNavigation.displayName" satisfies AllKeys<
        BlogAdminNamespace,
        BlogAdminKeys
      >,
    icon: <ArrowLeftRight />,
    category: "app_blog_admin.block.category.blog" satisfies AllKeys<
      BlogAdminNamespace,
      BlogAdminKeys
    >,
    getBlock: (): TEditorBlock => {
      const containerId = generateId();
      const prevButtonId = generateId();
      const nextButtonId = generateId();

      return {
        id: containerId,
        type: "Container",
        data: {
          style: {
            display: [
              {
                value: "flex",
              },
            ],
            flexDirection: [
              {
                value: "row",
              },
            ],
            justifyContent: [
              {
                value: "space-between",
              },
            ],
            width: [
              {
                value: { value: 100, unit: "%" },
              },
            ],
            padding: [
              {
                value: {
                  top: { value: 1, unit: "rem" },
                  bottom: { value: 1, unit: "rem" },
                  left: { value: 0, unit: "rem" },
                  right: { value: 0, unit: "rem" },
                },
              },
            ],
          },
          props: {
            children: [
              {
                type: "BlogPostNavigationButton",
                id: prevButtonId,
                data: {
                  ...BlogPostNavigationButtonPropsDefaults,
                  props: {
                    direction: "prev",
                  },
                },
              },
              {
                type: "BlogPostNavigationButton",
                id: nextButtonId,
                data: {
                  ...BlogPostNavigationButtonPropsDefaults,
                  props: {
                    direction: "next",
                  },
                },
              },
            ],
          },
        },
      };
    },
  },
  BlogPostsList: {
    displayName:
      "app_blog_admin.block.templates.postsList.displayName" satisfies AllKeys<
        BlogAdminNamespace,
        BlogAdminKeys
      >,
    icon: <ListOrdered />,
    category: "app_blog_admin.block.category.blog" satisfies AllKeys<
      BlogAdminNamespace,
      BlogAdminKeys
    >,
    getBlock: (): TEditorBlock => {
      const postsContainerId = generateId();
      const foreachId = generateId();
      const blogPostId = generateId();
      const blogPostContainerId = generateId();
      const titleHeaderId = generateId();
      const titleId = generateId();
      const publishDateId = generateId();
      const contentId = generateId();
      const tagsForeachId = generateId();
      const tagId = generateId();
      const navigationContainerId = generateId();
      const prevButtonId = generateId();
      const nextButtonId = generateId();

      return {
        id: postsContainerId,
        type: "BlogPostsContainer",
        metadata: {
          blogAppName: appName,
          blogAppId: appId,
        },
        data: {
          ...BlogPostsContainerPropsDefaults,
          props: {
            children: [
              {
                id: foreachId,
                type: "ForeachContainer",
                data: {
                  ...ForeachContainerPropsDefaults,
                  props: {
                    value: "posts",
                    itemName: "post",
                    children: [
                      {
                        id: blogPostId,
                        type: "BlogPostContainer",
                        data: {
                          ...BlogPostContainerPropsDefaults,
                          props: {
                            ...BlogPostContainerPropsDefaults.props,
                            children: [
                              {
                                id: titleHeaderId,
                                type: "Link",
                                data: {
                                  ...getLinkPropsDefaults(),
                                  props: {
                                    ...getLinkPropsDefaults().props,
                                    url: "{{postLink}}",
                                    children: [
                                      {
                                        type: "Heading",
                                        id: generateLinkId(),
                                        data: {
                                          ...getHeadingPropsDefaults(),
                                          props: {
                                            ...getHeadingPropsDefaults().props,
                                            children: [
                                              {
                                                type: "BlogPostTitle",
                                                id: titleId,
                                                data: BlogPostTitlePropsDefaults,
                                              },
                                            ],
                                          },
                                        },
                                      },
                                    ],
                                  },
                                },
                              },
                              {
                                type: "BlogPostPublishDate",
                                id: publishDateId,
                                data: BlogPostPublishDatePropsDefaults,
                              },
                              {
                                type: "BlogPostContent",
                                id: contentId,
                                data: {
                                  ...BlogPostContentPropsDefaults,
                                  props: {
                                    ...BlogPostContentPropsDefaults.props,
                                    showShort: true,
                                  },
                                },
                              },
                              {
                                id: tagsForeachId,
                                type: "ForeachContainer",
                                data: {
                                  ...ForeachContainerPropsDefaults,
                                  props: {
                                    value: "post.tags",
                                    itemName: "tag",
                                    children: [
                                      {
                                        type: "BlogPostTag",
                                        id: tagId,
                                        data: BlogPostTagPropsDefaults,
                                      },
                                    ],
                                  },
                                  style: {
                                    ...ForeachContainerPropsDefaults.style,
                                    flexDirection: [
                                      {
                                        value: "row",
                                      },
                                    ],
                                    flexWrap: [
                                      {
                                        value: "wrap",
                                      },
                                    ],
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
              {
                id: navigationContainerId,
                type: "Container",
                data: {
                  style: {
                    display: [
                      {
                        value: "flex",
                      },
                    ],
                    flexDirection: [
                      {
                        value: "row",
                      },
                    ],
                    justifyContent: [
                      {
                        value: "space-between",
                      },
                    ],
                    width: [
                      {
                        value: { value: 100, unit: "%" },
                      },
                    ],
                    padding: [
                      {
                        value: {
                          top: { value: 1, unit: "rem" },
                          bottom: { value: 1, unit: "rem" },
                          left: { value: 0, unit: "rem" },
                          right: { value: 0, unit: "rem" },
                        },
                      },
                    ],
                  },
                  props: {
                    children: [
                      {
                        type: "BlogPostNavigationButton",
                        id: prevButtonId,
                        data: {
                          ...BlogPostNavigationButtonPropsDefaults,
                          props: {
                            direction: "prev",
                          },
                        },
                      },
                      {
                        type: "BlogPostNavigationButton",
                        id: nextButtonId,
                        data: {
                          ...BlogPostNavigationButtonPropsDefaults,
                          props: {
                            direction: "next",
                          },
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      };
    },
  },
});

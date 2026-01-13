import { PageUpdateModel } from "@timelish/types";

export const BLOG_PAGES: (
  appId: string,
  headerId?: string,
  footerId?: string,
) => PageUpdateModel[] = (appId, headerId, footerId) => [
  {
    title: "Blog",
    content: {
      data: {
        fontFamily: "PRIMARY",
        fullWidth: true,
        children: [
          {
            id: "block-75029ea8-8eed-4320-ad40-61dbb298de84",
            type: "Container",
            data: {
              style: {
                padding: [
                  {
                    value: {
                      top: {
                        value: 1,
                        unit: "rem",
                      },
                      bottom: {
                        value: 1,
                        unit: "rem",
                      },
                      left: {
                        value: 1.5,
                        unit: "rem",
                      },
                      right: {
                        value: 1.5,
                        unit: "rem",
                      },
                    },
                  },
                ],
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
                    value: {
                      value: 100,
                      unit: "%",
                    },
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
                maxWidth: [
                  {
                    breakpoint: [],
                    state: [],
                    value: {
                      value: 100,
                      unit: "%",
                    },
                  },
                  {
                    breakpoint: ["sm"],
                    state: [],
                    value: {
                      value: 640,
                      unit: "px",
                    },
                  },
                  {
                    breakpoint: ["md"],
                    state: [],
                    value: {
                      value: 768,
                      unit: "px",
                    },
                  },
                  {
                    breakpoint: ["lg"],
                    state: [],
                    value: {
                      value: 1024,
                      unit: "px",
                    },
                  },
                  {
                    breakpoint: ["xl"],
                    state: [],
                    value: {
                      value: 1280,
                      unit: "px",
                    },
                  },
                  {
                    breakpoint: ["2xl"],
                    state: [],
                    value: {
                      value: 1536,
                      unit: "px",
                    },
                  },
                ],
                margin: [
                  {
                    breakpoint: [],
                    state: [],
                    value: {
                      top: "auto",
                      right: "auto",
                      bottom: "auto",
                      left: "auto",
                    },
                  },
                ],
              },
              props: {
                children: [
                  {
                    id: "block-92109995-f9b5-4c67-88c0-05ead90f719b",
                    type: "Heading",
                    data: {
                      props: {
                        level: "h1",
                        children: [
                          {
                            type: "InlineContainer",
                            id: "block-980bbc9c-bcd7-4572-a827-d474f9bb72ca",
                            data: {
                              style: {
                                padding: [
                                  {
                                    value: {
                                      top: {
                                        value: 0,
                                        unit: "rem",
                                      },
                                      bottom: {
                                        value: 0,
                                        unit: "rem",
                                      },
                                      left: {
                                        value: 0,
                                        unit: "rem",
                                      },
                                      right: {
                                        value: 0,
                                        unit: "rem",
                                      },
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
                                children: [
                                  {
                                    type: "InlineText",
                                    id: "block-eab58ae4-24e0-489f-b39f-537792b48108",
                                    data: {
                                      props: {
                                        text: "Blog",
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
                        padding: [
                          {
                            value: {
                              top: {
                                value: 2,
                                unit: "rem",
                              },
                              bottom: {
                                value: 2,
                                unit: "rem",
                              },
                              left: {
                                value: 1.5,
                                unit: "rem",
                              },
                              right: {
                                value: 1.5,
                                unit: "rem",
                              },
                            },
                          },
                        ],
                        textAlign: [
                          {
                            value: "center",
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
                        fontSize: [
                          {
                            breakpoint: [],
                            state: [],
                            value: {
                              value: 3,
                              unit: "rem",
                            },
                          },
                        ],
                        margin: [
                          {
                            breakpoint: [],
                            state: [],
                            value: {
                              top: "auto",
                              bottom: {
                                value: 1.5,
                                unit: "rem",
                              },
                              left: "auto",
                              right: "auto",
                            },
                          },
                        ],
                      },
                    },
                  },
                  {
                    id: "block-f14a2caf-27c0-4a72-b9d5-d98859f636e0",
                    type: "BlogPostsContainer",
                    metadata: {
                      blogAppName: "blog",
                      blogAppId: appId,
                    },
                    data: {
                      style: {
                        padding: [
                          {
                            value: {
                              top: {
                                value: 1,
                                unit: "rem",
                              },
                              bottom: {
                                value: 1,
                                unit: "rem",
                              },
                              left: {
                                value: 1.5,
                                unit: "rem",
                              },
                              right: {
                                value: 1.5,
                                unit: "rem",
                              },
                            },
                          },
                        ],
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
                            value: {
                              value: 100,
                              unit: "%",
                            },
                          },
                        ],
                        gap: [
                          {
                            value: {
                              value: 1,
                              unit: "rem",
                            },
                          },
                        ],
                      },
                      props: {
                        children: [
                          {
                            id: "block-f20edeb0-e150-4c7d-8e0b-1557ff761259",
                            type: "ForeachContainer",
                            data: {
                              props: {
                                value: "posts",
                                itemName: "post",
                                children: [
                                  {
                                    id: "block-c97b7e42-53f7-406b-94b6-bae3fd6c5a95",
                                    type: "BlogPostContainer",
                                    data: {
                                      style: {
                                        padding: [
                                          {
                                            value: {
                                              top: {
                                                value: 1,
                                                unit: "rem",
                                              },
                                              bottom: {
                                                value: 1,
                                                unit: "rem",
                                              },
                                              left: {
                                                value: 1.5,
                                                unit: "rem",
                                              },
                                              right: {
                                                value: 1.5,
                                                unit: "rem",
                                              },
                                            },
                                          },
                                        ],
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
                                            value: {
                                              value: 100,
                                              unit: "%",
                                            },
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
                                        children: [
                                          {
                                            id: "block-e28e8c1d-aa15-46a2-a89a-0b187596b8ee",
                                            type: "Link",
                                            data: {
                                              props: {
                                                url: "{{postLink}}",
                                                target: "_self",
                                                children: [
                                                  {
                                                    type: "Heading",
                                                    id: "block-a4952e0a-b61a-479a-a6ce-6cfab13555d7",
                                                    data: {
                                                      props: {
                                                        level: "h2",
                                                        children: [
                                                          {
                                                            type: "BlogPostTitle",
                                                            id: "block-f4fe4493-132b-4a7e-bfd2-abc41e8d8870",
                                                            data: {
                                                              props: {},
                                                              style: {
                                                                fontSize: [
                                                                  {
                                                                    value: {
                                                                      value: 2,
                                                                      unit: "rem",
                                                                    },
                                                                  },
                                                                ],
                                                                fontWeight: [
                                                                  {
                                                                    value:
                                                                      "bold",
                                                                  },
                                                                ],
                                                              },
                                                            },
                                                          },
                                                        ],
                                                      },
                                                      style: {
                                                        textAlign: [
                                                          {
                                                            value: "left",
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
                                                    },
                                                  },
                                                ],
                                              },
                                              style: {
                                                color: [
                                                  {
                                                    value:
                                                      "var(--value-primary-color)",
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
                                            },
                                          },
                                          {
                                            type: "BlogPostPublishDate",
                                            id: "block-d7605b29-b7d3-4f2f-a20e-021e26276c0b",
                                            data: {
                                              props: {
                                                format: "MMMM d, yyyy",
                                              },
                                              style: {
                                                fontSize: [
                                                  {
                                                    value: {
                                                      value: 0.875,
                                                      unit: "rem",
                                                    },
                                                  },
                                                ],
                                              },
                                            },
                                          },
                                          {
                                            type: "BlogPostContent",
                                            id: "block-653b3d0a-e7c2-47c5-b873-75a66feaa937",
                                            data: {
                                              props: {
                                                showShort: true,
                                              },
                                              style: {},
                                            },
                                          },
                                          {
                                            id: "block-24e9e3f2-70e9-45ed-8025-955881ad4df7",
                                            type: "ForeachContainer",
                                            data: {
                                              props: {
                                                value: "post.tags",
                                                itemName: "tag",
                                                children: [
                                                  {
                                                    type: "BlogPostTag",
                                                    id: "block-524438cd-9b79-470b-bb2b-2f6d7a384475",
                                                    data: {
                                                      props: {},
                                                      style: {
                                                        padding: [
                                                          {
                                                            value: {
                                                              top: {
                                                                value: 0.5,
                                                                unit: "rem",
                                                              },
                                                              bottom: {
                                                                value: 0.5,
                                                                unit: "rem",
                                                              },
                                                              left: {
                                                                value: 1,
                                                                unit: "rem",
                                                              },
                                                              right: {
                                                                value: 1,
                                                                unit: "rem",
                                                              },
                                                            },
                                                          },
                                                        ],
                                                        borderRadius: [
                                                          {
                                                            value: {
                                                              value: 0.5,
                                                              unit: "rem",
                                                            },
                                                          },
                                                        ],
                                                        backgroundColor: [
                                                          {
                                                            value:
                                                              "var(--value-secondary-color)",
                                                          },
                                                        ],
                                                        color: [
                                                          {
                                                            value:
                                                              "var(--value-secondary-foreground-color)",
                                                          },
                                                        ],
                                                        fontSize: [
                                                          {
                                                            value: {
                                                              value: 0.875,
                                                              unit: "rem",
                                                            },
                                                          },
                                                        ],
                                                        fontWeight: [
                                                          {
                                                            value: "500",
                                                          },
                                                        ],
                                                        display: [
                                                          {
                                                            value:
                                                              "inline-block",
                                                          },
                                                        ],
                                                        width: [
                                                          {
                                                            value:
                                                              "fit-content",
                                                          },
                                                        ],
                                                        textAlign: [
                                                          {
                                                            value: "center",
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  },
                                                ],
                                              },
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
                                                width: [
                                                  {
                                                    value: {
                                                      value: 100,
                                                      unit: "%",
                                                    },
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
                                                flexWrap: [
                                                  {
                                                    value: "wrap",
                                                  },
                                                ],
                                              },
                                            },
                                          },
                                        ],
                                        postUrl: "/blog/[slug]",
                                      },
                                    },
                                  },
                                ],
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
                                    value: {
                                      value: 100,
                                      unit: "%",
                                    },
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
                            },
                          },
                          {
                            id: "block-a79f52cb-031b-4f91-975a-a88a3e808b7e",
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
                                    value: {
                                      value: 100,
                                      unit: "%",
                                    },
                                  },
                                ],
                                padding: [
                                  {
                                    value: {
                                      top: {
                                        value: 1,
                                        unit: "rem",
                                      },
                                      bottom: {
                                        value: 1,
                                        unit: "rem",
                                      },
                                      left: {
                                        value: 0,
                                        unit: "rem",
                                      },
                                      right: {
                                        value: 0,
                                        unit: "rem",
                                      },
                                    },
                                  },
                                ],
                              },
                              props: {
                                children: [
                                  {
                                    type: "BlogPostNavigationButton",
                                    id: "block-d1300f34-5426-4b62-aba7-2ef043d7524a",
                                    data: {
                                      props: {
                                        direction: "prev",
                                      },
                                      style: {
                                        color: [
                                          {
                                            value:
                                              "var(--value-primary-foreground-color)",
                                          },
                                        ],
                                        padding: [
                                          {
                                            value: {
                                              top: {
                                                value: 0.75,
                                                unit: "rem",
                                              },
                                              right: {
                                                value: 1.5,
                                                unit: "rem",
                                              },
                                              bottom: {
                                                value: 0.75,
                                                unit: "rem",
                                              },
                                              left: {
                                                value: 1.5,
                                                unit: "rem",
                                              },
                                            },
                                          },
                                        ],
                                        backgroundColor: [
                                          {
                                            value: "var(--value-primary-color)",
                                          },
                                        ],
                                        filter: [
                                          {
                                            value: "brightness(1.1)",
                                            state: [
                                              {
                                                state: "hover",
                                                target: {
                                                  type: "self",
                                                },
                                              },
                                              {
                                                state: "focus",
                                                target: {
                                                  type: "self",
                                                },
                                              },
                                              {
                                                state: "active",
                                                target: {
                                                  type: "self",
                                                },
                                              },
                                            ],
                                          },
                                        ],
                                        transition: [
                                          {
                                            value: "all 0.3s ease",
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
                                            value: "center",
                                          },
                                        ],
                                        width: [
                                          {
                                            value: "max-content",
                                          },
                                        ],
                                        display: [
                                          {
                                            value: "inline-flex",
                                          },
                                        ],
                                      },
                                    },
                                  },
                                  {
                                    type: "BlogPostNavigationButton",
                                    id: "block-a2437949-7a03-4ca8-be6b-d3ec91db7344",
                                    data: {
                                      props: {
                                        direction: "next",
                                      },
                                      style: {
                                        color: [
                                          {
                                            value:
                                              "var(--value-primary-foreground-color)",
                                          },
                                        ],
                                        padding: [
                                          {
                                            value: {
                                              top: {
                                                value: 0.75,
                                                unit: "rem",
                                              },
                                              right: {
                                                value: 1.5,
                                                unit: "rem",
                                              },
                                              bottom: {
                                                value: 0.75,
                                                unit: "rem",
                                              },
                                              left: {
                                                value: 1.5,
                                                unit: "rem",
                                              },
                                            },
                                          },
                                        ],
                                        backgroundColor: [
                                          {
                                            value: "var(--value-primary-color)",
                                          },
                                        ],
                                        filter: [
                                          {
                                            value: "brightness(1.1)",
                                            state: [
                                              {
                                                state: "hover",
                                                target: {
                                                  type: "self",
                                                },
                                              },
                                              {
                                                state: "focus",
                                                target: {
                                                  type: "self",
                                                },
                                              },
                                              {
                                                state: "active",
                                                target: {
                                                  type: "self",
                                                },
                                              },
                                            ],
                                          },
                                        ],
                                        transition: [
                                          {
                                            value: "all 0.3s ease",
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
                                            value: "center",
                                          },
                                        ],
                                        width: [
                                          {
                                            value: "max-content",
                                          },
                                        ],
                                        display: [
                                          {
                                            value: "inline-flex",
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
                        postsPerPage: 10,
                      },
                    },
                  },
                  {
                    id: "block-0b81076c-4fd9-4070-b2fa-0c2e09e4fab6",
                    type: "BlogPostsContainer-69404142f235c72ca0ce3598",
                    data: {
                      style: {
                        padding: [
                          {
                            value: {
                              top: {
                                value: 1,
                                unit: "rem",
                              },
                              bottom: {
                                value: 1,
                                unit: "rem",
                              },
                              left: {
                                value: 1.5,
                                unit: "rem",
                              },
                              right: {
                                value: 1.5,
                                unit: "rem",
                              },
                            },
                          },
                        ],
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
                            value: {
                              value: 100,
                              unit: "%",
                            },
                          },
                        ],
                        gap: [
                          {
                            value: {
                              value: 1,
                              unit: "rem",
                            },
                          },
                        ],
                      },
                      props: {
                        children: [
                          {
                            id: "block-bc528375-97ec-4b98-8980-a95774dac4ec",
                            type: "ForeachContainer",
                            data: {
                              props: {
                                value: "posts",
                                itemName: "post",
                                children: [
                                  {
                                    id: "block-ab94fb30-3914-41ba-85b5-d3b253711ec9",
                                    type: "BlogPostContainer-69404142f235c72ca0ce3598",
                                    data: {
                                      style: {
                                        padding: [
                                          {
                                            value: {
                                              top: {
                                                value: 1,
                                                unit: "rem",
                                              },
                                              bottom: {
                                                value: 1,
                                                unit: "rem",
                                              },
                                              left: {
                                                value: 1.5,
                                                unit: "rem",
                                              },
                                              right: {
                                                value: 1.5,
                                                unit: "rem",
                                              },
                                            },
                                          },
                                        ],
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
                                            value: {
                                              value: 100,
                                              unit: "%",
                                            },
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
                                        children: [
                                          {
                                            id: "block-0fa61364-6f6a-4979-9e17-17a3ddbee041",
                                            type: "Link",
                                            data: {
                                              props: {
                                                url: "{{postLink}}",
                                                target: "_self",
                                                children: [
                                                  {
                                                    type: "Heading",
                                                    id: "block-048a5972-a1f9-4719-ab99-32f4a59a855b",
                                                    data: {
                                                      props: {
                                                        level: "h2",
                                                        children: [
                                                          {
                                                            type: "BlogPostTitle-69404142f235c72ca0ce3598",
                                                            id: "block-8a2d4d8b-512a-4a78-959e-d6f046cc5139",
                                                            data: {
                                                              props: {},
                                                              style: {
                                                                fontSize: [
                                                                  {
                                                                    value: {
                                                                      value: 2,
                                                                      unit: "rem",
                                                                    },
                                                                  },
                                                                ],
                                                                fontWeight: [
                                                                  {
                                                                    value:
                                                                      "bold",
                                                                  },
                                                                ],
                                                              },
                                                            },
                                                          },
                                                        ],
                                                      },
                                                      style: {
                                                        textAlign: [
                                                          {
                                                            value: "left",
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
                                                    },
                                                  },
                                                ],
                                              },
                                              style: {
                                                color: [
                                                  {
                                                    value:
                                                      "var(--value-primary-color)",
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
                                            },
                                          },
                                          {
                                            type: "BlogPostPublishDate-69404142f235c72ca0ce3598",
                                            id: "block-a0d789e6-a085-497d-ae4b-1c7a295d8fdd",
                                            data: {
                                              props: {
                                                format: "MMMM d, yyyy",
                                              },
                                              style: {
                                                fontSize: [
                                                  {
                                                    value: {
                                                      value: 0.875,
                                                      unit: "rem",
                                                    },
                                                  },
                                                ],
                                              },
                                            },
                                          },
                                          {
                                            type: "BlogPostContent-69404142f235c72ca0ce3598",
                                            id: "block-7f78bb76-f38c-4405-82c6-614608f5fa19",
                                            data: {
                                              props: {
                                                showShort: true,
                                              },
                                              style: {},
                                            },
                                          },
                                          {
                                            id: "block-fac9cad0-6ad4-4589-bad2-fabdcdab0d65",
                                            type: "ForeachContainer",
                                            data: {
                                              props: {
                                                value: "post.tags",
                                                itemName: "tag",
                                                children: [
                                                  {
                                                    type: "BlogPostTag-69404142f235c72ca0ce3598",
                                                    id: "block-4586216c-4dfe-4bbd-a8f9-dd547e84284b",
                                                    data: {
                                                      props: {},
                                                      style: {
                                                        padding: [
                                                          {
                                                            value: {
                                                              top: {
                                                                value: 0.5,
                                                                unit: "rem",
                                                              },
                                                              bottom: {
                                                                value: 0.5,
                                                                unit: "rem",
                                                              },
                                                              left: {
                                                                value: 1,
                                                                unit: "rem",
                                                              },
                                                              right: {
                                                                value: 1,
                                                                unit: "rem",
                                                              },
                                                            },
                                                          },
                                                        ],
                                                        borderRadius: [
                                                          {
                                                            value: {
                                                              value: 0.5,
                                                              unit: "rem",
                                                            },
                                                          },
                                                        ],
                                                        backgroundColor: [
                                                          {
                                                            value:
                                                              "var(--value-secondary-color)",
                                                          },
                                                        ],
                                                        color: [
                                                          {
                                                            value:
                                                              "var(--value-secondary-foreground-color)",
                                                          },
                                                        ],
                                                        fontSize: [
                                                          {
                                                            value: {
                                                              value: 0.875,
                                                              unit: "rem",
                                                            },
                                                          },
                                                        ],
                                                        fontWeight: [
                                                          {
                                                            value: "500",
                                                          },
                                                        ],
                                                        display: [
                                                          {
                                                            value:
                                                              "inline-block",
                                                          },
                                                        ],
                                                        width: [
                                                          {
                                                            value:
                                                              "fit-content",
                                                          },
                                                        ],
                                                        textAlign: [
                                                          {
                                                            value: "center",
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  },
                                                ],
                                              },
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
                                                width: [
                                                  {
                                                    value: {
                                                      value: 100,
                                                      unit: "%",
                                                    },
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
                                                flexWrap: [
                                                  {
                                                    value: "wrap",
                                                  },
                                                ],
                                              },
                                            },
                                          },
                                        ],
                                        postUrl: "/blog/[slug]",
                                      },
                                    },
                                  },
                                ],
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
                                    value: {
                                      value: 100,
                                      unit: "%",
                                    },
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
                            },
                          },
                          {
                            id: "block-c8b4f448-38e8-42c2-8a08-9a4c5cbf22e8",
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
                                    value: {
                                      value: 100,
                                      unit: "%",
                                    },
                                  },
                                ],
                                padding: [
                                  {
                                    value: {
                                      top: {
                                        value: 1,
                                        unit: "rem",
                                      },
                                      bottom: {
                                        value: 1,
                                        unit: "rem",
                                      },
                                      left: {
                                        value: 0,
                                        unit: "rem",
                                      },
                                      right: {
                                        value: 0,
                                        unit: "rem",
                                      },
                                    },
                                  },
                                ],
                              },
                              props: {
                                children: [
                                  {
                                    type: "BlogPostNavigationButton-69404142f235c72ca0ce3598",
                                    id: "block-f39d51a5-1df9-4e6d-9a89-0e1fbec26893",
                                    data: {
                                      props: {
                                        direction: "prev",
                                      },
                                      style: {
                                        color: [
                                          {
                                            value:
                                              "var(--value-secondary-foreground-color)",
                                          },
                                        ],
                                        padding: [
                                          {
                                            value: {
                                              top: {
                                                value: 0.75,
                                                unit: "rem",
                                              },
                                              right: {
                                                value: 1.5,
                                                unit: "rem",
                                              },
                                              bottom: {
                                                value: 0.75,
                                                unit: "rem",
                                              },
                                              left: {
                                                value: 1.5,
                                                unit: "rem",
                                              },
                                            },
                                          },
                                        ],
                                        backgroundColor: [
                                          {
                                            value:
                                              "var(--value-secondary-color)",
                                          },
                                        ],
                                        filter: [
                                          {
                                            breakpoint: [],
                                            state: [
                                              {
                                                state: "hover",
                                                target: {
                                                  type: "self",
                                                },
                                              },
                                              {
                                                state: "focus",
                                                target: {
                                                  type: "self",
                                                },
                                              },
                                              {
                                                state: "active",
                                                target: {
                                                  type: "self",
                                                },
                                              },
                                            ],
                                            value: "brightness(0.9)",
                                          },
                                        ],
                                        transition: [
                                          {
                                            value: "all 0.3s ease",
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
                                            value: "center",
                                          },
                                        ],
                                        width: [
                                          {
                                            value: "max-content",
                                          },
                                        ],
                                        display: [
                                          {
                                            value: "inline-flex",
                                          },
                                        ],
                                        borderRadius: [
                                          {
                                            breakpoint: [],
                                            state: [],
                                            value: {
                                              value: 0,
                                              unit: "px",
                                            },
                                          },
                                        ],
                                        borderStyle: [
                                          {
                                            breakpoint: [],
                                            state: [],
                                            value: "none",
                                          },
                                        ],
                                      },
                                    },
                                  },
                                  {
                                    type: "BlogPostNavigationButton-69404142f235c72ca0ce3598",
                                    id: "block-cf6683f2-60d6-447f-b1b9-e52a26f69b58",
                                    data: {
                                      props: {
                                        direction: "next",
                                      },
                                      style: {
                                        color: [
                                          {
                                            value:
                                              "var(--value-secondary-foreground-color)",
                                          },
                                        ],
                                        padding: [
                                          {
                                            value: {
                                              top: {
                                                value: 0.75,
                                                unit: "rem",
                                              },
                                              right: {
                                                value: 1.5,
                                                unit: "rem",
                                              },
                                              bottom: {
                                                value: 0.75,
                                                unit: "rem",
                                              },
                                              left: {
                                                value: 1.5,
                                                unit: "rem",
                                              },
                                            },
                                          },
                                        ],
                                        backgroundColor: [
                                          {
                                            value:
                                              "var(--value-secondary-color)",
                                          },
                                        ],
                                        filter: [
                                          {
                                            breakpoint: [],
                                            state: [
                                              {
                                                state: "hover",
                                                target: {
                                                  type: "self",
                                                },
                                              },
                                              {
                                                state: "focus",
                                                target: {
                                                  type: "self",
                                                },
                                              },
                                              {
                                                state: "active",
                                                target: {
                                                  type: "self",
                                                },
                                              },
                                            ],
                                            value: "brightness(0.9)",
                                          },
                                        ],
                                        transition: [
                                          {
                                            value: "all 0.3s ease",
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
                                            value: "center",
                                          },
                                        ],
                                        width: [
                                          {
                                            value: "max-content",
                                          },
                                        ],
                                        display: [
                                          {
                                            value: "inline-flex",
                                          },
                                        ],
                                        borderStyle: [
                                          {
                                            breakpoint: [],
                                            state: [],
                                            value: "none",
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
                ],
              },
            },
          },
        ],
      },
      id: "block-36f06d5b-7f61-4a2c-a358-2fc3571b689d",
      type: "PageLayout",
    },
    slug: "blog",
    description: "Blog",
    keywords: "blog",
    tags: ["blog"],
    published: true,
    publishDate: new Date(),
    doNotCombine: {},
    headerId,
    footerId,
  },
  {
    title: "Blog post",
    content: {
      data: {
        fontFamily: "PRIMARY",
        fullWidth: true,
        children: [
          {
            id: "block-d65e7bf9-2639-4820-a62f-0af729031f3a",
            type: "BlogPostContainer",
            metadata: {
              blogAppName: "blog",
              blogAppId: appId,
            },
            data: {
              style: {
                padding: [
                  {
                    value: {
                      top: {
                        value: 1,
                        unit: "rem",
                      },
                      bottom: {
                        value: 1,
                        unit: "rem",
                      },
                      left: {
                        value: 1.5,
                        unit: "rem",
                      },
                      right: {
                        value: 1.5,
                        unit: "rem",
                      },
                    },
                  },
                ],
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
                    value: {
                      value: 100,
                      unit: "%",
                    },
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
                maxWidth: [
                  {
                    breakpoint: [],
                    state: [],
                    value: {
                      value: 100,
                      unit: "%",
                    },
                  },
                  {
                    breakpoint: ["sm"],
                    state: [],
                    value: {
                      value: 640,
                      unit: "px",
                    },
                  },
                  {
                    breakpoint: ["md"],
                    state: [],
                    value: {
                      value: 768,
                      unit: "px",
                    },
                  },
                  {
                    breakpoint: ["lg"],
                    state: [],
                    value: {
                      value: 1024,
                      unit: "px",
                    },
                  },
                  {
                    breakpoint: ["xl"],
                    state: [],
                    value: {
                      value: 1280,
                      unit: "px",
                    },
                  },
                  {
                    breakpoint: ["2xl"],
                    state: [],
                    value: {
                      value: 1536,
                      unit: "px",
                    },
                  },
                ],
                margin: [
                  {
                    breakpoint: [],
                    state: [],
                    value: {
                      top: "auto",
                      right: "auto",
                      bottom: "auto",
                      left: "auto",
                    },
                  },
                ],
              },
              props: {
                children: [
                  {
                    type: "Heading",
                    id: "block-aaf47f88-aef1-4d4a-bde0-1233078317e7",
                    data: {
                      props: {
                        level: "h1",
                        children: [
                          {
                            type: "BlogPostTitle",
                            id: "block-8bfab7e7-7d60-4104-9b18-0675c9afc924",
                            data: {
                              props: {},
                              style: {
                                fontSize: [
                                  {
                                    value: {
                                      value: 2,
                                      unit: "rem",
                                    },
                                  },
                                ],
                                fontWeight: [
                                  {
                                    value: "bold",
                                  },
                                ],
                              },
                            },
                          },
                        ],
                      },
                      style: {
                        textAlign: [
                          {
                            value: "center",
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
                    },
                  },
                  null,
                  {
                    type: "BlogPostPublishDate",
                    id: "block-63c1fb7d-b54f-4777-b170-9eb2fc906fc3",
                    data: {
                      props: {
                        format: "MMMM d, yyyy",
                      },
                      style: {
                        fontSize: [
                          {
                            value: {
                              value: 0.875,
                              unit: "rem",
                            },
                          },
                        ],
                      },
                    },
                  },
                  {
                    type: "BlogPostContent",
                    id: "block-a539ede0-2acc-4c4e-af6f-4e2668e2257a",
                    data: {
                      props: {
                        showShort: false,
                      },
                      style: {},
                    },
                  },
                  {
                    id: "block-258833cb-7a41-439b-b25f-892502d1301c",
                    type: "ForeachContainer",
                    data: {
                      props: {
                        value: "post.tags",
                        itemName: "tag",
                        children: [
                          {
                            type: "BlogPostTag",
                            id: "block-0b235ada-c309-4723-934b-5147cb9f9090",
                            data: {
                              props: {
                                blogListUrl: "/blog",
                              },
                              style: {
                                padding: [
                                  {
                                    value: {
                                      top: {
                                        value: 0.5,
                                        unit: "rem",
                                      },
                                      bottom: {
                                        value: 0.5,
                                        unit: "rem",
                                      },
                                      left: {
                                        value: 1,
                                        unit: "rem",
                                      },
                                      right: {
                                        value: 1,
                                        unit: "rem",
                                      },
                                    },
                                  },
                                ],
                                borderRadius: [
                                  {
                                    value: {
                                      value: 0.5,
                                      unit: "rem",
                                    },
                                  },
                                ],
                                backgroundColor: [
                                  {
                                    value: "var(--value-secondary-color)",
                                  },
                                ],
                                color: [
                                  {
                                    value:
                                      "var(--value-secondary-foreground-color)",
                                  },
                                ],
                                fontSize: [
                                  {
                                    value: {
                                      value: 0.875,
                                      unit: "rem",
                                    },
                                  },
                                ],
                                fontWeight: [
                                  {
                                    value: "500",
                                  },
                                ],
                                display: [
                                  {
                                    value: "inline-block",
                                  },
                                ],
                                width: [
                                  {
                                    value: "fit-content",
                                  },
                                ],
                                textAlign: [
                                  {
                                    value: "center",
                                  },
                                ],
                              },
                            },
                          },
                        ],
                      },
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
                        width: [
                          {
                            value: {
                              value: 100,
                              unit: "%",
                            },
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
                        flexWrap: [
                          {
                            value: "wrap",
                          },
                        ],
                      },
                    },
                  },
                ],
                postUrl: "/blog/[slug]",
              },
            },
          },
        ],
      },
      id: "block-f4a3e0de-4f60-4833-bf4d-d083eef4daa3",
      type: "PageLayout",
    },
    slug: "blog/[slug]",
    description: "post",
    keywords: "blog",
    published: true,
    publishDate: new Date(),
    tags: ["blog"],
    doNotCombine: {},
    headerId,
    footerId,
  },
];

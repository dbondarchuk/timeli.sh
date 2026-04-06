export const modifyDefaultPage = (bookLabels: Record<string, string>) => ({
  data: {
    fontFamily: "PRIMARY",
    fullWidth: true,
    children: [
      {
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
            gap: [
              {
                value: {
                  value: 0,
                  unit: "rem",
                },
              },
            ],
            width: [
              {
                breakpoint: [],
                state: [],
                value: {
                  value: 100,
                  unit: "%",
                },
              },
            ],
            maxWidth: [
              {
                breakpoint: [],
                state: [],
                value: {
                  value: 640,
                  unit: "px",
                },
              },
              {
                breakpoint: ["sm"],
                state: [],
                value: {
                  value: 768,
                  unit: "px",
                },
              },
              {
                breakpoint: ["md"],
                state: [],
                value: {
                  value: 1024,
                  unit: "px",
                },
              },
              {
                breakpoint: ["lg"],
                state: [],
                value: {
                  value: 1280,
                  unit: "px",
                },
              },
              {
                breakpoint: ["xl"],
                state: [],
                value: {
                  value: 1536,
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
                data: {
                  props: {
                    level: "h1",
                    children: [
                      {
                        type: "InlineContainer",
                        id: "block-80e6e8b2-79f9-4c6d-bf1b-c9e79bb94e03",
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
                                id: "block-62655d54-8c33-4270-8052-45d6db6b9cc9",
                                data: {
                                  props: {
                                    text: [
                                      {
                                        type: "paragraph",
                                        content: [
                                          {
                                            text: bookLabels.manageYourAppointment,
                                          },
                                        ],
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
                          value: 2,
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
                            value: 1,
                            unit: "rem",
                          },
                          left: "auto",
                          right: "auto",
                        },
                      },
                    ],
                  },
                },
                id: "block-b5e32fe9-77ee-4e1f-a54f-b9a81e7f5701",
              },
              {
                id: "block-9bb3d87a-a5a9-497f-b348-a954389bf5ef",
                type: "ModifyAppointmentFormModern",
                data: {
                  style: {},
                  props: {
                    hideTitle: true,
                    hideSteps: false,
                    scrollToTop: true,
                  },
                },
              },
              {
                type: "Text",
                data: {
                  props: {
                    value: [
                      {
                        children: [
                          {
                            text: bookLabels.policiesText,
                            fontSize: "0.75rem",
                            italic: true,
                            backgroundColor: "rgb(255, 255, 255)",
                            color: "rgb(2, 8, 23)",
                          },
                        ],
                        type: "p",
                        id: "KsqOqwpH7a",
                      },
                    ],
                  },
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
                    fontSize: [
                      {
                        value: {
                          value: 1,
                          unit: "rem",
                        },
                      },
                    ],
                    textAlign: [
                      {
                        breakpoint: [],
                        state: [],
                        value: "center",
                      },
                    ],
                  },
                },
                id: "block-47e1ae74-bd68-4d2f-97c7-891d4600e1df",
              },
            ],
          },
        },
        id: "block-6e96b1a3-4006-4358-aca3-f2e4067e3f51",
      },
    ],
  },
  id: "block-bcf6bfdf-c92a-4a80-996a-33b9166d4b55",
  type: "PageLayout",
});

import { deserializeMarkdown } from "@timelish/rte";
import { template } from "@timelish/utils";
import { renderToStaticMarkup } from "./static";

export type UserEmailTemplateButton = {
  text: string;
  url: string;
  textColor?: string;
  backgroundColor?: string;
};

export type UserEmailTemplateProps = {
  title: string;
  text: string;
  previewText?: string;

  topButtons?: Array<UserEmailTemplateButton | undefined>;
  bottomButtons?: Array<UserEmailTemplateButton | undefined>;
};

export const renderUserEmailTemplate = async (
  {
    text,
    topButtons: propsTopButtons,
    bottomButtons: propsBottomButtons,
    previewText,
    title,
  }: UserEmailTemplateProps,
  args: Record<string, any> = {},
) => {
  const topButtons =
    propsTopButtons
      ?.filter((b) => !!b)
      .map((b) => ({
        ...b,
        backgroundColor: b.backgroundColor ?? "#0066ff",
        textColor: b.textColor ?? "#FFFFFF",
      })) || [];

  const bottomButtons =
    propsBottomButtons
      ?.filter((b) => !!b)
      .map((b) => ({
        ...b,
        backgroundColor: b.backgroundColor ?? "#0066ff",
        textColor: b.textColor ?? "#FFFFFF",
      })) || [];

  const markdown = deserializeMarkdown(template(text, args));

  const userEmailTemplate = {
    type: "EmailLayout",
    id: "block-1740257042800",
    data: {
      backdropColor: "#F5F5F5",
      borderRadius: 0,
      canvasColor: "#FFFFFF",
      textColor: "#262626",
      fontFamily: "MODERN_SANS",
      previewText: previewText ?? title,
      maxWidth: 600,
      children: [
        {
          id: "block-36919dfb-0ea4-4f96-bf60-26e647e8f0a9",
          type: "Image",
          data: {
            props: {
              url: "https://app.timelish.com/email-logo.png",
              alt: "Timeli.sh Logo",
              contentAlignment: "middle",
              linkHref: "https://timelish.com",
              x: 50,
              y: 50,
              width: 200,
              height: 50,
            },
            style: {
              padding: {
                top: 16,
                bottom: 16,
                left: 24,
                right: 24,
              },
              textAlign: "center",
            },
          },
        },
        {
          type: "Heading",
          id: "block-1740257133963",
          data: {
            props: {
              text: "Timeli.sh - {{config.name}}",
              level: "h3",
            },
            style: {
              textAlign: "center",
              padding: {
                top: 16,
                bottom: 16,
                right: 24,
                left: 24,
              },
            },
          },
        },
        ...topButtons.map((button, index) => ({
          type: "Button",
          data: {
            props: {
              text: button.text,
              url: button.url,
              width: "full",
              size: "large",
              buttonStyle: "rounded",
              buttonTextColor: button.textColor,
              buttonBackgroundColor: button.backgroundColor,
            },
            style: {
              padding: {
                top: index !== 0 ? 0 : 16,
                bottom: index !== topButtons.length - 1 ? 4 : 16,
                left: 24,
                right: 24,
              },
              fontWeight: "normal",
              fontSize: 16,
              textAlign: "center",
            },
          },
          id: `top-button-${index}`,
        })),
        // ...(topButtons && topButtons.length >= 2
        //   ? [
        //       {
        //         type: "Columns",
        //         data: {
        //           props: {
        //             contentAlignment: "middle",
        //             columnsCount: 2,
        //             columnsGap: 8,
        //             columns: [
        //               {
        //                 children: [
        //                   {
        //                     type: "Button",
        //                     data: {
        //                       props: {
        //                         text: topButtons[0].text,
        //                         url: topButtons[0].url,
        //                         width: "full",
        //                         size: "large",
        //                         buttonStyle: "rounded",
        //                         buttonTextColor: topButtons[0].textColor,
        //                         buttonBackgroundColor:
        //                           topButtons[0].backgroundColor,
        //                       },
        //                       style: {
        //                         padding: {
        //                           top: 0,
        //                           bottom: 0,
        //                           left: 0,
        //                           right: 0,
        //                         },
        //                         fontWeight: "normal",
        //                         fontSize: 16,
        //                         textAlign: "center",
        //                       },
        //                     },
        //                     id: "block-b7ca72c1-48ea-4602-b68a-a4de733aeb68",
        //                   },
        //                 ],
        //               },
        //               {
        //                 children: [
        //                   {
        //                     type: "Button",
        //                     data: {
        //                       props: {
        //                         text: topButtons[1]!.text,
        //                         url: topButtons[1]!.url,
        //                         width: "full",
        //                         size: "large",
        //                         buttonStyle: "rounded",
        //                         buttonTextColor: topButtons[1]!.textColor,
        //                         buttonBackgroundColor:
        //                           topButtons[1]!.backgroundColor,
        //                       },
        //                       style: {
        //                         padding: {
        //                           top: 0,
        //                           bottom: 0,
        //                           left: 0,
        //                           right: 0,
        //                         },
        //                         fontWeight: "normal",
        //                         fontSize: 16,
        //                         textAlign: "center",
        //                       },
        //                     },
        //                     id: "block-b7ca72c1-48ea-4602-b68a-a4de733aeb68",
        //                   },
        //                 ],
        //               },
        //               {
        //                 children: [],
        //               },
        //             ],
        //           },
        //           style: {
        //             padding: {
        //               top: 16,
        //               bottom: 16,
        //               left: 24,
        //               right: 24,
        //             },
        //           },
        //         },
        //         id: "block-2e0092fa-834c-4740-a279-b00c76cc93f4",
        //       },
        //     ]
        //   : topButtons?.length === 1
        //     ? [
        //         {
        //           type: "Button",
        //           data: {
        //             props: {
        //               text: topButtons[0].text,
        //               url: topButtons[0].url,
        //               width: "full",
        //               size: "large",
        //               buttonStyle: "rounded",
        //               buttonTextColor: topButtons[0].textColor,
        //               buttonBackgroundColor: topButtons[0].backgroundColor,
        //             },
        //             style: {
        //               padding: {
        //                 top: 16,
        //                 bottom: 16,
        //                 left: 24,
        //                 right: 24,
        //               },
        //               fontWeight: "normal",
        //               fontSize: 16,
        //               textAlign: "center",
        //             },
        //           },
        //           id: "block-9675dca7-c1fd-431a-83dc-f9d0cbd15030",
        //         },
        //       ]
        //     : []),
        {
          type: "Heading",
          id: "block-1740076839739",
          data: {
            props: {
              text: title,
            },
            style: {
              textAlign: "center",
              padding: {
                top: 16,
                bottom: 16,
                right: 24,
                left: 24,
              },
            },
          },
        },
        {
          type: "Text",
          id: "block-1740076857419",
          data: {
            style: {
              fontWeight: "normal",
              padding: {
                top: 16,
                bottom: 0,
                right: 24,
                left: 24,
              },
            },
            props: {
              value: markdown,
            },
          },
        },

        ...bottomButtons.map((button, index) => ({
          type: "Button",
          data: {
            props: {
              text: button.text,
              url: button.url,
              width: "full",
              size: "large",
              buttonStyle: "rounded",
              buttonTextColor: button.textColor,
              buttonBackgroundColor: button.backgroundColor,
            },
            style: {
              padding: {
                top: index !== 0 ? 0 : 16,
                bottom: index !== bottomButtons.length - 1 ? 4 : 16,
                left: 24,
                right: 24,
              },
              fontWeight: "normal",
              fontSize: 16,
              textAlign: "center",
            },
          },
          id: `bottom-button-${index}`,
        })),
        // ...(bottomButtons && bottomButtons.length >= 2
        //   ? [
        //       {
        //         type: "Columns",
        //         data: {
        //           props: {
        //             contentAlignment: "middle",
        //             columnsCount: 2,
        //             columnsGap: 8,
        //             columns: [
        //               {
        //                 children: [
        //                   {
        //                     type: "Button",
        //                     data: {
        //                       props: {
        //                         text: bottomButtons[0].text,
        //                         url: bottomButtons[0].url,
        //                         width: "full",
        //                         size: "large",
        //                         buttonStyle: "rounded",
        //                         buttonTextColor: bottomButtons[0].textColor,
        //                         buttonBackgroundColor:
        //                           bottomButtons[0].backgroundColor,
        //                       },
        //                       style: {
        //                         padding: {
        //                           top: 0,
        //                           bottom: 0,
        //                           left: 0,
        //                           right: 0,
        //                         },
        //                         fontWeight: "normal",
        //                         fontSize: 16,
        //                         textAlign: "center",
        //                       },
        //                     },
        //                     id: "block-b7ca72c1-48ea-4602-b68a-a4de733aeb68",
        //                   },
        //                 ],
        //               },
        //               {
        //                 children: [
        //                   {
        //                     type: "Button",
        //                     data: {
        //                       props: {
        //                         text: bottomButtons[1]!.text,
        //                         url: bottomButtons[1]!.url,
        //                         width: "full",
        //                         size: "large",
        //                         buttonStyle: "rounded",
        //                         buttonTextColor: bottomButtons[1]!.textColor,
        //                         buttonBackgroundColor:
        //                           bottomButtons[1]!.backgroundColor,
        //                       },
        //                       style: {
        //                         padding: {
        //                           top: 0,
        //                           bottom: 0,
        //                           left: 0,
        //                           right: 0,
        //                         },
        //                         fontWeight: "normal",
        //                         fontSize: 16,
        //                         textAlign: "center",
        //                       },
        //                     },
        //                     id: "block-b7ca72c1-48ea-4602-b68a-a4de733aeb68",
        //                   },
        //                 ],
        //               },
        //               {
        //                 children: [],
        //               },
        //             ],
        //           },
        //           style: {
        //             padding: {
        //               top: 16,
        //               bottom: 16,
        //               left: 24,
        //               right: 24,
        //             },
        //           },
        //         },
        //         id: "block-2e0092fa-834c-4740-a279-b00c76cc93f4",
        //       },
        //     ]
        //   : bottomButtons?.length === 1
        //     ? [
        //         {
        //           type: "Button",
        //           data: {
        //             props: {
        //               text: bottomButtons[0].text,
        //               url: bottomButtons[0].url,
        //               width: "full",
        //               size: "large",
        //               buttonStyle: "rounded",
        //               buttonTextColor: bottomButtons[0].textColor,
        //               buttonBackgroundColor: bottomButtons[0].backgroundColor,
        //             },
        //             style: {
        //               padding: {
        //                 top: 16,
        //                 bottom: 16,
        //                 left: 24,
        //                 right: 24,
        //               },
        //               fontWeight: "normal",
        //               fontSize: 16,
        //               textAlign: "center",
        //             },
        //           },
        //           id: "block-9675dca7-c1fd-431a-83dc-f9d0cbd15030",
        //         },
        //       ]
        //     : []),
        {
          id: "block-16a45380-afc4-4a5f-ab8b-3eb5c32fc99c",
          type: "OnlineMeeting",
          data: {
            props: {
              title: "{{option.name}}",
              whenText: "When:",
              codeText: "Code:",
              passwordText: "Password:",
              buttonText: "Join Meeting",
              linkText:
                "Trouble joining? Copy & paste this link into your browser:",
              buttonTextColor: "#FFFFFF",
              buttonBackgroundColor: "#0b5cff",
              type: "{{meetingInformation.type}}",
            },
            style: {
              padding: {
                top: 16,
                bottom: 16,
                left: 24,
                right: 24,
              },
            },
          },
        },
        // {
        //   type: "Text",
        //   id: "block-1740258119442",
        //   data: {
        //     props: {
        //       value: [
        //         {
        //           children: [
        //             {
        //               text: "{{config.name}}",
        //               fontSize: "11px",
        //               color: "#999999",
        //             },
        //           ],
        //           type: "p",
        //           id: "_ZckO-whgq",
        //           align: "center",
        //         },
        //         {
        //           type: "p",
        //           id: "GgAnNok00v",
        //           align: "center",
        //           children: [
        //             {
        //               text: "{{config.address}}",
        //               fontSize: "11px",
        //               color: "#999999",
        //             },
        //           ],
        //         },
        //         {
        //           type: "p",
        //           align: "center",
        //           children: [
        //             {
        //               text: "{{config.phone}}",
        //               fontSize: "11px",
        //               color: "#999999",
        //             },
        //           ],
        //           id: "Nb_oLeI107",
        //         },
        //       ],
        //     },
        //     style: {
        //       padding: {
        //         top: 16,
        //         bottom: 16,
        //         left: 24,
        //         right: 24,
        //       },
        //       fontWeight: "normal",
        //     },
        //   },
        // },
      ],
    },
  };

  return await renderToStaticMarkup({
    document: userEmailTemplate,
    args,
  });
};

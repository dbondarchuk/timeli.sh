"use client";
import {
  EditorDocumentBlocksDictionary,
  generateId,
  TEditorBlock,
} from "@timelish/builder";
import {
  ArrowBigRightDash,
  Calendar,
  CalendarCheck,
  CalendarSync,
  ChevronDown,
  Code,
  Columns3,
  Copy,
  CopyPlus,
  Film,
  GalleryHorizontalEnd,
  GalleryThumbnails,
  Heading,
  Image,
  Images,
  Layout,
  LetterText,
  Link,
  RectangleHorizontal,
  Repeat2,
  ShieldQuestion,
  SquareMousePointer,
  SquareSquare,
  Star,
  Text,
  Zap,
} from "lucide-react";
import {
  AccordionConfiguration,
  AccordionEditor,
  AccordionPropsDefaults,
  AccordionToolbar,
} from "./accordion";
import {
  AccordionItemConfiguration,
  AccordionItemEditor,
  AccordionItemPropsDefaults,
  AccordionItemToolbar,
} from "./accordion-item";
import {
  BeforeAfterConfiguration,
  BeforeAfterEditor,
  BeforeAfterPropsDefaults,
  BeforeAfterToolbar,
} from "./before-after";
import {
  ButtonConfiguration,
  ButtonEditor,
  ButtonPropsDefaults,
  ButtonToolbar,
} from "./button";
import {
  LinkConfiguration,
  LinkEditor,
  LinkPropsDefaults,
  LinkToolbar,
} from "./link";

import {
  BookingConfiguration,
  BookingEditor,
  BookingPropsDefaults,
  BookingToolbar,
} from "./booking";
import {
  BookingConfirmationConfiguration,
  BookingConfirmationEditor,
  BookingConfirmationPropsDefaults,
} from "./booking-confirmation";
import {
  CarouselConfiguration,
  CarouselEditor,
  CarouselPropsDefaults,
  CarouselToolbar,
} from "./carousel";
import {
  ConditionalContainerConfiguration,
  ConditionalContainerEditor,
  ConditionalContainerPropsDefaults,
} from "./conditional-container";
import {
  ContainerConfiguration,
  ContainerEditor,
  ContainerPropsDefaults,
  ContainerToolbar,
} from "./container";
import {
  CustomHTMLConfiguration,
  CustomHTMLEditor,
  CustomHTMLToolbar,
} from "./custom-html";
import { CustomHTMLPropsDefaults } from "./custom-html/schema";
import {
  ForeachContainerConfiguration,
  ForeachContainerEditor,
  ForeachContainerPropsDefaults,
} from "./foreach-container";
import {
  GridContainerConfiguration,
  GridContainerEditor,
  GridContainerPropsDefaults,
  GridContainerToolbar,
} from "./grid-container";
import {
  HeadingConfiguration,
  HeadingEditor,
  HeadingPropsDefaults,
  HeadingToolbar,
} from "./heading";
import {
  IconConfiguration,
  IconEditor,
  IconPropsDefaults,
  IconToolbar,
} from "./icon";
import {
  ImageConfiguration,
  ImageEditor,
  ImagePropsDefaults,
  ImageToolbar,
} from "./image";
import {
  InlineContainerConfiguration,
  InlineContainerEditor,
  InlineContainerPropsDefaults,
  InlineContainerToolbar,
} from "./inline-container";
import {
  InlineTextConfiguration,
  InlineTextEditor,
  InlineTextPropsDefaults,
  InlineTextToolbar,
} from "./inline-text";
import {
  LightboxConfiguration,
  LightboxEditor,
  LightboxPropsDefaults,
} from "./lightbox";
import {
  ModifyAppointmentFormConfiguration,
  ModifyAppointmentFormEditor,
  ModifyAppointmentFormPropsDefaults,
} from "./modify-appointment-form";
import {
  PageHeroConfiguration,
  PageHeroEditor,
  PageHeroPropsDefaults,
  PageHeroToolbar,
} from "./page-hero";
import {
  PageLayoutConfiguration,
  PageLayoutDefaultProps,
  PageLayoutEditor,
  PageLayoutProps,
  PageLayoutToolbar,
} from "./page-layout";
import {
  PopupConfiguration,
  PopupEditor,
  PopupPropsDefaults,
  PopupToolbar,
} from "./popup";
import {
  RedirectConfiguration,
  RedirectEditor,
  RedirectPropsDefaults,
} from "./redirect";
import { EditorBlocksSchema } from "./schema";
import {
  SpacerConfiguration,
  SpacerPropsDefaults,
  SpacerToolbar,
} from "./spacer";
import { SpacerEditor } from "./spacer/editor";
import {
  TextConfiguration,
  TextEditor,
  TextPropsDefaults,
  TextToolbar,
} from "./text";
import {
  VideoConfiguration,
  VideoEditor,
  VideoPropsDefaults,
  VideoToolbar,
} from "./video";
import {
  YouTubeVideoConfiguration,
  YouTubeVideoEditor,
  YouTubeVideoPropsDefaults,
  YouTubeVideoToolbar,
} from "./youtube-video";

export const EditorBlocks: EditorDocumentBlocksDictionary<
  typeof EditorBlocksSchema
> = {
  Image: {
    displayName: "builder.pageBuilder.blocks.image.displayName",
    icon: <Image />,
    Editor: ImageEditor,
    Configuration: ImageConfiguration,
    Toolbar: ImageToolbar,
    defaultValue: ImagePropsDefaults,
    category: "builder.pageBuilder.blocks.categories.objects",
  },
  Button: {
    displayName: "builder.pageBuilder.blocks.button.displayName",
    icon: <SquareMousePointer />,
    Editor: ButtonEditor,
    Configuration: ButtonConfiguration,
    Toolbar: ButtonToolbar,
    defaultValue: ButtonPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.buttons",
  },
  Link: {
    displayName: "builder.pageBuilder.blocks.link.displayName",
    icon: <Link />,
    Editor: LinkEditor,
    Configuration: LinkConfiguration,
    Toolbar: LinkToolbar,
    defaultValue: LinkPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.buttons",
  },
  Heading: {
    displayName: "builder.pageBuilder.blocks.heading.displayName",
    icon: <Heading />,
    Configuration: HeadingConfiguration,
    Editor: HeadingEditor,
    Toolbar: HeadingToolbar,
    defaultValue: HeadingPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.text",
  },
  Text: {
    displayName: "builder.pageBuilder.blocks.text.displayName",
    icon: <LetterText />,
    Editor: TextEditor,
    Configuration: TextConfiguration,
    Toolbar: TextToolbar,
    defaultValue: TextPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.text",
    disable: {
      keyboardShortcuts: {
        pasteImage: true,
        delete: true,
        moveUp: true,
        moveDown: true,
        undoRedo: true,
      },
    },
  },
  Icon: {
    displayName: "builder.pageBuilder.blocks.icon.displayName",
    icon: <Star />,
    Editor: IconEditor,
    Configuration: IconConfiguration,
    Toolbar: IconToolbar,
    defaultValue: IconPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.objects",
  },
  // Divider: {
  //   displayName: "Divider",
  //   icon: <SquareSplitVertical />,
  //   Editor: Divider,
  //   Configuration: DividerConfiguration,
  //   Toolbar: DividerToolbar,
  //   defaultValue: DividerPropsDefaults,
  //   category: "Dividers",
  // },
  Spacer: {
    displayName: "builder.pageBuilder.blocks.spacer.displayName",
    icon: <RectangleHorizontal />,
    Editor: SpacerEditor,
    Configuration: SpacerConfiguration,
    Toolbar: SpacerToolbar,
    defaultValue: SpacerPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.layout",
  },
  PageLayout: {
    displayName: "builder.pageBuilder.blocks.pageLayout.displayName",
    icon: <Layout />,
    Editor: PageLayoutEditor,
    Configuration: PageLayoutConfiguration,
    Toolbar: PageLayoutToolbar,
    defaultValue: PageLayoutDefaultProps,
    category: "builder.pageBuilder.blocks.categories.layout",
  },
  Container: {
    displayName: "builder.pageBuilder.blocks.container.displayName",
    icon: <CopyPlus />,
    Configuration: ContainerConfiguration,
    Editor: ContainerEditor,
    Toolbar: ContainerToolbar,
    defaultValue: ContainerPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.layout",
  },
  GridContainer: {
    displayName: "builder.pageBuilder.blocks.gridContainer.displayName",
    icon: <Columns3 />,
    Configuration: GridContainerConfiguration,
    Editor: GridContainerEditor,
    Toolbar: GridContainerToolbar,
    defaultValue: GridContainerPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.layout",
  },
  PageHero: {
    displayName: "builder.pageBuilder.blocks.pageHero.displayName",
    icon: <Zap />,
    Configuration: PageHeroConfiguration,
    Editor: PageHeroEditor,
    Toolbar: PageHeroToolbar,
    defaultValue: PageHeroPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.layout",
  },
  // Columns: {
  //   displayName: "Columns",
  //   icon: <Columns3 />,
  //   Configuration: ColumnsContainerConfiguration,
  //   Editor: ColumnsContainerEditor,
  //   Toolbar: ColumnsContainerToolbar,
  //   defaultValue: ColumnsContainerPropsDefaults,
  //   category: "Containers",
  // },
  ConditionalContainer: {
    displayName: "builder.pageBuilder.blocks.conditionalContainer.displayName",
    icon: <ShieldQuestion />,
    Configuration: ConditionalContainerConfiguration,
    Editor: ConditionalContainerEditor,
    defaultValue: ConditionalContainerPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.layout",
  },
  ForeachContainer: {
    displayName: "builder.pageBuilder.blocks.foreachContainer.displayName",
    icon: <Repeat2 />,
    Configuration: ForeachContainerConfiguration,
    Editor: ForeachContainerEditor,
    defaultValue: ForeachContainerPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.layout",
  },
  Booking: {
    displayName: "builder.pageBuilder.blocks.booking.displayName",
    icon: <Calendar />,
    Configuration: BookingConfiguration,
    Editor: BookingEditor,
    Toolbar: BookingToolbar,
    defaultValue: BookingPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.booking",
  },
  Carousel: {
    displayName: "builder.pageBuilder.blocks.carousel.displayName",
    icon: <GalleryHorizontalEnd />,
    Editor: CarouselEditor,
    Configuration: CarouselConfiguration,
    Toolbar: CarouselToolbar,
    defaultValue: CarouselPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.layout",
  },
  Video: {
    displayName: "builder.pageBuilder.blocks.video.displayName",
    icon: <Film />,
    Editor: VideoEditor,
    Configuration: VideoConfiguration,
    Toolbar: VideoToolbar,
    defaultValue: VideoPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.objects",
  },
  YouTubeVideo: {
    displayName: "builder.pageBuilder.blocks.youtubeVideo.displayName",
    icon: <Film />,
    Editor: YouTubeVideoEditor,
    Configuration: YouTubeVideoConfiguration,
    Toolbar: YouTubeVideoToolbar,
    defaultValue: YouTubeVideoPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.objects",
  },
  Popup: {
    displayName: "builder.pageBuilder.blocks.popup.displayName",
    icon: <SquareSquare />,
    Editor: PopupEditor,
    Configuration: PopupConfiguration,
    Toolbar: PopupToolbar,
    defaultValue: PopupPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.objects",
    allowedIn: ["PageLayout"],
  },
  InlineText: {
    displayName: "builder.pageBuilder.blocks.inlineText.displayName",
    icon: <Text />,
    Editor: InlineTextEditor,
    Configuration: InlineTextConfiguration,
    Toolbar: InlineTextToolbar,
    defaultValue: InlineTextPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.text",
    disable: {
      keyboardShortcuts: {
        delete: true,
        moveUp: true,
        moveDown: true,
      },
    },
  },
  Accordion: {
    displayName: "builder.pageBuilder.blocks.accordion.displayName",
    icon: <ChevronDown />,
    Editor: AccordionEditor,
    Configuration: AccordionConfiguration,
    Toolbar: AccordionToolbar,
    defaultValue: AccordionPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.layout",
  },
  AccordionItem: {
    displayName: "builder.pageBuilder.blocks.accordionItem.displayName",
    icon: <ChevronDown />,
    Editor: AccordionItemEditor,
    Configuration: AccordionItemConfiguration,
    Toolbar: AccordionItemToolbar,
    defaultValue: AccordionItemPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.layout",
    allowedIn: ["Accordion"],
  },
  InlineContainer: {
    displayName: "builder.pageBuilder.blocks.inlineContainer.displayName",
    icon: <Copy />,
    Editor: InlineContainerEditor,
    Configuration: InlineContainerConfiguration,
    Toolbar: InlineContainerToolbar,
    defaultValue: InlineContainerPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.layout",
  },
  CustomHTML: {
    displayName: "builder.pageBuilder.blocks.customHtml.displayName",
    icon: <Code />,
    Editor: CustomHTMLEditor,
    Configuration: CustomHTMLConfiguration,
    Toolbar: CustomHTMLToolbar,
    defaultValue: CustomHTMLPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.layout",
  },
  BeforeAfter: {
    displayName: "builder.pageBuilder.blocks.beforeAfterSlider.displayName",
    icon: <Images />,
    Editor: BeforeAfterEditor,
    Configuration: BeforeAfterConfiguration,
    Toolbar: BeforeAfterToolbar,
    defaultValue: BeforeAfterPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.objects",
  },
  Lightbox: {
    displayName: "builder.pageBuilder.blocks.lightbox.displayName",
    icon: <GalleryThumbnails />,
    Editor: LightboxEditor,
    Configuration: LightboxConfiguration,
    defaultValue: LightboxPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.content",
  },
  Redirect: {
    displayName: "builder.pageBuilder.blocks.redirect.displayName",
    icon: <ArrowBigRightDash />,
    Editor: RedirectEditor,
    Configuration: RedirectConfiguration,
    defaultValue: RedirectPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.navigation",
  },
  ModifyAppointmentForm: {
    displayName: "builder.pageBuilder.blocks.modifyAppointmentForm.displayName",
    icon: <CalendarSync />,
    Editor: ModifyAppointmentFormEditor,
    Configuration: ModifyAppointmentFormConfiguration,
    defaultValue: ModifyAppointmentFormPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.booking",
  },
  BookingConfirmation: {
    displayName: "builder.pageBuilder.blocks.bookingConfirmation.displayName",
    icon: <CalendarCheck />,
    Editor: BookingConfirmationEditor,
    Configuration: BookingConfirmationConfiguration,
    defaultValue: BookingConfirmationPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.booking",
  },
};

export const RootBlock: TEditorBlock<Partial<PageLayoutProps>> = {
  data: PageLayoutDefaultProps,
  id: generateId(),
  type: "PageLayout",
};

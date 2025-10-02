import { ReaderDocumentBlocksDictionary } from "@vivid/builder";
import { AccordionItem } from "./accordion-item/reader";
import { Accordion } from "./accordion/reader";
import { BeforeAfterReader } from "./before-after/reader";
import { BookingConfirmationReader } from "./booking-confirmation/reader";
import { BookingReader } from "./booking/reader";
import { ButtonReader } from "./button/reader";
import { CarouselReader } from "./carousel/reader";
import { ConditionalContainerReader } from "./conditional-container/reader";
import { ContainerReader } from "./container/reader";
import { CustomHTML } from "./custom-html/reader";
import { ForeachContainerReader } from "./foreach-container/reader";
import { GridContainerReader } from "./grid-container/reader";
import { Heading } from "./heading/reader";
import { Icon } from "./icon/reader";
import { Image } from "./image/reader";
import { InlineContainerReader } from "./inline-container/reader";
import { InlineText } from "./inline-text/reader";
import { LightboxReader } from "./lightbox/reader";
import { Link } from "./link/reader";
import { ModifyAppointmentFormReader } from "./modify-appointment-form/reader";
import { PageHeroReader } from "./page-hero/reader";
import { PageLayoutReader } from "./page-layout/reader";
import { PopupReader } from "./popup/reader";
import { RedirectReader } from "./redirect/reader";
import { EditorBlocksSchema } from "./schema";
import { SpacerReader } from "./spacer/reader";
import { TextReader } from "./text/reader";
import { Video } from "./video";
import { YouTubeVideoReader } from "./youtube-video/reader";

export const ReaderBlocks: ReaderDocumentBlocksDictionary<
  typeof EditorBlocksSchema
> = {
  Image: {
    Reader: Image,
  },
  Button: {
    Reader: ButtonReader,
  },
  Link: {
    Reader: Link,
  },
  Text: {
    Reader: TextReader,
  },
  Icon: {
    Reader: Icon,
  },
  Spacer: {
    Reader: SpacerReader,
  },
  PageLayout: {
    Reader: PageLayoutReader,
  },
  Heading: {
    Reader: Heading,
  },
  Container: {
    Reader: ContainerReader,
  },
  ConditionalContainer: {
    Reader: ConditionalContainerReader,
  },
  ForeachContainer: {
    Reader: ForeachContainerReader,
  },
  GridContainer: {
    Reader: GridContainerReader,
  },
  PageHero: {
    Reader: PageHeroReader,
  },
  Booking: {
    Reader: BookingReader,
  },
  BookingConfirmation: {
    Reader: BookingConfirmationReader,
  },
  Carousel: {
    Reader: CarouselReader,
  },
  Video: {
    Reader: Video,
  },
  Popup: {
    Reader: PopupReader,
  },
  InlineText: {
    Reader: InlineText,
  },
  YouTubeVideo: {
    Reader: YouTubeVideoReader,
  },
  Accordion: {
    Reader: Accordion,
  },
  AccordionItem: {
    Reader: AccordionItem,
  },
  InlineContainer: {
    Reader: InlineContainerReader,
  },
  CustomHTML: {
    Reader: CustomHTML,
  },
  BeforeAfter: {
    Reader: BeforeAfterReader,
  },
  Lightbox: {
    Reader: LightboxReader,
  },
  Redirect: {
    Reader: RedirectReader,
  },
  ModifyAppointmentForm: {
    Reader: ModifyAppointmentFormReader,
  },
};

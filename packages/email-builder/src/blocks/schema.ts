import { AvatarPropsSchema } from "./avatar";
import { ButtonPropsSchema } from "./button";
import { ColumnsContainerPropsSchema } from "./columns-container";
import { ConditionalContainerPropsSchema } from "./conditional-container";
import { ContainerPropsSchema } from "./container";
import { CustomHTMLPropsSchema } from "./custom-html/schema";
import { DividerPropsSchema } from "./divider";
import EmailLayoutPropsSchema from "./email-layout/schema";
import { ForeachContainerPropsSchema } from "./foreach-container";
import { HeadingPropsSchema } from "./heading";
import { ImagePropsSchema } from "./image";
import { OnlineMeetingPropsSchema } from "./online-meeting/schema";
import { SpacerPropsSchema } from "./spacer";
import { TextPropsSchema } from "./text";

export const EditorBlocksSchema = {
  Avatar: AvatarPropsSchema,
  Image: ImagePropsSchema,
  Button: ButtonPropsSchema,
  Heading: HeadingPropsSchema,
  Text: TextPropsSchema,
  Divider: DividerPropsSchema,
  Spacer: SpacerPropsSchema,
  EmailLayout: EmailLayoutPropsSchema,
  Container: ContainerPropsSchema,
  Columns: ColumnsContainerPropsSchema,
  ConditionalContainer: ConditionalContainerPropsSchema,
  ForeachContainer: ForeachContainerPropsSchema,
  CustomHTML: CustomHTMLPropsSchema,
  OnlineMeeting: OnlineMeetingPropsSchema,
};

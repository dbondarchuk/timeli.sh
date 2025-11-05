import { FormDescription } from "../form";
import { Markdown } from "../markdown";

export const FormFieldDescription: React.FC<{
  description?: string;
  className?: string;
}> = ({ description, className }) => {
  return description ? (
    <FormDescription className={className}>
      <Markdown markdown={description} prose="none" />
    </FormDescription>
  ) : null;
};

import {
  BaseZodDictionary,
  TReaderProps,
  renderToStaticMarkup as baseRenderToStaticMarkup,
} from "@timelish/builder";
import { ReaderBlocks } from "../blocks/reader";

export async function renderToStaticMarkup<T extends BaseZodDictionary>(
  props: Omit<TReaderProps<T>, "blocks">,
) {
  return await baseRenderToStaticMarkup(
    {
      ...props,
      blocks: ReaderBlocks,
    },
    ["https://platejs.org/tailwind.css"],
  );
}

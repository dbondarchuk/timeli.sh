import { BaseZodDictionary } from "../types";
import { Reader, TReaderProps } from "./block";

export async function renderElementToStaticMarkup(element: React.ReactElement) {
  const { renderToStaticMarkup: baseRenderToStaticMarkup } = await import(
    "react-dom/server"
  );

  return baseRenderToStaticMarkup(element);
}

export async function renderToStaticMarkup<T extends BaseZodDictionary>(
  props: TReaderProps<T>,
) {
  return await renderElementToStaticMarkup(<Reader {...props} />);
}

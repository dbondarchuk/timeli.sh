import { BaseZodDictionary } from "../types";
import { Reader, TReaderProps } from "./block";

export async function renderToStaticMarkup<T extends BaseZodDictionary>(
  props: TReaderProps<T>,
  customCss?: string[],
) {
  const { renderToStaticMarkup: baseRenderToStaticMarkup } = await import(
    "react-dom/server"
  );

  const element = (
    <html>
      <head>
        {customCss?.map((css, index) => (
          <link rel="stylesheet" key={index} href={css} />
        ))}
      </head>
      <body>
        <Reader {...props} />
      </body>
    </html>
  );

  return "<!DOCTYPE html>" + baseRenderToStaticMarkup(element);
}

import { Reader, ReaderDocumentBlocksDictionary } from "@vivid/builder";
import { ReaderBlocks } from "./blocks/reader";
export { Header } from "@vivid/page-builder-base";

export { Styling } from "@vivid/page-builder-base/reader";

export const PageReader = ({
  document,
  args,
  additionalBlocks,
}: {
  document: any;
  args?: any;
  additionalBlocks?: ReaderDocumentBlocksDictionary<any>;
}) => {
  return (
    <Reader
      document={document}
      blocks={{ ...ReaderBlocks, ...additionalBlocks } as any}
      args={args}
    />
  );
};

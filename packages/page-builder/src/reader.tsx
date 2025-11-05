import {
  Reader,
  ReaderDocumentBlocksDictionary,
} from "@timelish/builder/reader";
import { ReaderBlocks } from "./blocks/reader";
export { Header, Styling } from "@timelish/page-builder-base/reader";

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

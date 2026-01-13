import { Reader } from "@timelish/builder/reader";
import {
  BlockProviderRegistry,
  resolveProviders,
} from "./block-providers/reader";
import { ReaderBlocks } from "./blocks/reader";
export { Header, Styling } from "@timelish/page-builder-base/reader";

export * from "./block-providers/reader";

export const PageReader = ({
  document,
  args,
  blockRegistry,
}: {
  document: any;
  args?: any;
  blockRegistry?: BlockProviderRegistry<any>;
}) => {
  return (
    <Reader
      document={document}
      blocks={
        {
          ...ReaderBlocks,
          ...resolveProviders(blockRegistry || { providers: [] }).readers,
        } as any
      }
      args={args}
    />
  );
};

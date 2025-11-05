import { EditorRedirect } from "./editor-redirect";
import { Redirect } from "./redirect";
import { RedirectDefaultUrl, RedirectReaderProps } from "./schema";

export const RedirectReader = ({ props, ...rest }: RedirectReaderProps) => {
  const url = (props as any)?.url ?? RedirectDefaultUrl;
  const permanent = (props as any)?.permanent ?? false;

  return (
    <>
      {rest.isEditor ? (
        <EditorRedirect url={url} />
      ) : (
        <Redirect url={url} permanent={permanent} />
      )}
    </>
  );
};

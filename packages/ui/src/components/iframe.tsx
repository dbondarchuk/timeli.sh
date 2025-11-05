import React from "react";
import { createPortal } from "react-dom";

export const IFrame: React.FC<
  React.PropsWithChildren & React.HTMLAttributes<HTMLIFrameElement>
> = ({ children, ...props }) => {
  const contentRef = React.useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = React.useState<HTMLElement | undefined>(
    undefined,
  );

  const current = contentRef?.current;

  React.useEffect(() => {
    setMountNode(contentRef?.current?.contentWindow?.document?.body);
  }, [current, setMountNode]);

  return (
    <iframe {...props} ref={contentRef}>
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
};

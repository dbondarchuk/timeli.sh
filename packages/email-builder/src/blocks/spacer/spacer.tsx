import { CSSProperties, forwardRef } from "react";
import { SpacerProps, SpacerPropsDefaults } from "./schema";

export const Spacer = forwardRef<
  HTMLDivElement,
  SpacerProps & { onClick?: (e: React.MouseEvent<HTMLDivElement>) => void }
>(({ props, style, onClick }, ref) => {
  const styles: CSSProperties = {
    height: props?.height ?? SpacerPropsDefaults.props.height,
    backgroundColor: style?.backgroundColor ?? undefined,
  };

  return <div style={styles} ref={ref} onClick={onClick} />;
});

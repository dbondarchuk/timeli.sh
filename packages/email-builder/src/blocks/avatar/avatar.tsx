import { forwardRef } from "react";
import { AvatarProps, AvatarPropsDefaults } from "./schema";
import { getBorderRadius, getStyles } from "./styles";

export const Avatar = forwardRef<
  HTMLDivElement,
  AvatarProps & { onClick?: (e: React.MouseEvent<HTMLDivElement>) => void }
>(({ style, props, onClick }, ref) => {
  const size = props?.size ?? AvatarPropsDefaults.props.size;
  const imageUrl = props?.imageUrl ?? AvatarPropsDefaults.props.imageUrl;
  const alt = props?.alt ?? AvatarPropsDefaults.props.alt;
  const shape = props?.shape ?? AvatarPropsDefaults.props.shape;

  const sectionStyle = getStyles({ style });

  return (
    <div style={sectionStyle} ref={ref} onClick={onClick}>
      <img
        alt={alt}
        src={imageUrl}
        height={size}
        width={size}
        style={{
          outline: "none",
          border: "none",
          textDecoration: "none",
          objectFit: "cover",
          height: size,
          width: size,
          maxWidth: "100%",
          display: "inline-block",
          verticalAlign: "middle",
          textAlign: "center",
          borderRadius: getBorderRadius(shape, size),
        }}
      />
    </div>
  );
});

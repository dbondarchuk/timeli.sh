import { cva, VariantProps } from "class-variance-authority";
import NextLink from "next/link";
import React from "react";
import { cn } from "../utils";
import { ButtonSize, ButtonVariant, buttonVariants } from "./button";
import { textVariants, TextVariants } from "./text";

const linkVariants = {
  default: "underline",
  underline: "underline",
  standalone: "no-underline",
  dashed: "underline decoration-dashed",
};

const linkSizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export const linkClasses = cva(
  ["text-primary", "hover:text-gray-800", "transition-all"],
  {
    variants: {
      variant: linkVariants,
      size: linkSizes,
    },
    defaultVariants: {},
  },
);

export type LinkVariant = VariantProps<typeof linkClasses>["variant"];
export const LinkVariants = Object.keys(
  linkVariants,
) as (keyof typeof linkVariants)[];

export type LinkSize = VariantProps<typeof linkClasses>["size"];
export const LinkSizes = Object.keys(linkSizes) as (keyof typeof linkSizes)[];

type BaseProps = Omit<React.ComponentProps<typeof NextLink>, "as"> &
  TextVariants & {
    target?: "_blank" | "_parent" | "_self" | "_top";
  };

type BaseLinkProps = BaseProps & {
  variant?: LinkVariant;
  size?: LinkSize;
};

type ButtonLinkProps = BaseProps & {
  button?: true;
  as?: "link" | "externalLink";
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export type LinkProps = BaseLinkProps | ButtonLinkProps;

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    let passProps = props;
    let classes: string = "";
    const textClasses = textVariants({
      fontSize: props.fontSize,
      fontWeight: props.fontWeight,
      font: props.font,
    });

    if ("button" in props) {
      const { button, ...rest } = props;
      passProps = rest;

      classes = buttonVariants({
        variant: props.variant,
        size: props.size,
      });
    } else {
      const linkProps = props as BaseLinkProps;
      classes = linkClasses({
        variant: linkProps.variant,
        size: linkProps.size,
      });
    }

    return (
      <NextLink
        ref={ref}
        {...passProps}
        className={cn(classes, textClasses, props.className)}
      />
    );
  },
);

Link.displayName = "Link";

import { Children, ReactElement, cloneElement } from "react";

import { cn } from "../utils";
import { ButtonProps } from "./button";

interface ButtonGroupProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  children: (ReactElement<ButtonProps> | undefined | null)[];
}

export const ButtonGroup = ({
  className,
  orientation = "horizontal",
  children,
}: ButtonGroupProps) => {
  const totalButtons = Children.count(children);
  const isHorizontal = orientation === "horizontal";
  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "flex",
        {
          "flex-col": isVertical,
          "w-fit": isVertical,
        },
        className,
      )}
    >
      {Children.map(children, (child, index) => {
        if (!child) return null;

        const isFirst = index === 0;
        const isLast = index === totalButtons - 1;

        return cloneElement(child, {
          className: cn(
            {
              "rounded-l-none": isHorizontal && !isFirst,
              "rounded-r-none": isHorizontal && !isLast,
              "border-l-0": isHorizontal && !isFirst,

              "rounded-t-none": isVertical && !isFirst,
              "rounded-b-none": isVertical && !isLast,
              "border-t-0": isVertical && !isFirst,
            },
            child.props.className,
          ),
        });
      })}
    </div>
  );
};

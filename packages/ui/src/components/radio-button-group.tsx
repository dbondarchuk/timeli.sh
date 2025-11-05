"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cva } from "class-variance-authority";
import React from "react";
import { useAttributeObserver } from "../hooks";
import { cn } from "../utils";
import { ButtonProps, ButtonSize, buttonVariants } from "./button";

const RadioButtonGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("flex gap-2 flex-wrap", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioButtonGroup.displayName = "RadioButtonGroup";

const buttonClasses = (size?: ButtonSize) =>
  cva("", {
    variants: {
      variant: {
        unchecked: buttonVariants({ variant: "secondary", size }),
        checked: buttonVariants({ variant: "default", size }),
      },
    },
  });

const RadioButtonGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  {
    children: React.ReactNode;
    size?: ButtonProps["size"];
  } & React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, size, ...props }, ref) => {
  const [current, setCurrent] = React.useState<HTMLButtonElement | null>();

  React.useImperativeHandle(ref, () => current!);

  const state = useAttributeObserver(current || null, "data-state");

  return (
    <RadioGroupPrimitive.Item
      ref={(node) => {
        setCurrent(node);
      }}
      className={cn(
        state === "checked"
          ? buttonClasses(size)({ variant: "checked" })
          : buttonClasses(size)({ variant: "unchecked" }),
        // "border data-[state=checked]:bg-background text-center rounded-md focus:outline-none 2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.RadioGroupIndicator className="relative">
        {/* <div className="relative">
          <div className="absolute -ml-2 -mt-[30px] ">
            <Icons.checkCircle className="text-primary" />
          </div>
        </div> */}
      </RadioGroupPrimitive.RadioGroupIndicator>

      {children}
    </RadioGroupPrimitive.Item>
  );
});
RadioButtonGroupItem.displayName = "RadioButtonGroupItem";

export { RadioButtonGroup, RadioButtonGroupItem };

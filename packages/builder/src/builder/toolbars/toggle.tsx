import { Leaves } from "@timelish/types";
import { Toggle, useOpenState } from "@timelish/ui";
import { destructAndReplace, resolveProperty } from "@timelish/utils";
import { ReactNode } from "react";
import { ConfigurationProps } from "../../documents/types";

export type ToolbarToggleProps<T> = ConfigurationProps<T> & {
  property: Leaves<T>;
  tooltip: string;
  icon: ReactNode;
};

export const ToolbarToggle = <T,>({
  data,
  setData,
  property,
  tooltip,
  icon: Icon,
}: ToolbarToggleProps<T>) => {
  const openState = useOpenState();
  const propValue = resolveProperty(data, property);

  return (
    <Toggle
      tooltip={tooltip}
      className="[&>svg]:size-4"
      pressed={!!propValue}
      onPressedChange={(value: boolean) => {
        setData(destructAndReplace(data, property, value) as unknown as any);
      }}
    >
      {Icon}
    </Toggle>
  );
};

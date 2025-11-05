import { Label, Switch } from "@timelish/ui";
import React from "react";

type Props = {
  label: string;
  defaultValue: boolean;
  onChange: (value: boolean) => void;
};

export const BooleanInput: React.FC<Props> = ({
  label,
  defaultValue,
  onChange,
}) => {
  const [value, setValue] = React.useState(defaultValue);
  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue, setValue]);

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex w-full">
        <Switch
          checked={value}
          onCheckedChange={(checked) => {
            setValue(checked);
            onChange(checked);
          }}
        />
      </div>
    </div>
  );
};

"use client";

import React from "react";

import { CaseSensitive } from "lucide-react";
import { NumberValueWithUnit } from "../style/zod";
import { RawNumberInputWithUnit } from "./base/raw-number-input-with-units";

type Props = {
  defaultValue: NumberValueWithUnit;
  onChange: (v: NumberValueWithUnit) => void;
  max?: number;
};

const pxOptions = [8, 9, 10, 12, 14, 16, 18, 24, 30, 36, 48, 64, 72, 96];
const remOptions = [1, 1.2, 1.3, 1.5, 2, 3, 4, 5, 6];
const otherOptions = [1, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100];

export const FontSizeInput: React.FC<Props> = ({ defaultValue, onChange }) => {
  return (
    <RawNumberInputWithUnit
      icon={<CaseSensitive size={16} />}
      defaultValue={defaultValue}
      onChange={onChange}
      step={{ px: 1, rem: 0.1 }}
      min={{ px: 4, rem: 0 }}
      max={{ px: 100, rem: 100 }}
      options={{ px: pxOptions, rem: remOptions, base: otherOptions }}
    />
  );
};

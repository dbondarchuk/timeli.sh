"use client";

import { useRef } from "react";
import { generateClassName } from "./class-name-generator";

export const useClassName = () => {
  const className = useRef(generateClassName());
  return className.current;
};

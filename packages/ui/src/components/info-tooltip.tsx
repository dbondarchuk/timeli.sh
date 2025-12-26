import { Info } from "lucide-react";
import React from "react";
import {
  TooltipResponsive,
  TooltipResponsiveContent,
  TooltipResponsiveTrigger,
} from "./tooltip-responsive";

export type InfoTooltipProps = {
  children: React.ReactNode;
};

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ children }) => {
  return (
    <TooltipResponsive>
      <TooltipResponsiveTrigger>
        <Info className="align-top ml-1 size-3 inline-block cursor-help" />
      </TooltipResponsiveTrigger>
      <TooltipResponsiveContent className="pt-2">
        {children}
      </TooltipResponsiveContent>
    </TooltipResponsive>
  );
};

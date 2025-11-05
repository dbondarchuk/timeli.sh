import { Info } from "lucide-react";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export type InfoTooltipProps = {
  children: React.ReactNode;
};

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ children }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="align-top ml-1" type="button">
          <Info className="w-3 h-3" />
        </TooltipTrigger>
        <TooltipContent className="pt-2">{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

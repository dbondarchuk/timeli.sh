"use client";

import { SortableContext } from "@dnd-kit/sortable";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  ScrollArea,
} from "@timelish/ui";
import { cva } from "class-variance-authority";
import { ChevronsUpDown, Plus } from "lucide-react";
import React from "react";

export type NonSortableProps = {
  title: React.ReactNode;
  ids: string[];
  onAdd: () => void;
  children: React.ReactNode | React.ReactNode[];
  disabled?: boolean;
  disabledAdd?: boolean;
  allCollapsed?: boolean;
  collapse?: () => void;
  className?: string;
};

export function NonSortable({
  children,
  title,
  ids,
  disabled,
  disabledAdd,
  allCollapsed,
  collapse,
  onAdd,
  className,
}: NonSortableProps) {
  const variants = cva(
    "h-fit max-h-[75vh] max-w-full bg-card flex flex-col flex-shrink-0 snap-center w-full",
  );

  return (
    <Card className={variants({ className })}>
      <CardHeader className="justify-between flex flex-row items-center border-b p-4 text-left font-semibold space-y-0">
        <div className="hidden md:block">&nbsp;</div>
        {title}
        <div className="flex flex-row gap-2 items-center">
          {collapse && (
            <Button
              type="button"
              disabled={disabled}
              variant="ghost"
              size="icon"
              onClick={collapse}
              aria-label={allCollapsed ? "Expand all" : "Collapse all"}
            >
              <ChevronsUpDown />
            </Button>
          )}
          <Button
            type="button"
            disabled={disabled || disabledAdd}
            variant="ghost"
            size="icon"
            onClick={onAdd}
            aria-label="Add a new item"
          >
            <Plus />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-hidden p-2">
        <ScrollArea className="h-full">
          <SortableContext items={ids}>{children}</SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

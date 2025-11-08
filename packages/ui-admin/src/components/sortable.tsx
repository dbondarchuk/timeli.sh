"use client";

import {
  DndContext,
  DragOverEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
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

export type SortableProps = {
  title: string;
  ids: string[];
  onSort: (activeId: string, overId: string) => void;
  onAdd: () => void;
  children: React.ReactNode | React.ReactNode[];
  disabled?: boolean;
  allCollapsed?: boolean;
  collapse?: () => void;
  className?: string;
};

export function Sortable({
  children,
  title,
  ids,
  disabled,
  allCollapsed,
  collapse,
  onSort,
  onAdd,
  className,
}: SortableProps) {
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const variants = cva(
    "h-fit max-h-[75vh] max-w-full bg-card flex flex-col snap-center w-full",
    {
      variants: {
        dragging: {
          default: "border-2 border-transparent",
          over: "ring-2 opacity-30",
          overlay: "ring-2 ring-primary",
        },
      },
    },
  );

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    onSort(activeId.toString(), overId.toString());
  }

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
              onClick={collapse}
              size="icon"
              aria-label={allCollapsed ? "Expand all" : "Collapse all"}
            >
              <ChevronsUpDown />
            </Button>
          )}
          <Button
            type="button"
            disabled={disabled}
            variant="ghost"
            onClick={onAdd}
            size="icon"
            aria-label="Add a new item"
          >
            <Plus />
          </Button>
        </div>
      </CardHeader>
      <DndContext sensors={sensors} onDragOver={onDragOver}>
        <CardContent className="overflow-x-hidden p-2">
          <ScrollArea className="h-full">
            <SortableContext items={ids}>{children}</SortableContext>
          </ScrollArea>
        </CardContent>
      </DndContext>
    </Card>
  );
}

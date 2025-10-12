"use client";

import { useI18n } from "@vivid/i18n";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vivid/ui";
import { Grid3X3 } from "lucide-react";
import React, { useState } from "react";

interface GridTemplateColumnsDialogProps {
  value: string;
  onChange: (value: string) => void;
  trigger: React.ReactNode;
}

type GridType =
  | "fixed"
  | "responsive"
  | "masonry"
  | "sidebar"
  | "hero"
  | "magazine"
  | "gallery"
  | "dashboard"
  | "custom";

export const GridTemplateColumnsDialog: React.FC<
  GridTemplateColumnsDialogProps
> = ({ value, onChange, trigger }) => {
  const [open, setOpen] = useState(false);
  const [gridType, setGridType] = useState<GridType>("responsive");
  const [columnCount, setColumnCount] = useState(3);
  const [minWidth, setMinWidth] = useState(250);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [heroHeight, setHeroHeight] = useState(400);
  const [customValue, setCustomValue] = useState(value);
  const t = useI18n("builder");

  const generateTemplate = () => {
    let template = "";

    switch (gridType) {
      case "fixed":
        template = `repeat(${columnCount}, 1fr)`;
        break;
      case "responsive":
        template = `repeat(auto-fit, minmax(${minWidth}px, 1fr))`;
        break;
      case "masonry":
        template = `repeat(auto-fill, minmax(${minWidth}px, 1fr))`;
        break;
      case "sidebar":
        template = `${sidebarWidth}px 1fr`;
        break;
      case "hero":
        template = `1fr`;
        break;
      case "magazine":
        template = `2fr 1fr 1fr`;
        break;
      case "gallery":
        template = `repeat(auto-fit, minmax(300px, 1fr))`;
        break;
      case "dashboard":
        template = `repeat(auto-fit, minmax(200px, 1fr))`;
        break;
      case "custom":
        template = customValue;
        break;
    }

    onChange(template);
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setCustomValue(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5" />
            {t("pageBuilder.styles.gridTemplateColumnsDialog.title")}
          </DialogTitle>
          <DialogDescription>
            {t("pageBuilder.styles.gridTemplateColumnsDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <RadioGroup
            value={gridType}
            onValueChange={(value) => setGridType(value as GridType)}
          >
            <div className="grid gap-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="responsive" id="responsive" />
                <Label htmlFor="responsive" className="flex-1">
                  {t("pageBuilder.styles.gridTemplateColumnsDialog.responsive")}
                  <div className="text-xs text-muted-foreground font-normal">
                    {t(
                      "pageBuilder.styles.gridTemplateColumnsDialog.responsiveDescription",
                    )}
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed" className="flex-1">
                  {t("pageBuilder.styles.gridTemplateColumnsDialog.fixed")}
                  <div className="text-xs text-muted-foreground font-normal">
                    {t(
                      "pageBuilder.styles.gridTemplateColumnsDialog.fixedDescription",
                    )}
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="masonry" id="masonry" />
                <Label htmlFor="masonry" className="flex-1">
                  {t("pageBuilder.styles.gridTemplateColumnsDialog.masonry")}
                  <div className="text-xs text-muted-foreground font-normal">
                    {t(
                      "pageBuilder.styles.gridTemplateColumnsDialog.masonryDescription",
                    )}
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sidebar" id="sidebar" />
                <Label htmlFor="sidebar" className="flex-1">
                  {t("pageBuilder.styles.gridTemplateColumnsDialog.sidebar")}
                  <div className="text-xs text-muted-foreground font-normal">
                    {t(
                      "pageBuilder.styles.gridTemplateColumnsDialog.sidebarDescription",
                    )}
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hero" id="hero" />
                <Label htmlFor="hero" className="flex-1">
                  {t("pageBuilder.styles.gridTemplateColumnsDialog.hero")}
                  <div className="text-xs text-muted-foreground font-normal">
                    {t(
                      "pageBuilder.styles.gridTemplateColumnsDialog.heroDescription",
                    )}
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="magazine" id="magazine" />
                <Label htmlFor="magazine" className="flex-1">
                  {t("pageBuilder.styles.gridTemplateColumnsDialog.magazine")}
                  <div className="text-xs text-muted-foreground font-normal">
                    {t(
                      "pageBuilder.styles.gridTemplateColumnsDialog.magazineDescription",
                    )}
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gallery" id="gallery" />
                <Label htmlFor="gallery" className="flex-1">
                  {t("pageBuilder.styles.gridTemplateColumnsDialog.gallery")}
                  <div className="text-xs text-muted-foreground font-normal">
                    {t(
                      "pageBuilder.styles.gridTemplateColumnsDialog.galleryDescription",
                    )}
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dashboard" id="dashboard" />
                <Label htmlFor="dashboard" className="flex-1">
                  {t("pageBuilder.styles.gridTemplateColumnsDialog.dashboard")}
                  <div className="text-xs text-muted-foreground font-normal">
                    {t(
                      "pageBuilder.styles.gridTemplateColumnsDialog.dashboardDescription",
                    )}
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="flex-1">
                  {t("pageBuilder.styles.gridTemplateColumnsDialog.custom")}
                  <div className="text-xs text-muted-foreground font-normal">
                    {t(
                      "pageBuilder.styles.gridTemplateColumnsDialog.customDescription",
                    )}
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>

          {gridType === "responsive" && (
            <div className="grid gap-2">
              <Label htmlFor="minWidth">
                {t("pageBuilder.styles.gridTemplateColumnsDialog.minWidth")}
              </Label>
              <Input
                id="minWidth"
                type="number"
                value={minWidth}
                onChange={(e) => setMinWidth(Number(e.target.value))}
                min={50}
                max={1000}
                step={10}
              />
            </div>
          )}

          {gridType === "fixed" && (
            <div className="grid gap-2">
              <Label htmlFor="columnCount">
                {t("pageBuilder.styles.gridTemplateColumnsDialog.columnCount")}
              </Label>
              <Select
                value={columnCount.toString()}
                onValueChange={(value) => setColumnCount(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}{" "}
                      {num === 1
                        ? t(
                            "pageBuilder.styles.gridTemplateColumnsDialog.column",
                          )
                        : t(
                            "pageBuilder.styles.gridTemplateColumnsDialog.columns",
                          )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {gridType === "masonry" && (
            <div className="grid gap-2">
              <Label htmlFor="minWidth">
                {t("pageBuilder.styles.gridTemplateColumnsDialog.minWidth")}
              </Label>
              <Input
                id="minWidth"
                type="number"
                value={minWidth}
                onChange={(e) => setMinWidth(Number(e.target.value))}
                min={50}
                max={1000}
                step={10}
              />
            </div>
          )}

          {gridType === "sidebar" && (
            <div className="grid gap-2">
              <Label htmlFor="sidebarWidth">
                {t("pageBuilder.styles.gridTemplateColumnsDialog.sidebarWidth")}
              </Label>
              <Input
                id="sidebarWidth"
                type="number"
                value={sidebarWidth}
                onChange={(e) => setSidebarWidth(Number(e.target.value))}
                min={100}
                max={500}
                step={10}
              />
            </div>
          )}

          {gridType === "custom" && (
            <div className="grid gap-2">
              <Label htmlFor="customValue">
                {t(
                  "pageBuilder.styles.gridTemplateColumnsDialog.customTemplate",
                )}
              </Label>
              <Input
                id="customValue"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="e.g., 1fr 2fr 1fr, repeat(3, 1fr), 200px 1fr"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label>
              {t("pageBuilder.styles.gridTemplateColumnsDialog.preview")}
            </Label>
            <div className="p-3 bg-muted rounded-md text-sm font-mono">
              {gridType === "responsive" &&
                `repeat(auto-fit, minmax(${minWidth}px, 1fr))`}
              {gridType === "fixed" && `repeat(${columnCount}, 1fr)`}
              {gridType === "masonry" &&
                `repeat(auto-fill, minmax(${minWidth}px, 1fr))`}
              {gridType === "sidebar" && `${sidebarWidth}px 1fr`}
              {gridType === "hero" && `1fr`}
              {gridType === "magazine" && `2fr 1fr 1fr`}
              {gridType === "gallery" && `repeat(auto-fit, minmax(300px, 1fr))`}
              {gridType === "dashboard" &&
                `repeat(auto-fit, minmax(200px, 1fr))`}
              {gridType === "custom" && customValue}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("pageBuilder.styles.gridTemplateColumnsDialog.cancel")}
          </Button>
          <Button onClick={generateTemplate}>
            {t("pageBuilder.styles.gridTemplateColumnsDialog.applyTemplate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

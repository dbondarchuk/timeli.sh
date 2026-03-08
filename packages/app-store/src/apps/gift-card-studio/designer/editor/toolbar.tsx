"use client";

import { useI18n } from "@timelish/i18n";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipResponsive,
  TooltipResponsiveContent,
  TooltipResponsiveTrigger,
} from "@timelish/ui";
import {
  AlertCircle,
  CheckCircle,
  Edit3,
  Eye,
  Redo,
  Undo,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  GiftCardStudioAdminKeys,
  GiftCardStudioAdminNamespace,
  giftCardStudioAdminNamespace,
} from "../../translations/types";
import { useEditorStore } from "../lib/store";
import { CanvasSetupDialog } from "./canvas-setup-dialog";

export function Toolbar() {
  const {
    zoom,
    setZoom,
    undo,
    redo,
    historyIndex,
    history,
    mode,
    setMode,
    design,
  } = useEditorStore();

  const t = useI18n<GiftCardStudioAdminNamespace, GiftCardStudioAdminKeys>(
    giftCardStudioAdminNamespace,
  );

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Validation logic
  const requiredFieldKeys = ["amount", "code"];
  const hasRequiredFields = () => {
    const textElements = design.elements.filter(
      (el) => el.type === "text",
    ) as any[];
    const fieldKeys = textElements.map((el) => el.fieldKey).filter(Boolean);
    return requiredFieldKeys.every((key) => fieldKeys.includes(key));
  };

  const validationMessages = () => {
    const messages: string[] = [];
    const textElements = design.elements.filter(
      (el) => el.type === "text",
    ) as any[];
    const fieldKeys = textElements.map((el) => el.fieldKey).filter(Boolean);

    requiredFieldKeys.forEach((key) => {
      if (!fieldKeys.includes(key)) {
        const label =
          key === "amount"
            ? t("designer.dynamicFields.amount")
            : t("designer.dynamicFields.code");
        messages.push(t("designer.toolbar.missingRequiredField", { label }));
      }
    });

    if (messages.length === 0) {
      messages.push(t("designer.toolbar.allRequiredPresent"));
    }

    return messages;
  };

  const isValid = hasRequiredFields();

  // const handleExportPDF = async () => {
  //   const canvasElement = document.querySelector("#gift-card-editor-canvas")
  //   if (!canvasElement) {
  //     toast.error("Canvas element not found")
  //     return
  //   }

  //   setIsExporting(true)
  //   toast.loading("Exporting PDF...")

  //   try {
  //     await exportToPDF(design, canvasElement as HTMLElement)
  //     toast.success("Your gift card PDF has been downloaded")
  //   } catch (error) {
  //     toast.error("There was an error exporting your PDF")
  //   } finally {
  //     setIsExporting(false)
  //   }
  // }

  // const handleExportPDFServer = async () => {
  //   setIsExporting(true)
  //   toast.loading("Rendering your design on the server...")
  //   try {
  //     // Collect sample values as fields so dynamic text is populated
  //     const fields: Record<string, string> = {}
  //     design.elements.forEach((el) => {
  //       if (el.type === "text" && (el as any).fieldKey && (el as any).sampleValue) {
  //         fields[(el as any).fieldKey] = (el as any).sampleValue
  //       }
  //     })
  //     await exportToPDFServer(design, fields)
  //     toast.success("Your gift card PDF has been downloaded")
  //   } catch (error) {
  //     toast.error(error instanceof Error ? error.message : "Server render failed")
  //   } finally {
  //     setIsExporting(false)
  //   }
  // }

  // const handleExportJSON = async () => {
  //   try {
  //     await exportDesignAsJSON(design)
  //     toast.success("Your design has been exported as JSON")
  //   } catch (error) {
  //     toast.error("There was an error saving your design")
  //   }
  // }

  // const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0]
  //   if (!file) return

  //   const importedDesign = await importDesignFromJSON(file)
  //   if (importedDesign) {
  //     useEditorStore.setState({ design: importedDesign })
  //     useEditorStore.getState().pushHistory()
  //     toast.success("Your design has been imported successfully")
  //   } else {
  //     toast.error("Could not load the design file")
  //   }

  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = ""
  //   }
  // }

  return (
    <div className="h-14 border-b border-border flex items-center justify-between px-4 gap-4 bg-background">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">
          {t("designs.form.design")}
        </h1>
        <CanvasSetupDialog />
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={
                isValid
                  ? "text-green-600 hover:text-green-700"
                  : "text-amber-600 hover:text-amber-700"
              }
            >
              {isValid ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">
                {t("designer.toolbar.validationTitle")}
              </h4>
              <div className="space-y-1">
                {validationMessages().map((message, index) => (
                  <p
                    key={index}
                    className={`text-sm ${isValid ? "text-green-600" : "text-amber-600"}`}
                  >
                    {message}
                  </p>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-border" />

        <TooltipResponsive>
          <TooltipResponsiveTrigger>
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={!canUndo}
              className="hover:bg-accent"
            >
              <Undo className="w-4 h-4" />
            </Button>
          </TooltipResponsiveTrigger>
          <TooltipResponsiveContent>
            {t("designer.toolbar.undo")}
          </TooltipResponsiveContent>
        </TooltipResponsive>
        <TooltipResponsive>
          <TooltipResponsiveTrigger>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={!canRedo}
              className="hover:bg-accent"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </TooltipResponsiveTrigger>
          <TooltipResponsiveContent>
            {t("designer.toolbar.redo")}
          </TooltipResponsiveContent>
        </TooltipResponsive>

        <div className="w-px h-6 bg-border mx-2" />

        <TooltipResponsive>
          <TooltipResponsiveTrigger>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(zoom - 0.1)}
              className="hover:bg-accent"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </TooltipResponsiveTrigger>
          <TooltipResponsiveContent>
            {t("designer.toolbar.zoomOut")}
          </TooltipResponsiveContent>
        </TooltipResponsive>
        <span className="text-sm text-foreground w-16 text-center font-mono">
          {Math.round(zoom * 100)}%
        </span>
        <TooltipResponsive>
          <TooltipResponsiveTrigger>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(zoom + 0.1)}
              className="hover:bg-accent"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </TooltipResponsiveTrigger>
          <TooltipResponsiveContent>
            {t("designer.toolbar.zoomIn")}
          </TooltipResponsiveContent>
        </TooltipResponsive>
        <div className="w-px h-6 bg-border mx-2" />

        <Button
          variant={mode === "edit" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMode("edit")}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          {t("designer.toolbar.edit")}
        </Button>
        <Button
          variant={mode === "preview" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMode("preview")}
        >
          <Eye className="w-4 h-4 mr-2" />
          {t("designer.toolbar.preview")}
        </Button>

        <div className="w-px h-6 bg-border mx-2" />

        {/* <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />

        <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
          <Upload className="w-4 h-4" />
          Import
        </Button> */}

        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-2" disabled={isExporting}>
              <Download className="w-4 h-4" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportPDFServer}>
              <Download className="w-4 h-4 mr-2" />
              Export as PDF (Server)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export as PDF (Client)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJSON}>
              <Download className="w-4 h-4 mr-2" />
              Save Design (JSON)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
    </div>
  );
}

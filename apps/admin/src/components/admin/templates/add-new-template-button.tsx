"use client";
import { useI18n } from "@vivid/i18n";
import { CommunicationChannel, communicationChannels } from "@vivid/types";
import {
  Button,
  Combobox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Link,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vivid/ui";
import { Plus } from "lucide-react";
import React from "react";
import { TemplateTemplates } from "./templates";

export const AddNewTemplateButton: React.FC = () => {
  const t = useI18n("admin");
  const [type, setType] = React.useState<CommunicationChannel>("email");
  const [template, setTemplate] = React.useState<string>("");

  const availableTemplates = [
    {
      label: t("templates.addNew.emptyTemplate"),
      value: "",
    },
    ...Object.entries(TemplateTemplates[type] || {}).map(
      ([name, { name: displayName }]) => ({
        label: displayName,
        value: name,
      }),
    ),
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">
          <Plus className="mr-2 h-4 w-4" />{" "}
          <span className="md:hidden">{t("templates.addNew.add")}</span>
          <span className="hidden md:inline">
            {t("templates.addNew.addNewTemplate")}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-96" overlayVariant="blur">
        <DialogHeader className="px-1">
          <DialogTitle>{t("templates.addNew.addNewTemplate")}</DialogTitle>
        </DialogHeader>
        <div className="w-full  px-1 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>{t("templates.addNew.type")}</Label>
            <div className="flex w-full">
              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value as CommunicationChannel);
                  setTemplate("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t("templates.addNew.selectTemplateType")}
                  />
                </SelectTrigger>
                <SelectContent side="bottom">
                  {communicationChannels.map((channel) => (
                    <SelectItem key={channel} value={channel}>
                      {t(`common.labels.channel.${channel}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("templates.addNew.template")}</Label>
            <div className="flex w-full">
              <Combobox
                values={availableTemplates}
                value={template}
                onItemSelect={setTemplate}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="px-1">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {t("templates.addNew.close")}
            </Button>
          </DialogClose>
          <Link
            button
            variant="default"
            aria-disabled={!!type}
            href={`/dashboard/templates/new/${type}${template ? `?template=${encodeURIComponent(template)}` : ""}`}
          >
            {t("templates.addNew.addNewTemplate")}
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

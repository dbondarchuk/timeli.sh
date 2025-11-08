import { AvailableApps } from "@timelish/app-store";
import { useI18n } from "@timelish/i18n";
import { CalendarSourceConfiguration } from "@timelish/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InfoTooltip,
} from "@timelish/ui";
import { AppSelector } from "@timelish/ui-admin";
import { Trash } from "lucide-react";
import React from "react";
import { UseFormReturn } from "react-hook-form";

export type CalendarSourceCardProps = {
  item: CalendarSourceConfiguration;
  name: string;
  form: UseFormReturn<any>;
  disabled?: boolean;
  excludeIds?: string[];
  remove: () => void;
  update: (newValue: CalendarSourceConfiguration) => void;
  clone: () => void;
};

export const CalendarSourceCard: React.FC<CalendarSourceCardProps> = ({
  item,
  name,
  form,
  disabled,
  excludeIds,
  remove,
  update,
  clone,
}) => {
  const t = useI18n("admin");
  const [appName, setAppName] = React.useState<string | undefined>();

  const appId = item.appId;
  const changeAppId = (value: typeof appId) => {
    const newValue = {
      ...form.getValues(name),
      appId: value,
    };
    update(newValue);
  };

  const appDisplayName = appName ? AvailableApps[appName].displayName : null;

  return (
    <div className="flex flex-row gap-2 px-2 py-4 bg-card border rounded w-full">
      <div className="grid grid-cols-1 gap-2 w-full relative">
        <FormField
          control={form.control}
          name={`${name}.appId`}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                {t("settings.appointments.form.cards.calendarSource.app")}{" "}
                <InfoTooltip>
                  {t(
                    "settings.appointments.form.cards.calendarSource.appTooltip",
                  )}
                </InfoTooltip>
              </FormLabel>

              <FormControl>
                <AppSelector
                  disabled={disabled}
                  className="w-full"
                  scope="calendar-read"
                  value={field.value}
                  onItemSelect={(value) => {
                    field.onChange(value);
                    changeAppId(value);
                  }}
                  setAppName={setAppName}
                  excludeIds={excludeIds}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex flex-row items-start">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={disabled}
              variant="ghost-destructive"
              size="icon"
              type="button"
              title={t(
                "settings.appointments.form.cards.calendarSource.remove",
              )}
            >
              <Trash />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t(
                  "settings.appointments.form.cards.calendarSource.deleteConfirmTitle",
                )}
              </AlertDialogTitle>
              <AlertDialogDescription>
                <p>
                  {t(
                    "settings.appointments.form.cards.calendarSource.deleteConfirmDescription",
                  )}
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t("settings.appointments.form.cards.calendarSource.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction asChild variant="destructive">
                <Button onClick={remove}>
                  {t("settings.appointments.form.cards.calendarSource.delete")}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

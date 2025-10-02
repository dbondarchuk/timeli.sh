"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@vivid/i18n";
import { BookingConfiguration, bookingConfigurationSchema } from "@vivid/types";
import {
  cn,
  Form,
  SaveButton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toastPromise,
} from "@vivid/ui";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { updateBookingConfiguration } from "./actions";
import { CalendarSourcesTab } from "./tabs/calendar-sources";
import { CancellationsAndReschedulesTab } from "./tabs/cancellations";
import { MainTab } from "./tabs/main";
import { OptionsTab } from "./tabs/options";
import { PaymentsTab } from "./tabs/payments";
import { SmartScheduleTab } from "./tabs/smart-schedule";

export const AppointmentsSettingsForm: React.FC<{
  values: BookingConfiguration;
}> = ({ values }) => {
  const t = useI18n("admin");
  const form = useForm<BookingConfiguration>({
    resolver: zodResolver(bookingConfigurationSchema),
    mode: "all",
    reValidateMode: "onChange",
    values,
  });

  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const onSubmit = async (data: BookingConfiguration) => {
    try {
      setLoading(true);
      await toastPromise(updateBookingConfiguration(data), {
        success: t("settings.appointments.form.toasts.changesSaved"),
        error: t("settings.appointments.form.toasts.requestError"),
      });
      router.refresh();
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const mainTabInvalid =
    form.getFieldState("maxWeeksInFuture").invalid ||
    form.getFieldState("slotStart").invalid ||
    form.getFieldState("breakDuration").invalid;

  const triggerValidation = () => {
    form.trigger();
    form.trigger("calendarSources");
    form.trigger("options");
    form.trigger("smartSchedule");
    form.trigger("payments");
    form.trigger("cancellationsAndReschedules");
  };

  React.useEffect(triggerValidation, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-8 relative flex flex-col gap-2 pb-4"
      >
        <Tabs
          onValueChange={triggerValidation}
          defaultValue={"main"}
          className="space-y-4"
          orientation="vertical"
        >
          <TabsList className="w-full flex-wrap h-auto">
            <TabsTrigger
              value="main"
              className={cn(mainTabInvalid ? "text-destructive" : "")}
            >
              {t("settings.appointments.form.tabs.main")}
            </TabsTrigger>
            <TabsTrigger
              value="calendarSources"
              className={cn(
                form.getFieldState("calendarSources").invalid
                  ? "text-destructive"
                  : "",
              )}
            >
              {t("settings.appointments.form.tabs.calendarSources")}
            </TabsTrigger>
            <TabsTrigger
              value="options"
              className={cn(
                form.getFieldState("options").invalid ? "text-destructive" : "",
              )}
            >
              {t("settings.appointments.form.tabs.options")}
            </TabsTrigger>
            <TabsTrigger
              value="smartSchedule"
              className={cn(
                form.getFieldState("smartSchedule").invalid
                  ? "text-destructive"
                  : "",
              )}
            >
              {t("settings.appointments.form.tabs.smartSchedule")}
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className={cn(
                form.getFieldState("payments").invalid
                  ? "text-destructive"
                  : "",
              )}
            >
              {t("settings.appointments.form.tabs.payments")}
            </TabsTrigger>
            <TabsTrigger
              value="cancellationsAndReschedules"
              className={cn(
                form.getFieldState("cancellationsAndReschedules").invalid
                  ? "text-destructive"
                  : "",
              )}
            >
              {t("settings.appointments.form.tabs.cancellationsAndReschedules")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="main">
            <MainTab form={form} />
          </TabsContent>
          <TabsContent value="calendarSources">
            <CalendarSourcesTab form={form} />
          </TabsContent>
          <TabsContent value="options">
            <OptionsTab form={form} />
          </TabsContent>
          <TabsContent value="smartSchedule">
            <SmartScheduleTab form={form} />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentsTab form={form} />
          </TabsContent>
          <TabsContent value="cancellationsAndReschedules">
            <CancellationsAndReschedulesTab form={form} />
          </TabsContent>
        </Tabs>
        <SaveButton form={form} disabled={loading} />
      </form>
    </Form>
  );
};

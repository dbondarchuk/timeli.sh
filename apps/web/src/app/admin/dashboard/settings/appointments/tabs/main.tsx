import { useI18n, useLocale } from "@vivid/i18n";
import {
  allowPromoCodeType,
  BookingConfiguration,
  customTimeSlotSchema,
  Time,
} from "@vivid/types";
import {
  AppSelector,
  BooleanSelect,
  Button,
  Combobox,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InfoTooltip,
  Input,
  InputGroup,
  InputGroupInput,
  InputGroupInputClasses,
  InputGroupSuffixClasses,
  InputSuffix,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SimpleTimePicker,
  TagInput,
  use12HourFormat,
} from "@vivid/ui";
import { formatTime, formatTimeLocale, parseTime } from "@vivid/utils";
import React from "react";
import { TabProps } from "./types";

const TimePickerTag = ({ onAdd }: { onAdd: (value: string) => void }) => {
  const t = useI18n("admin");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const uses12HourFormat = use12HourFormat();

  return (
    <div className="flex flex-col gap-2 p-3">
      <SimpleTimePicker
        use12HourFormat={uses12HourFormat}
        onChange={(d) => {
          setDate(d);
        }}
        value={date || new Date()}
      />
      <Button
        type="button"
        variant="default"
        className="w-full"
        onClick={() => {
          if (!date) return;
          onAdd(
            formatTime({
              hour: date.getHours(),
              minute: date.getMinutes(),
            } as Time),
          );
        }}
      >
        {t("settings.appointments.form.main.add")}
      </Button>
    </div>
  );
};

export const MainTab: React.FC<TabProps> = ({ form, disabled }) => {
  const t = useI18n("admin");
  const locale = useLocale();

  const stepLabels: Record<
    Exclude<BookingConfiguration["slotStart"], undefined>,
    string
  > = {
    "every-hour": t("settings.appointments.form.main.stepLabels.everyHour"),
    custom: t("settings.appointments.form.main.stepLabels.custom"),
    5: t("settings.appointments.form.main.stepLabels.five"),
    10: t("settings.appointments.form.main.stepLabels.ten"),
    15: t("settings.appointments.form.main.stepLabels.fifteen"),
    20: t("settings.appointments.form.main.stepLabels.twenty"),
    30: t("settings.appointments.form.main.stepLabels.thirty"),
  };

  const slotStart = form.watch("slotStart");

  return (
    <div className="gap-2 flex flex-col md:grid md:grid-cols-2 md:gap-4 w-full">
      <FormField
        control={form.control}
        name="scheduleAppId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("settings.appointments.form.main.scheduleProviderApp")}
              <InfoTooltip>
                {t.rich(
                  "settings.appointments.form.main.scheduleProviderAppTooltip",
                  {
                    br: () => <br />,
                    p: (chunks: any) => <p>{chunks}</p>,
                  },
                )}
              </InfoTooltip>
            </FormLabel>
            <FormControl>
              <AppSelector
                scope="schedule"
                allowClear
                disabled={disabled}
                value={field.value}
                onItemSelect={(value) => field.onChange(value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="availabilityProviderAppId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("settings.appointments.form.main.availabilityProviderApp")}
              <InfoTooltip>
                {t.rich(
                  "settings.appointments.form.main.availabilityProviderAppTooltip",
                  {
                    br: () => <br />,
                    p: (chunks: any) => <p>{chunks}</p>,
                  },
                )}
              </InfoTooltip>
            </FormLabel>
            <FormControl>
              <AppSelector
                scope="availability-provider"
                allowClear
                disabled={disabled}
                value={field.value}
                onItemSelect={(value) => field.onChange(value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="autoConfirm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("settings.appointments.form.main.autoConfirmAppointments")}{" "}
              <InfoTooltip>
                {t.rich("settings.appointments.form.main.autoConfirmTooltip", {
                  br: () => <br />,
                  p: (chunks: any) => <p>{chunks}</p>,
                  b: (chunks: any) => (
                    <span className="font-semibold">{chunks}</span>
                  ),
                })}
              </InfoTooltip>
            </FormLabel>
            <FormControl>
              <BooleanSelect
                value={field.value}
                onValueChange={field.onChange}
                className="w-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="allowPromoCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("settings.appointments.form.main.showPromoCodeField")}{" "}
              <InfoTooltip>
                {t("settings.appointments.form.main.showPromoCodeTooltip")}
              </InfoTooltip>
            </FormLabel>
            <FormControl>
              <Combobox
                value={field.value}
                onItemSelect={field.onChange}
                className="w-full"
                values={allowPromoCodeType.map((type) => ({
                  value: type,
                  label: t(`common.labels.allowPromoCodeType.${type}`),
                }))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="maxWeeksInFuture"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("settings.appointments.form.main.maxWeeksInFuture")}
              <InfoTooltip>
                {t.rich(
                  "settings.appointments.form.main.maxWeeksInFutureTooltip",
                  {
                    br: () => <br />,
                    p: (chunks: any) => <p>{chunks}</p>,
                    b: (chunks: any) => (
                      <span className="font-semibold">{chunks}</span>
                    ),
                  },
                )}
              </InfoTooltip>
            </FormLabel>
            <FormControl>
              <InputGroup>
                <InputGroupInput>
                  <Input
                    disabled={disabled}
                    placeholder="4"
                    type="number"
                    className={InputGroupInputClasses()}
                    {...field}
                  />
                </InputGroupInput>
                <InputSuffix className={InputGroupSuffixClasses()}>
                  {t("settings.appointments.form.main.weeks")}
                </InputSuffix>
              </InputGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="minHoursBeforeBooking"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("settings.appointments.form.main.minHoursBeforeBooking")}
              <InfoTooltip>
                {t.rich(
                  "settings.appointments.form.main.minHoursBeforeBookingTooltip",
                  {
                    br: () => <br />,
                    p: (chunks: any) => <p>{chunks}</p>,
                    b: (chunks: any) => (
                      <span className="font-semibold">{chunks}</span>
                    ),
                  },
                )}
              </InfoTooltip>
            </FormLabel>
            <FormControl>
              <InputGroup>
                <InputGroupInput>
                  <Input
                    disabled={disabled}
                    placeholder="24"
                    type="number"
                    className={InputGroupInputClasses()}
                    {...field}
                  />
                </InputGroupInput>
                <InputSuffix className={InputGroupSuffixClasses()}>
                  {t("settings.appointments.form.main.hours")}
                </InputSuffix>
              </InputGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="breakDuration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("settings.appointments.form.main.minBreakTime")}
              <InfoTooltip>
                {t.rich("settings.appointments.form.main.minBreakTimeTooltip", {
                  br: () => <br />,
                  p: (chunks: any) => <p>{chunks}</p>,
                  b: (chunks: any) => (
                    <span className="font-semibold">{chunks}</span>
                  ),
                })}
              </InfoTooltip>
            </FormLabel>
            <FormControl>
              <InputGroup>
                <InputGroupInput>
                  <Input
                    disabled={disabled}
                    placeholder="0"
                    type="number"
                    className={InputGroupInputClasses()}
                    {...field}
                  />
                </InputGroupInput>
                <InputSuffix className={InputGroupSuffixClasses()}>
                  {t("settings.appointments.form.main.minutes")}
                </InputSuffix>
              </InputGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="slotStart"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("settings.appointments.form.main.allowedSlotStartTimes")}
              <InfoTooltip>
                {t(
                  "settings.appointments.form.main.allowedSlotStartTimesTooltip",
                )}
              </InfoTooltip>
            </FormLabel>
            <FormControl>
              <Select
                value={
                  typeof field.value === "number"
                    ? `${field.value}`
                    : field.value
                }
                onValueChange={(value) => {
                  const val = parseInt(value);
                  field.onChange(isNaN(val) ? value : val);
                  field.onBlur();
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t(
                      "settings.appointments.form.main.selectStep",
                    )}
                  />
                </SelectTrigger>
                <SelectContent side="bottom">
                  {Object.entries(stepLabels).map(([step, label]) => (
                    <SelectItem key={step} value={step}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {slotStart === "custom" && (
        <FormField
          control={form.control}
          name="customSlotTimes"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>
                {t("settings.appointments.form.main.customTimeSlots")}
                <InfoTooltip>
                  {t("settings.appointments.form.main.customTimeSlotsTooltip")}
                </InfoTooltip>
              </FormLabel>
              <FormControl>
                <TagInput
                  {...field}
                  readOnly
                  placeholder={t(
                    "settings.appointments.form.main.customTimeSlotsPlaceholder",
                  )}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    field.onBlur();
                  }}
                  tagValidator={customTimeSlotSchema}
                  tagDisplayTransform={(time) =>
                    formatTimeLocale(parseTime(time), locale)
                  }
                  addItemTemplate={TimePickerTag}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { adminApi } from "@timelish/api-sdk";
import { useI18n } from "@timelish/i18n";
import {
  DatabaseId,
  discountTypes,
  DiscountUpdateModel,
  getDiscountSchemaWithUniqueCheck,
} from "@timelish/types";
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
  BooleanSelect,
  Button,
  cn,
  Combobox,
  DateTimeInput,
  Form,
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
  Label,
  toastPromise,
  use12HourFormat,
  useDebounceCacheFn,
} from "@timelish/ui";
import {
  AddonSelector,
  NonSortable,
  OptionSelector,
  SaveButton,
} from "@timelish/ui-admin";
import { PlusCircle, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";
import * as z from "zod";

const DiscountLimitCard: React.FC<{
  disabled?: boolean;
  index: number;
  form: UseFormReturn<DiscountUpdateModel>;
  limit: NonNullable<DiscountUpdateModel["limitTo"]>[number];
  remove: () => void;
}> = ({ limit, form, index, disabled, remove }) => {
  const t = useI18n("admin");
  const options = useFieldArray({
    control: form.control,
    name: `limitTo.${index}.options`,
  });

  const addons = useFieldArray({
    control: form.control,
    name: `limitTo.${index}.addons`,
  });

  return (
    <div className="flex flex-col gap-4 md:items-center md:grid md:grid-cols-[minmax(0,_1fr),50px,minmax(0,_1fr),50px] bg-card px-2 py-4 border rounded">
      <div className="flex flex-col gap-4">
        <Label>{t("services.discounts.form.optionsLabel")}</Label>
        {(options.fields || []).map((option, optionsIndex) => (
          <FormField
            key={optionsIndex}
            control={form.control}
            name={`limitTo.${index}.options.${optionsIndex}`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputGroup>
                    <OptionSelector
                      className={cn(
                        InputGroupInputClasses(),
                        "[&>button]:rounded-r-none [&>button]:border-r-0  w-full flex-1",
                      )}
                      onItemSelect={(id) => {
                        field.onChange({ id });
                        field.onBlur();
                      }}
                      value={field.value?.id}
                      disabled={disabled}
                    />
                    <InputSuffix>
                      <Button
                        variant="ghost-destructive"
                        size="icon"
                        className={cn(InputGroupSuffixClasses(), "px-2")}
                        onClick={() => options.remove(optionsIndex)}
                      >
                        <Trash />
                      </Button>
                    </InputSuffix>
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        {!options.fields?.length && (
          <div>{t("services.discounts.form.anyOption")}</div>
        )}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => options.append({ id: null as any })}
        >
          <PlusCircle /> {t("services.discounts.form.addNew")}
        </Button>
      </div>
      <Label>{t("services.discounts.form.andLabel")}</Label>
      <div className="flex flex-col gap-4">
        <Label>{t("services.discounts.form.addonsLabel")}</Label>
        {(addons.fields || []).map((addon, addonsIndex) => (
          <FormField
            key={addonsIndex}
            control={form.control}
            name={`limitTo.${index}.addons.${addonsIndex}`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex flex-row gap-2">
                    <InputGroup className="w-full">
                      <AddonSelector
                        multi
                        // className={cn(
                        //   InputGroupInputClasses(),
                        //   "[&>button]:rounded-r-none [&>button]:border-r-0  w-full flex-1"
                        // )}
                        onItemSelect={(ids) => {
                          field.onChange({ ids: ids.map((id) => ({ id })) });
                          field.onBlur();
                        }}
                        value={field.value?.ids?.map((v) => v.id) ?? []}
                        disabled={disabled}
                        className={cn(
                          InputGroupInputClasses(),
                          "[&>button]:rounded-r-none [&>button]:border-r-0  w-full flex-1",
                        )}
                      />
                      <InputSuffix>
                        <Button
                          variant="ghost-destructive"
                          size="icon"
                          onClick={() => addons.remove(addonsIndex)}
                          className={cn(InputGroupSuffixClasses(), "px-2")}
                        >
                          <Trash />
                        </Button>
                      </InputSuffix>
                    </InputGroup>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        {!addons.fields?.length && (
          <div>{t("services.discounts.form.anyAddon")}</div>
        )}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => addons.append({ ids: [] })}
        >
          <PlusCircle /> {t("services.discounts.form.addNew")}
        </Button>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            disabled={disabled}
            variant="ghost-destructive"
            size="icon"
            className="self-start"
            type="button"
            title={t("services.discounts.form.removeLimit")}
          >
            <Trash />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("services.discounts.form.removeLimitTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <p>{t("services.discounts.form.removeLimitDescription")}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("services.discounts.form.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction asChild variant="destructive">
              <Button onClick={remove}>
                {t("services.discounts.form.delete")}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const DiscountForm: React.FC<{
  initialData?: DiscountUpdateModel & Partial<DatabaseId>;
}> = ({ initialData }) => {
  const t = useI18n();
  const timeFormat = t("ui.timePicker.format");
  const uses12HourFormat = use12HourFormat();

  const cachedDiscountNameAndCodeCheck = useDebounceCacheFn(
    adminApi.discounts.checkDiscountNameAndCode,
    300,
  );

  const formSchema = getDiscountSchemaWithUniqueCheck(
    (name, codes) =>
      cachedDiscountNameAndCodeCheck(
        name,
        codes?.filter((code) => !!code) ?? [],
        initialData?._id,
      ),
    "services.discounts.nameUnique",
    "services.discounts.codeUnique",
  );

  type FormValues = z.infer<typeof formSchema>;

  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: initialData || {
      type: "percentage",
      enabled: true,
      codes: [],
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);

      const fn = async () => {
        if (!initialData?._id) {
          const { _id } = await adminApi.discounts.createDiscount(data);
          router.push(`/dashboard/services/discounts/${_id}`);
        } else {
          await adminApi.discounts.updateDiscount(initialData._id, data);

          router.refresh();
        }
      };

      await toastPromise(fn(), {
        success: t("admin.services.discounts.form.toasts.changesSaved"),
        error: t("admin.services.discounts.form.toasts.requestError"),
      });
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const limitTo = useFieldArray({
    control: form.control,
    name: "limitTo",
  });

  const [discountType, codes] = form.watch(["type", "codes"]);

  const onAddCode = () => {
    if (codes && codes.length >= 10) return;
    form.setValue("codes", [...(codes ?? []), ""]);
    form.trigger("codes");
  };

  const onCodeRemove = (index: number) => {
    const newValue = [...codes];
    newValue.splice(index, 1);
    form.setValue("codes", newValue);

    form.trigger("codes");
  };

  const codesState = form.getFieldState("codes");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("admin.services.discounts.form.name")}{" "}
                    <InfoTooltip>
                      {t("admin.services.discounts.form.nameTooltip")}
                    </InfoTooltip>
                  </FormLabel>

                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder={t(
                        "admin.services.discounts.form.namePlaceholder",
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("admin.services.discounts.form.status")}
                  </FormLabel>
                  <FormControl>
                    <BooleanSelect
                      className="w-full"
                      trueLabel={t("admin.services.discounts.form.active")}
                      falseLabel={t("admin.services.discounts.form.disabled")}
                      value={field.value}
                      onValueChange={(item) => {
                        field.onChange(item);
                        field.onBlur();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("admin.services.discounts.form.type")}{" "}
                    <InfoTooltip>
                      {t("admin.services.discounts.form.typeTooltip")}
                    </InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      disabled={loading}
                      className="flex w-full font-normal text-base"
                      values={discountTypes.map((type) => ({
                        value: type,
                        label: t(`admin.common.labels.discountType.${type}`),
                      }))}
                      searchLabel={t(
                        "admin.services.discounts.form.typePlaceholder",
                      )}
                      value={field.value}
                      onItemSelect={(item) => {
                        field.onChange(item);
                        field.onBlur();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("admin.services.discounts.form.value")}
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput>
                        {discountType === "amount" && (
                          <InputSuffix
                            className={InputGroupSuffixClasses({
                              variant: "prefix",
                            })}
                          >
                            $
                          </InputSuffix>
                        )}
                        <Input
                          disabled={loading}
                          placeholder="15"
                          type="number"
                          className={InputGroupInputClasses({
                            variant:
                              discountType === "percentage"
                                ? "suffix"
                                : "prefix",
                          })}
                          {...field}
                        />
                      </InputGroupInput>
                      {discountType === "percentage" && (
                        <InputSuffix
                          className={InputGroupSuffixClasses({
                            variant: "suffix",
                          })}
                        >
                          %
                        </InputSuffix>
                      )}
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("admin.services.discounts.form.startDate")}{" "}
                    <InfoTooltip>
                      <p>
                        {t("admin.services.discounts.form.startDateTooltip")}
                      </p>
                      <p>{t("admin.common.optional")}</p>
                    </InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <DateTimeInput
                      disabled={loading}
                      clearable
                      format={timeFormat}
                      use12HourFormat={uses12HourFormat}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("admin.services.discounts.form.endDate")}{" "}
                    <InfoTooltip>
                      <p>{t("admin.services.discounts.form.endDateTooltip")}</p>
                      <p>{t("admin.common.optional")}</p>
                    </InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <DateTimeInput
                      disabled={loading}
                      clearable
                      format={timeFormat}
                      use12HourFormat={uses12HourFormat}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appointmentStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("admin.services.discounts.form.appointmentStartDate")}
                    <InfoTooltip>
                      <p>
                        {t(
                          "admin.services.discounts.form.appointmentStartDateTooltip",
                        )}
                      </p>
                      <p>{t("admin.common.optional")}</p>
                    </InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <DateTimeInput
                      disabled={loading}
                      clearable
                      format={timeFormat}
                      use12HourFormat={uses12HourFormat}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appointmentEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("admin.services.discounts.form.appointmentEndDate")}{" "}
                    <InfoTooltip>
                      <p>
                        {t(
                          "admin.services.discounts.form.appointmentEndDateTooltip",
                        )}
                      </p>
                      <p>{t("admin.common.optional")}</p>
                    </InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <DateTimeInput
                      disabled={loading}
                      clearable
                      format={timeFormat}
                      use12HourFormat={uses12HourFormat}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxUsage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("admin.services.discounts.form.maxUsage")}{" "}
                    <InfoTooltip>
                      <p>
                        {t("admin.services.discounts.form.maxUsageTooltip")}
                      </p>
                      <p>{t("admin.common.optional")}</p>
                    </InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="3"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxUsagePerCustomer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("admin.services.discounts.form.maxUsagePerCustomer")}{" "}
                    <InfoTooltip>
                      <p>
                        {t(
                          "admin.services.discounts.form.maxUsagePerCustomerTooltip",
                        )}
                      </p>
                      <p>{t("admin.common.optional")}</p>
                    </InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="3"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="codes"
            render={(codesField) => (
              <NonSortable
                title={
                  <span
                    className={cn(codesState.invalid && "text-destructive")}
                  >
                    {t("admin.services.discounts.form.codes")}
                  </span>
                }
                ids={codes || []}
                onAdd={() => onAddCode()}
                disabled={loading}
                disabledAdd={codes && codes.length >= 10}
              >
                <div className="flex flex-col px-2 py-2 gap-4">
                  {(codes || []).map((code, index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={`codes.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputGroup>
                              <Input
                                disabled={loading}
                                placeholder="SALE15"
                                className={cn(
                                  InputGroupInputClasses(),
                                  "flex-1",
                                )}
                                {...field}
                              />
                              <InputSuffix>
                                <Button
                                  variant="ghost-destructive"
                                  size="icon"
                                  className={cn(
                                    InputGroupSuffixClasses(),
                                    "px-2",
                                  )}
                                  onClick={() => onCodeRemove(index)}
                                >
                                  <Trash />
                                </Button>
                              </InputSuffix>
                            </InputGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  <FormMessage />
                </div>
              </NonSortable>
            )}
          />

          <NonSortable
            title={t("admin.services.discounts.form.limitTo")}
            ids={limitTo.fields.map((f) => f.id)}
            onAdd={() => limitTo.append({})}
            disabled={loading}
          >
            <div className="flex flex-col gap-4">
              {limitTo.fields.map((limit, index) => (
                <DiscountLimitCard
                  key={index}
                  form={form}
                  index={index}
                  limit={limit}
                  disabled={loading}
                  remove={() => limitTo.remove(index)}
                />
              ))}
              {!limitTo.fields?.length && (
                <div className="flex flex-col gap-4 px-2 py-4 border rounded bg-card">
                  {t("admin.services.discounts.form.anyOptionOrAddon")}
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                {t("admin.services.discounts.form.limitToDescription")}
              </div>
            </div>
          </NonSortable>
        </div>
        <SaveButton form={form} />
      </form>
    </Form>
  );
};

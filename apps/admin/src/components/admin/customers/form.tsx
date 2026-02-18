"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { adminApi } from "@timelish/api-sdk";
import { useI18n } from "@timelish/i18n";
import {
  CustomerUpdateModel,
  DatabaseId,
  getCustomerSchemaWithUniqueCheck,
  isPaymentRequiredForCustomerTypes,
} from "@timelish/types";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
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
  PhoneInput,
  Textarea,
  toastPromise,
  useDebounceCacheFn,
} from "@timelish/ui";
import { AssetSelectorDialog, SaveButton } from "@timelish/ui-admin";
import { PlusCircle, Trash } from "lucide-react";
// import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

export const CustomerForm: React.FC<{
  initialData?: CustomerUpdateModel & Partial<DatabaseId>;
}> = ({ initialData }) => {
  const t = useI18n("admin");

  const customerUniqueCheck = useDebounceCacheFn(
    adminApi.customers.checkCustomerUniqueEmailAndPhone,
    300,
  );

  const formSchema = getCustomerSchemaWithUniqueCheck(
    (emails, phones) => customerUniqueCheck(emails, phones, initialData?._id),
    "customers.emailAlreadyExists",
    "customers.phoneAlreadyExists",
  );

  type FormValues = z.infer<typeof formSchema>;

  const [loading, setLoading] = React.useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = React.useState(false);

  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: initialData || {
      knownNames: [],
      knownEmails: [],
      knownPhones: [],
      requireDeposit: "inherit",
    },
  });

  const [knownNames, knownEmails, knownPhones] = form.watch([
    "knownNames",
    "knownEmails",
    "knownPhones",
  ]);

  const name = form.watch("name");

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);

      const fn = async () => {
        if (!initialData?._id) {
          const _id = await adminApi.customers.createCustomer(data);
          router.push(`/dashboard/customers/${_id}`);
        } else {
          await adminApi.customers.updateCustomer(initialData._id, data);

          router.refresh();
        }
      };

      await toastPromise(fn(), {
        success: t("customers.toasts.changesSaved"),
        error: t("common.toasts.error"),
      });
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onAddPhone = () => {
    form.setValue("knownPhones", [...knownPhones, ""]);
  };

  const onAddEmail = () => {
    form.setValue("knownEmails", [...knownEmails, ""]);
  };

  const onAddName = () => {
    form.setValue("knownNames", [...knownNames, ""]);
  };

  const onPhoneRemove = (index: number) => {
    const newValue = [...knownPhones];
    newValue.splice(index, 1);
    form.setValue("knownPhones", newValue);

    form.trigger("knownPhones");
  };

  const onEmailRemove = (index: number) => {
    const newValue = [...knownEmails];
    newValue.splice(index, 1);
    form.setValue("knownEmails", newValue);

    form.trigger("knownEmails");
  };

  const onNameRemove = (index: number) => {
    const newValue = [...knownNames];
    newValue.splice(index, 1);
    form.setValue("knownNames", newValue);

    form.trigger("knownNames");
  };

  const requireDeposit = form.watch("requireDeposit");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-8 pb-4"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("customers.form.customerPhoto")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <div className="flex flex-col gap-4 justify-between">
                      <div className="w-full relative justify-center flex flex-row">
                        <img
                          src={field.value ?? "/unknown-person.png"}
                          alt={t("customers.form.customerPhotoAlt")}
                          height={200}
                          width={200}
                        />
                      </div>
                      {initialData?._id && (
                        <div className="w-full">
                          <AssetSelectorDialog
                            accept={["image/*"]}
                            isOpen={avatarDialogOpen}
                            addTo={{
                              customerId: initialData._id,
                              description: `${name} - Customer Photo`,
                            }}
                            close={() => setAvatarDialogOpen(false)}
                            onSelected={(asset) =>
                              field.onChange(`/assets/${asset.filename}`)
                            }
                          />
                          <Button
                            className="w-full"
                            variant="secondary"
                            onClick={() => setAvatarDialogOpen(true)}
                          >
                            {t("customers.form.changePhoto")}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("customers.form.personalInformation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("customers.form.name")}</FormLabel>

                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder={t("customers.form.namePlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("customers.form.email")}</FormLabel>

                      <FormControl>
                        <Input
                          type="email"
                          disabled={loading}
                          placeholder={t("customers.form.emailPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("customers.form.phone")}</FormLabel>

                      <FormControl>
                        <PhoneInput
                          label={t("customers.form.phone")}
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("customers.form.dateOfBirth")}</FormLabel>

                      <FormControl>
                        <DateTimeInput
                          disabled={loading}
                          clearable
                          format="MM/dd/yyyy"
                          hideTime
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dontAllowBookings"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row items-center gap-2">
                        <Checkbox
                          id="dontAllowBookings"
                          disabled={loading}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FormLabel
                          htmlFor="dontAllowBookings"
                          className="cursor-pointer"
                        >
                          {t("customers.form.dontAllowAppointments")}{" "}
                          <InfoTooltip>
                            {t("customers.form.dontAllowAppointmentsTooltip")}
                          </InfoTooltip>
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requireDeposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("customers.form.requireDeposit")}{" "}
                        <InfoTooltip>
                          {t("customers.form.requireDepositTooltip")}
                        </InfoTooltip>
                      </FormLabel>
                      <FormControl>
                        <Combobox
                          disabled={loading}
                          className="flex w-full font-normal text-base"
                          values={isPaymentRequiredForCustomerTypes.map(
                            (value) => ({
                              value,
                              label: t(`customers.form.${value}`),
                            }),
                          )}
                          searchLabel={t("customers.form.selectOption")}
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
                {requireDeposit === "always" && (
                  <>
                    <FormField
                      control={form.control}
                      name="depositPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("customers.form.depositAmount")}{" "}
                            <InfoTooltip>
                              <p>{t("customers.form.depositAmountTooltip")}</p>
                            </InfoTooltip>
                          </FormLabel>
                          <FormControl>
                            <InputGroup>
                              <InputGroupInput>
                                <Input
                                  disabled={loading}
                                  placeholder="20"
                                  type="number"
                                  className={InputGroupInputClasses()}
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    form.trigger("requireDeposit");
                                  }}
                                />
                              </InputGroupInput>
                              <InputSuffix
                                className={InputGroupSuffixClasses()}
                              >
                                %
                              </InputSuffix>
                            </InputGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("customers.form.additionalInformation")}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 md:grid md:grid-cols-3">
                <div className="flex flex-col gap-4">
                  <Label>
                    {t("customers.form.knownNames")}{" "}
                    <InfoTooltip>
                      {t("customers.form.knownNamesTooltip")}
                    </InfoTooltip>
                  </Label>
                  {(knownNames || []).map((name, index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={`knownNames.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputGroup>
                              <Input
                                disabled={loading}
                                placeholder={t(
                                  "customers.form.namePlaceholder",
                                )}
                                className={cn(
                                  InputGroupInputClasses(),
                                  "flex-1",
                                )}
                                {...field}
                              />
                              <InputSuffix>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className={cn(
                                    InputGroupSuffixClasses(),
                                    "px-2",
                                  )}
                                  onClick={() => onNameRemove(index)}
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
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={onAddName}
                  >
                    <PlusCircle /> {t("customers.form.addName")}
                  </Button>
                </div>
                <div className="flex flex-col gap-4">
                  <Label>
                    {t("customers.form.knownEmails")}
                    <InfoTooltip>
                      {t("customers.form.knownEmailsTooltip")}
                    </InfoTooltip>
                  </Label>
                  {(knownEmails || []).map((email, index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={`knownEmails.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputGroup>
                              <Input
                                type="email"
                                disabled={loading}
                                placeholder={t(
                                  "customers.form.emailPlaceholder",
                                )}
                                className={cn(
                                  InputGroupInputClasses(),
                                  "flex-1",
                                )}
                                {...field}
                              />
                              <InputSuffix>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className={cn(
                                    InputGroupSuffixClasses(),
                                    "px-2",
                                  )}
                                  onClick={() => onEmailRemove(index)}
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
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={onAddEmail}
                  >
                    <PlusCircle /> {t("customers.form.addEmail")}
                  </Button>
                </div>
                <div className="flex flex-col gap-4">
                  <Label>
                    {t("customers.form.knownPhones")}{" "}
                    <InfoTooltip>
                      {t("customers.form.knownPhonesTooltip")}
                    </InfoTooltip>
                  </Label>
                  {(knownPhones || []).map((phone, index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={`knownPhones.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputGroup>
                              <PhoneInput
                                label={t("customers.form.phone")}
                                disabled={loading}
                                className={cn(
                                  InputGroupInputClasses(),
                                  "flex-1",
                                )}
                                {...field}
                              />
                              <InputSuffix>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className={cn(
                                    InputGroupSuffixClasses(),
                                    "px-2",
                                  )}
                                  onClick={() => onPhoneRemove(index)}
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
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={onAddPhone}
                  >
                    <PlusCircle /> {t("customers.form.addPhone")}
                  </Button>
                </div>
              </div>
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("customers.form.notes")}</FormLabel>

                    <FormControl>
                      <Textarea
                        autoResize
                        disabled={loading}
                        placeholder={t("customers.form.notesPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
        <SaveButton form={form} />
      </form>
    </Form>
  );
};

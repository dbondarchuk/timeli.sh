"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@vivid/i18n";
import {
  inPersonPaymentMethod,
  InStorePaymentUpdateModel,
  inStorePaymentUpdateModelSchema,
  Payment,
  paymentType,
} from "@vivid/types";
import {
  Button,
  DateTimePicker,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
  Spinner,
  Textarea,
  toastPromise,
  use12HourFormat,
  useTimeZone,
} from "@vivid/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addAppointmentPayment, updateAppointmentPayment } from "./actions";

type AddUpdatePaymentDialogProps = {
  onSuccess?: (payment: Payment) => void;
  children: React.ReactNode;
} & (
  | { appointmentId: string }
  | {
      paymentId: string;
      payment: InStorePaymentUpdateModel;
    }
);

export const AddUpdatePaymentDialog = ({
  onSuccess,
  children: trigger,
  ...props
}: AddUpdatePaymentDialogProps) => {
  const t = useI18n("admin");
  const router = useRouter();

  const timeZone = useTimeZone();
  const uses12HourFormat = use12HourFormat();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const defaultValues: z.infer<typeof inStorePaymentUpdateModelSchema> =
    "appointmentId" in props
      ? {
          appointmentId: props.appointmentId,
          amount: 0,
          description: "",
          paidAt: new Date(),
          method: "cash",
          type: "payment",
        }
      : {
          appointmentId: props.payment.appointmentId,
          amount: props.payment.amount,
          description: props.payment.description,
          paidAt: props.payment.paidAt,
          method: props.payment.method,
          type: props.payment.type,
        };

  const onDialogOpenChange = (open: boolean) => {
    if (!open && loading) {
      return;
    }

    if (open) {
      form.reset(defaultValues);
    }

    setOpen(open);
  };

  const isEdit = "paymentId" in props;

  const form = useForm<z.infer<typeof inStorePaymentUpdateModelSchema>>({
    resolver: zodResolver(inStorePaymentUpdateModelSchema),
    defaultValues,
  });

  const onSubmit = async (
    data: z.infer<typeof inStorePaymentUpdateModelSchema>,
  ) => {
    try {
      setLoading(true);
      const result = await toastPromise(
        isEdit
          ? updateAppointmentPayment(props.paymentId, data)
          : addAppointmentPayment(props.appointmentId, data),
        {
          success: t("common.toasts.saved"),
          error: t("common.toasts.error"),
        },
      );

      setOpen(false);
      router.refresh();

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onDialogOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t("payment.addUpdatePayment.updatePayment")
              : t("payment.addUpdatePayment.addPayment")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("payment.addUpdatePayment.updatePaymentDescription")
              : t("payment.addUpdatePayment.addPaymentDescription")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="w-full flex flex-col gap-2 relative">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("payment.addUpdatePayment.form.amount")}
                    </FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputSuffix
                          className={InputGroupSuffixClasses({
                            variant: "prefix",
                          })}
                        >
                          $
                        </InputSuffix>
                        <InputGroupInput>
                          <Input
                            {...field}
                            disabled={loading}
                            type="number"
                            className={InputGroupInputClasses({
                              variant: "prefix",
                            })}
                          />
                        </InputGroupInput>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("payment.addUpdatePayment.form.method.label")}
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          field.onBlur();
                        }}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "payment.addUpdatePayment.form.method.label",
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {inPersonPaymentMethod.map((type) => (
                            <SelectItem value={type} key={type}>
                              {t(
                                `payment.addUpdatePayment.form.method.${type}`,
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      {t("payment.addUpdatePayment.form.type.label")}
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          field.onBlur();
                        }}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "payment.addUpdatePayment.form.type.label",
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentType.map((type) => (
                            <SelectItem value={type} key={type}>
                              {t(`payment.types.${type}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paidAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("payment.addUpdatePayment.form.paidAt")}
                    </FormLabel>
                    <FormControl>
                      <DateTimePicker
                        use12HourFormat={uses12HourFormat}
                        disabled={loading}
                        // min={new Date()}
                        timeZone={timeZone}
                        {...field}
                        className="flex w-full"
                        minutesDivisibleBy={5}
                        commitOnChange
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("payment.addUpdatePayment.form.description")}
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={loading} autoResize />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onDialogOpenChange(false)}>
            {t("common.buttons.close")}
          </Button>
          <Button variant="primary" onClick={form.handleSubmit(onSubmit)}>
            {loading ? <Spinner /> : null}
            {isEdit ? t("common.buttons.update") : t("common.buttons.addNew")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

"use client";

import { useI18n } from "@vivid/i18n";
import { AppSetupProps } from "@vivid/types";
import {
  Button,
  ConnectedAppNameAndLogo,
  ConnectedAppStatusMessage,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@vivid/ui";
import React from "react";
import { useConnectedAppSetup } from "../../hooks/use-connected-app-setup";
import { PaypalApp } from "./app";
import {
  paypalButtonColor,
  paypalButtonLayout,
  paypalButtonsShape,
  PaypalConfiguration,
  paypalConfigurationSchema,
} from "./models";
import {
  PaypalAdminKeys,
  PaypalAdminNamespace,
  paypalAdminNamespace,
} from "./translations/types";

export const PaypalAppSetup: React.FC<AppSetupProps> = ({
  onSuccess,

  onError,

  appId,
}) => {
  const { appStatus, form, isLoading, isValid, onSubmit } =
    useConnectedAppSetup<PaypalConfiguration>({
      appId,
      appName: PaypalApp.name,
      schema: paypalConfigurationSchema,
      onSuccess,
      onError,
    });

  const t = useI18n<PaypalAdminNamespace, PaypalAdminKeys>(
    paypalAdminNamespace,
  );

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="flex flex-col items-center gap-2">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>{t("form.clientId.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.clientId.placeholder")}
                      autoComplete="off"
                      {...field}
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secretKey"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>{t("form.secretKey.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.secretKey.placeholder")}
                      autoComplete="off"
                      {...field}
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="buttonStyle.color"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>{t("form.buttonStyle.color.label")}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        field.onBlur();
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("form.selectPlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {paypalButtonColor.map((color) => (
                          <SelectItem key={color} value={color}>
                            {t(`form.buttonStyle.color.values.${color}`)}
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
              name="buttonStyle.shape"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>{t("form.buttonStyle.shape.label")}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        field.onBlur();
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("form.selectPlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {paypalButtonsShape.map((shape) => (
                          <SelectItem key={shape} value={shape}>
                            {t(`form.buttonStyle.shape.values.${shape}`)}
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
              name="buttonStyle.layout"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>{t("form.buttonStyle.layout.label")}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        field.onBlur();
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("form.selectPlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {paypalButtonLayout.map((layout) => (
                          <SelectItem key={layout} value={layout}>
                            {t(`form.buttonStyle.layout.values.${layout}`)}
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
              name="buttonStyle.label"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>{t("form.buttonStyle.label.label")}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        field.onBlur();
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("form.selectPlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pay">
                          {t(`form.buttonStyle.label.values.pay`)}
                        </SelectItem>
                        <SelectItem value="paypal">
                          {t(`form.buttonStyle.label.values.paypal`)}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={isLoading || !isValid}
              type="submit"
              variant="default"
              className="inline-flex gap-2 items-center w-full"
            >
              {isLoading && <Spinner />}
              <span className="inline-flex gap-2 items-center">
                {t.rich("form.connectWith", {
                  app: () => (
                    <ConnectedAppNameAndLogo appName={PaypalApp.name} />
                  ),
                })}
              </span>
            </Button>
          </div>
        </form>
      </Form>
      {appStatus && (
        <ConnectedAppStatusMessage
          status={appStatus.status}
          statusText={appStatus.statusText}
        />
      )}
    </>
  );
};

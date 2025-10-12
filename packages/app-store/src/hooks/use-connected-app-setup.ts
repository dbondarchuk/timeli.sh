import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@vivid/i18n";
import { ConnectedAppStatusWithText } from "@vivid/types";
import { toastPromise } from "@vivid/ui";
import React from "react";
import { FieldValues, useForm } from "react-hook-form";
import { ZodType } from "zod";
import { addNewApp, getAppData, processRequest } from "../actions";

export type UseConnectedAppSetupProps<T extends FieldValues> = {
  appId?: string;
  appName: string;
  schema: ZodType<T>;
  successText?: string;
  errorText?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  processDataForSubmit?: (data: T) => any;
  initialData?: T;
};

export function useConnectedAppSetup<T extends FieldValues>({
  appId: existingAppId,
  appName,
  schema,
  successText,
  errorText,
  onSuccess,
  onError,
  processDataForSubmit,
  initialData,
}: UseConnectedAppSetupProps<T>) {
  const t = useI18n("apps");
  const [appId, setAppId] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDataLoading, setIsDataLoading] = React.useState(false);
  const [appStatus, setAppStatus] =
    React.useState<ConnectedAppStatusWithText>();

  const [initialAppData, setInitialAppData] = React.useState<T>(
    initialData as any,
  );
  React.useEffect(() => {
    if (!existingAppId) return;

    const getInitialData = async () => {
      setIsDataLoading(true);
      setIsLoading(true);

      const data = await getAppData(existingAppId);
      setInitialAppData(data);

      setIsDataLoading(false);
      setIsLoading(false);
    };

    setAppId(existingAppId);
    getInitialData();
  }, [existingAppId]);

  const form = useForm<T>({
    resolver: zodResolver(schema),
    mode: "all",
    values: initialAppData,
  });

  const onSubmit = async (data: T) => {
    try {
      setIsLoading(true);

      const promise = new Promise<ConnectedAppStatusWithText>(
        async (resolve, reject) => {
          const _appId = appId || (await addNewApp(appName));
          setAppId(_appId);

          const processedData = processDataForSubmit?.(data) || data;

          const status = (await processRequest(
            _appId,
            processedData,
          )) as ConnectedAppStatusWithText;

          setAppStatus(status);

          if (status.status === "failed") {
            reject(status.statusText);
            return;
          }

          if (status.status === "connected") {
            resolve(status);
          }
        },
      );

      await toastPromise(promise, {
        success: {
          message: t("common.connectedAppSetup.success.title"),
          description:
            successText || t("common.connectedAppSetup.success.description"),
        },
        error: {
          message: t("common.connectedAppSetup.error.title"),
          description:
            errorText || t("common.connectedAppSetup.error.description"),
        },
      });

      onSuccess?.();
    } catch (e: any) {
      onError?.(e instanceof Error ? e.message : e?.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const { isValid } = form.formState;

  return {
    appId,
    isLoading,
    isDataLoading,
    setIsDataLoading,
    setIsLoading,
    form,
    isValid,
    appStatus,
    onSubmit,
  };
}

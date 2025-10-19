import { useI18n } from "@vivid/i18n";
import { AppSetupProps, ConnectedApp } from "@vivid/types";
import { Button, Spinner } from "@vivid/ui";
import {
  ConnectedAppNameAndLogo,
  ConnectedAppStatusMessage,
} from "@vivid/ui-admin";
import React from "react";
import {
  addNewApp,
  getAppLoginUrl,
  getAppStatus,
  setAppStatus,
} from "../../actions";
import { OutlookApp } from "./app";
import {
  OutlookAdminAllKeys,
  OutlookAdminKeys,
  OutlookAdminNamespace,
  outlookAdminNamespace,
} from "./translations/types";

export const OutlookAppSetup: React.FC<AppSetupProps> = ({
  onSuccess,
  onError,
  appId: existingAppId,
}) => {
  const t = useI18n<OutlookAdminNamespace, OutlookAdminKeys>(
    outlookAdminNamespace,
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const [app, setApp] = React.useState<ConnectedApp | undefined>(undefined);
  const [timer, setTimer] = React.useState<NodeJS.Timeout>();

  const getStatus = async (appId: string) => {
    const status = await getAppStatus(appId);
    setApp(() => status);

    if (status.status === "pending") {
      const id = setTimeout(() => getStatus(appId), 1000);
      setTimer(id);
      return;
    }

    setIsLoading(false);

    if (status.status === "connected") {
      onSuccess();
      return;
    }

    onError(status.statusText);
  };

  const clearTimer = () => {
    if (timer) clearTimeout(timer);
  };

  React.useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  const connectApp = async () => {
    try {
      setIsLoading(true);

      let appId: string;
      if (app?._id || existingAppId) {
        appId = (app?._id || existingAppId)!;
        await setAppStatus(appId, {
          status: "pending",
          statusText:
            "app_outlook_admin.form.pendingAuthorization" satisfies OutlookAdminAllKeys,
        });
      } else {
        appId = await addNewApp(OutlookApp.name);
      }

      const loginUrl = await getAppLoginUrl(appId);

      getStatus(appId);
      window.open(loginUrl, "_blank", "popup=true");
    } catch (e: any) {
      onError(e?.message);

      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="default"
          onClick={connectApp}
          disabled={isLoading}
          className="inline-flex gap-2 items-center w-full"
        >
          {isLoading && <Spinner />}
          <span className="inline-flex gap-2 items-center">
            {t.rich("form.connectWith", {
              app: () => <ConnectedAppNameAndLogo appName={OutlookApp.name} />,
            })}
          </span>
        </Button>
      </div>
      {app && (
        <ConnectedAppStatusMessage
          status={app.status}
          statusText={app.statusText}
        />
      )}
    </>
  );
};

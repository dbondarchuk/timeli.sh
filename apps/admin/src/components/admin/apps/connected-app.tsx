import { AvailableApps } from "@timelish/app-store";
import { getI18nAsync } from "@timelish/i18n/server";
import { ConnectedApp } from "@timelish/types";
import { Link } from "@timelish/ui";
import {
  ConnectedAppAccount,
  ConnectedAppNameAndLogo,
  ConnectedAppStatusMessage,
} from "@timelish/ui-admin";
import { RefreshCcw } from "lucide-react";
import { AddOrUpdateAppButton } from "./add-or-update-app-dialog";
import { DeleteAppButton } from "./delete-app-button";

export type ConnectedAppRowProps = {
  app: ConnectedApp;
};

export const ConnectedAppRow: React.FC<ConnectedAppRowProps> = async ({
  app,
}) => {
  const appDescriptor = AvailableApps[app.name];
  const t = await getI18nAsync("apps");
  const updateText = t("common.updateApp");

  return (
    <div className="border rounded-md px-2 md:px-4 lg:px-6 py-2 md:py-4 lg:py-6 grid lg:grid-cols-4 gap-4 items-center bg-card">
      <ConnectedAppNameAndLogo appName={app.name} className="break-all" />
      <ConnectedAppAccount account={app.account} className="break-all" />
      <ConnectedAppStatusMessage
        status={app.status}
        statusText={app.statusText}
        className="flex-grow break-all"
      />
      <div className="flex flex-col gap-2 md:flex-row flex-wrap justify-end">
        {appDescriptor.type === "complex" && appDescriptor.settingsHref ? (
          <Link
            button
            href={`/dashboard/${appDescriptor.settingsHref}`}
            variant="secondary"
          >
            <RefreshCcw /> {updateText}
          </Link>
        ) : (
          <AddOrUpdateAppButton app={app} />
        )}
        <DeleteAppButton appId={app._id} />
      </div>
    </div>
  );
};

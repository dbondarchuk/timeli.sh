"use client";

import { useI18n } from "@vivid/i18n";
import { AppSetupProps } from "@vivid/types";
import {
  Button,
  ConnectedAppNameAndLogo,
  ConnectedAppStatusMessage,
  Spinner,
} from "@vivid/ui";
import React from "react";
import { z } from "zod";
import { useConnectedAppSetup } from "../../hooks/use-connected-app-setup";
import { FinancialOverviewApp } from "./app";
import {
  FinancialOverviewAdminKeys,
  FinancialOverviewAdminNamespace,
  financialOverviewAdminNamespace,
} from "./translations/types";

export const FinancialOverviewAppSetup: React.FC<AppSetupProps> = ({
  onSuccess,
  onError,
  appId: existingAppId,
}) => {
  const t = useI18n<
    FinancialOverviewAdminNamespace,
    FinancialOverviewAdminKeys
  >(financialOverviewAdminNamespace);
  const { appStatus, isLoading, isValid, onSubmit } = useConnectedAppSetup<any>(
    {
      appId: existingAppId,
      appName: FinancialOverviewApp.name,
      schema: z.any(),
      onSuccess,
      onError,
    },
  );

  return (
    <>
      <div className="flex flex-col items-center gap-2 w-full">
        <Button
          disabled={isLoading || !isValid}
          variant="default"
          className="inline-flex gap-2 items-center w-full"
          onClick={() => onSubmit(undefined)}
        >
          {isLoading && <Spinner />}
          <span className="inline-flex gap-2 items-center">
            {t.rich("setup.connect", {
              app: () => (
                <ConnectedAppNameAndLogo appName={FinancialOverviewApp.name} />
              ),
            })}
          </span>
        </Button>
      </div>
      {appStatus && (
        <ConnectedAppStatusMessage
          status={appStatus.status}
          statusText={appStatus.statusText}
        />
      )}
    </>
  );
};

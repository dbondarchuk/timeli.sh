import { AvailableApps } from "@vivid/app-store";
import { AppImages } from "@vivid/app-store/images";
import { getI18nAsync } from "@vivid/i18n/server";
import {
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Heading,
  Link,
  Markdown,
} from "@vivid/ui";
import { ConnectedAppNameAndLogo } from "@vivid/ui-admin";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import React from "react";
import { AddOrUpdateAppButton } from "../add-or-update-app-dialog";
import { getInstalledApps } from "./actions";
import { InstallComplexAppButton } from "./install-complex-app-button";

export type AppDetailsProps = {
  appName: string;
};

export const AppDetails: React.FC<AppDetailsProps> = async ({ appName }) => {
  const app = AvailableApps[appName];
  const installed = await getInstalledApps(appName);
  const t = await getI18nAsync();
  //if (app.isHidden) return null;

  return (
    <div className="flex flex-col w-full gap-8">
      <div className="flex flex-row gap-2">
        <Link
          button
          variant="outline"
          href="/admin/dashboard/apps/store"
          className="border-none rounded-none -ml-4"
        >
          <ArrowLeft />
        </Link>
        <Heading title={t("apps.common.appStore")} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="flex flex-col w-full gap-8">
          <ConnectedAppNameAndLogo
            appName={app.name}
            nameClassName="text-3xl text-accent-foreground"
            logoClassName="w-12 h-12"
          />
          <div className="flex flex-row flex-wrap gap-4 items-center">
            {app.isFeatured && (
              <span className="text-emphasis">{t("apps.common.featured")}</span>
            )}
            {app.scope.map((scope) => (
              <span
                className="bg-secondary text-secondary-foreground text-emphasis rounded-md p-2 text-xs capitalize"
                key={scope}
              >
                {t.has(`apps.scopes.${scope}` as any)
                  ? t(`apps.scopes.${scope}` as any)
                  : scope}
              </span>
            ))}
          </div>
          <div>
            {app.type !== "complex" && app.type !== "system" ? (
              <AddOrUpdateAppButton appType={app.name}>
                <Button
                  variant="default"
                  disabled={app.dontAllowMultiple && installed.length > 0}
                >
                  {app.dontAllowMultiple && installed.length > 0
                    ? t("apps.common.alreadyInstalled")
                    : t("apps.common.addApp")}
                </Button>
              </AddOrUpdateAppButton>
            ) : (
              <InstallComplexAppButton
                appName={appName}
                installed={installed.length}
              />
            )}
          </div>

          <Markdown markdown={t(app.description.text)} className="max-w-full" />
        </div>

        {!!AppImages[app.name]?.length && (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            {/* <div className="flex flex-col gap-6">
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row gap-2 justify-end">
                  <CarouselPrevious className="relative translate-y-0 rounded-none border-none left-0 top-0" />
                  <CarouselNext className="relative translate-y-0 rounded-none border-none right-0 top-0" />
                </div>
              </div> */}
            <CarouselContent className="h-full">
              {AppImages[app.name].map((image, index) => (
                <CarouselItem
                  key={index}
                  className="items-center flex justify-center h-full"
                >
                  <Image
                    src={image}
                    width={800}
                    height={400}
                    alt={app.displayName}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* </div> */}

            <CarouselPrevious className="rounded-none border-none left-0" />
            <CarouselNext className="rounded-none border-none right-0" />
          </Carousel>
        )}
      </div>
    </div>
  );
};

import { useI18n } from "@vivid/i18n";
import { AssetsMigrateRequest } from "@vivid/types";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  SegmentProgress,
  Spinner,
  toast,
} from "@vivid/ui";
import { AppSelector } from "@vivid/ui-admin";
import React from "react";

export const MigrateAssetsDialog: React.FC<{
  appId: string;
  disabled?: boolean;
}> = ({ appId, disabled }) => {
  const t = useI18n("admin");
  const [newAppId, setNewAppId] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);

  const [progress, setProgress] = React.useState<{
    done: number;
    success: number;
    error: number;
    total: number;
  }>();

  const onClick = async () => {
    if (appId === newAppId || !newAppId) return;

    setIsLoading(true);
    setProgress(undefined);
    let split: string[] = [];
    try {
      const response = await fetch("/admin/api/assets/migrate", {
        method: "POST",
        body: JSON.stringify({
          fromAppId: newAppId,
          toAppId: appId,
        } satisfies AssetsMigrateRequest),
      });

      const reader = response.body?.getReader();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const decoded = new TextDecoder().decode(value);
          split = decoded
            .trim()
            .split("\n")
            .filter((s) => !!s);
          const last = split[split.length - 1];
          const result = JSON.parse(last);

          setProgress(result);
        }
      }
    } catch (error) {
      toast.error(t("apps.migrateAssetsDialog.toasts.requestError"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={isLoading || disabled}
          variant="secondary"
          className="inline-flex gap-2 items-center w-full"
        >
          {t("apps.migrateAssetsDialog.migrateAssets")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("apps.migrateAssetsDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("apps.migrateAssetsDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-1 gap-2">
          <Label>{t("apps.migrateAssetsDialog.sourceApp")}</Label>
          <AppSelector
            scope="assets-storage"
            excludeIds={[appId]}
            onItemSelect={setNewAppId}
            value={newAppId}
            disabled={isLoading}
          />
          {progress && (
            <div className="flex flex-col gap-2">
              <SegmentProgress
                segments={[
                  {
                    value: (progress.error / progress.total) * 100,
                    color: "bg-destructive",
                  },
                  {
                    value: (progress.success / progress.total) * 100,
                    color: "bg-green-400",
                  },
                ]}
              />
              <div className="flex flex-row gap-2 flex-wrap bg-muted text-muted-foreground p-2">
                <div>
                  {t("apps.migrateAssetsDialog.done", { count: progress.done })}
                </div>
                <div>
                  {t("apps.migrateAssetsDialog.success", {
                    count: progress.success,
                  })}
                </div>
                <div>
                  {t("apps.migrateAssetsDialog.error", {
                    count: progress.error,
                  })}
                </div>
                <div>
                  {t("apps.migrateAssetsDialog.total", {
                    count: progress.total,
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            className="w-full"
            variant="default"
            onClick={onClick}
            disabled={!newAppId || newAppId === appId || isLoading}
          >
            {isLoading && <Spinner />}
            {t("apps.migrateAssetsDialog.migrate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

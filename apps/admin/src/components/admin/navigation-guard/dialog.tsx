"use client";
import { useI18n } from "@timelish/i18n";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@timelish/ui";
import { useNavigationGuard } from "next-navigation-guard";
import { useCallback } from "react";
import { UseFormReturn, useFormState } from "react-hook-form";

export const useIsDirty = (form: UseFormReturn<any>) => {
  const { isDirty: isFormDirty } = useFormState({ control: form.control });

  const onFormSubmit = useCallback(() => {
    form.reset(undefined, {
      keepDirty: false,
      keepValues: true,
    });
  }, [form]);

  return { isFormDirty: isFormDirty, onFormSubmit };
};

export const NavigationGuardDialog = ({ isDirty }: { isDirty: boolean }) => {
  const { active, accept, reject } = useNavigationGuard({
    enabled: isDirty,
  });

  const t = useI18n("admin");

  return (
    <Dialog open={active}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("common.navigationGuard.title")}</DialogTitle>
        </DialogHeader>
        <div>{t("common.navigationGuard.description")}</div>
        <DialogFooter>
          <Button variant="outline" onClick={reject}>
            {t("common.navigationGuard.cancel")}
          </Button>
          <Button onClick={accept}>{t("common.navigationGuard.leave")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

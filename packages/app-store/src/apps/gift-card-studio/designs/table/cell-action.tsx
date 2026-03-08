"use client";

import { useI18n } from "@timelish/i18n";
import {
  AlertModal,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Link,
  toastPromise,
} from "@timelish/ui";
import {
  Eye,
  EyeOff,
  MoreHorizontal,
  Pencil,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { deleteDesign, setDesignPublic } from "../../actions";
import { DesignListModel } from "../../models";
import { ManualPurchaseDialog } from "../../purchases/components/manual-purchase-form";
import {
  GiftCardStudioAdminKeys,
  GiftCardStudioAdminNamespace,
  giftCardStudioAdminNamespace,
} from "../../translations/types";

interface CellActionProps {
  design: DesignListModel;
  appId: string;
}

export const CellAction: React.FC<CellActionProps> = ({ design, appId }) => {
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const t = useI18n<GiftCardStudioAdminNamespace, GiftCardStudioAdminKeys>(
    giftCardStudioAdminNamespace,
  );
  const tUi = useI18n("ui");
  const [, reload] = useQueryState("ts", { history: "replace" });
  const router = useRouter();
  const canDelete = (design.purchasesCount ?? 0) === 0;
  const isPublic = design.isPublic ?? false;

  const onConfirmDelete = async () => {
    try {
      setLoading(true);
      await toastPromise(deleteDesign(appId, design._id), {
        success: t("designs.table.toast.delete", { name: design.name }),
        error: t("designs.table.toast.deleteError"),
      });
      setDeleteOpen(false);
      reload(`${Date.now()}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onConfirmPublish = async () => {
    try {
      setLoading(true);
      await toastPromise(setDesignPublic(appId, design._id, true), {
        success: t("designs.table.toast.published", { name: design.name }),
        error: t("designs.table.toast.publishError"),
      });
      setPublishOpen(false);
      reload(`${Date.now()}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onConfirmUnpublish = async () => {
    try {
      setLoading(true);
      await toastPromise(setDesignPublic(appId, design._id, false), {
        success: t("designs.table.toast.unpublished", { name: design.name }),
        error: t("designs.table.toast.unpublishError"),
      });
      setUnpublishOpen(false);
      reload(`${Date.now()}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onConfirmDelete}
        loading={loading}
        title={t("designs.table.delete.title")}
        description={t("designs.table.delete.description", {
          name: design.name,
        })}
        continueButton={t("designs.table.delete.confirm")}
      />
      <AlertModal
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        onConfirm={onConfirmPublish}
        loading={loading}
        title={t("designs.table.publish.title")}
        description={t("designs.table.publish.description", {
          name: design.name,
        })}
        continueButton={t("designs.table.publish.confirm")}
      />
      <AlertModal
        isOpen={unpublishOpen}
        onClose={() => setUnpublishOpen(false)}
        onConfirm={onConfirmUnpublish}
        loading={loading}
        title={t("designs.table.unpublish.title")}
        description={t("designs.table.unpublish.description", {
          name: design.name,
        })}
        continueButton={t("designs.table.unpublish.confirm")}
      />
      <ManualPurchaseDialog
        appId={appId}
        open={purchaseOpen}
        designId={design._id}
        onOpenChange={setPurchaseOpen}
        onSuccess={() => {
          router.push(
            `/dashboard/gift-card-studio/purchases?designId=${design._id}`,
          );
        }}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{tUi("common.openMenu")}</span>
            <MoreHorizontal className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{tUi("actions.label")}</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/gift-card-studio/edit?id=${design._id}`}
              className="text-foreground"
            >
              <Pencil className="size-3.5" /> {t("designs.table.actions.edit")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPurchaseOpen(true)}>
            <ShoppingCart className="size-3.5" />{" "}
            {t("designs.table.actions.purchase")}
          </DropdownMenuItem>
          {!isPublic ? (
            <DropdownMenuItem onClick={() => setPublishOpen(true)}>
              <Eye className="size-3.5" /> {t("designs.table.actions.publish")}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setUnpublishOpen(true)}>
              <EyeOff className="size-3.5" />{" "}
              {t("designs.table.actions.unpublish")}
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-3.5" />{" "}
              {t("designs.table.actions.delete")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

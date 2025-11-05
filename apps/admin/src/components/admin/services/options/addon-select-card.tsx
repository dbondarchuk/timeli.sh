import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useI18n } from "@timelish/i18n";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  cn,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@timelish/ui";
import { AddonSelector } from "@timelish/ui-admin";
import { cva } from "class-variance-authority";
import { GripVertical, Trash } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

export type AddonSelectProps = {
  item: {
    id: string;
    fields_id: string;
  };
  excludeIds?: string[];
  name: string;
  form: UseFormReturn<any>;
  disabled?: boolean;
  isOverlay?: boolean;
  remove: () => void;
};

export type AddonSelectType = "AddonSelect";

export interface AddonSelectDragData {
  type: AddonSelectType;
  item: {
    fields_id: string;
  };
}

export const AddonSelectCard: React.FC<AddonSelectProps> = ({
  item,
  form,
  name,
  excludeIds,
  disabled,
  isOverlay,
  remove,
}) => {
  const t = useI18n("admin");
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.fields_id,
    data: {
      type: "AddonSelect",
      item,
    } satisfies AddonSelectDragData,
    attributes: {
      roleDescription: "Addon",
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });

  return (
    <div
      className={cn(
        "flex flex-row gap-2 px-2 py-4 bg-background rounded",
        variants({
          dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
        }),
      )}
      ref={setNodeRef}
      style={style}
    >
      <Button
        type="button"
        variant={"ghost"}
        {...attributes}
        {...listeners}
        className="h-auto cursor-grab p-1 text-secondary-foreground/50"
      >
        <></>
        <span className="sr-only">
          {t("services.addonSelectCard.moveAddon")}
        </span>
        <GripVertical />
      </Button>
      <div className="grid grid-cols-1 gap-2 flex-grow w-full">
        <FormField
          control={form.control}
          name={`${name}.id`}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{t("services.addonSelectCard.addon")}</FormLabel>

              <FormControl>
                <AddonSelector
                  disabled={disabled}
                  excludeIds={excludeIds}
                  className="flex w-full font-normal text-base"
                  value={field.value}
                  onItemSelect={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex flex-row items-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={disabled}
              variant="destructive"
              className=""
              size="sm"
              type="button"
            >
              <Trash size={20} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("services.addonSelectCard.deleteConfirmTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("services.addonSelectCard.deleteConfirmDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t("services.addonSelectCard.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction asChild variant="destructive">
                <Button onClick={remove}>
                  {t("services.addonSelectCard.delete")}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

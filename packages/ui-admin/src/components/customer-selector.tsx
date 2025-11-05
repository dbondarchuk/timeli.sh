import { adminApi } from "@timelish/api-sdk";
import { useI18n } from "@timelish/i18n";
import { CustomerListModel } from "@timelish/types";
import { cn, ComboboxAsync, IComboboxItem, Skeleton } from "@timelish/ui";
// import Image from "next/image";
import React from "react";

const CustomerShortLabel: React.FC<{
  customer: CustomerListModel;
  row?: boolean;
}> = ({ customer, row }) => {
  return (
    <div className="flex flex-row items-center gap-2 shrink overflow-hidden text-nowrap min-w-0 max-w-[var(--radix-popover-trigger-width)]">
      <img
        src={customer.avatar ?? "/unknown-person.png"}
        width={20}
        height={20}
        alt={customer.name}
      />
      <div className={cn("flex gap-0.5", row ? "items-baseline" : "flex-col")}>
        <span>{customer.name}</span>
        <span className="text-xs italic">{customer.email}</span>
        <span className="text-xs italic">{customer.phone}</span>
      </div>
    </div>
  );
};

const CustomerLoader: React.FC<{}> = ({}) => {
  return (
    <div className="flex flex-row items-center gap-2 overflow-hidden text-nowrap pl-6 w-full">
      <Skeleton className="w-5 h-5 rounded-full" />
      <div className="flex gap-0.5 flex-col w-full">
        <Skeleton className="min-w-40 max-w-96 w-full h-5" />
        <Skeleton className="min-w-36 max-w-80 w-full h-4" />
        <Skeleton className="min-w-36 max-w-80 w-full h-4" />
      </div>
    </div>
  );
};

type BaseCustomerSelectorProps = {
  value?: string;
  disabled?: boolean;
  className?: string;
  onValueChange?: (customer?: CustomerListModel) => void;
};

type ClearableCustomerSelectorProps = BaseCustomerSelectorProps & {
  onItemSelect: (value: string | undefined) => void;
  allowClear: true;
};

type NonClearableCustomerSelectorProps = BaseCustomerSelectorProps & {
  onItemSelect: (value: string) => void;
  allowClear?: false;
};

export type CustomerSelectorProps =
  | NonClearableCustomerSelectorProps
  | ClearableCustomerSelectorProps;

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  disabled,
  className,
  value,
  onItemSelect,
  onValueChange,
  allowClear,
}) => {
  const t = useI18n("ui");
  const [itemsCache, setItemsCache] = React.useState<
    Record<string, CustomerListModel>
  >({});

  const getCustomers = React.useCallback(
    async (page: number, search?: string) => {
      const limit = 10;
      const result = await adminApi.customers.getCustomers({
        page,
        limit,
        search,
        priorityId: value ? [value] : undefined,
      });

      setItemsCache((prev) => ({
        ...prev,
        ...result.items.reduce(
          (map, cur) => ({
            ...map,
            [cur._id]: cur,
          }),
          {} as typeof itemsCache,
        ),
      }));

      return {
        items: result.items.map((customer) => ({
          label: <CustomerShortLabel customer={customer} />,
          shortLabel: <CustomerShortLabel customer={customer} row />,
          value: customer._id,
        })) satisfies IComboboxItem[],
        hasMore: page * limit < result.total,
      };
    },
    [value, setItemsCache, t],
  );

  React.useEffect(() => {
    onValueChange?.(value ? itemsCache[value] : undefined);
  }, [value, itemsCache]);

  return (
    <ComboboxAsync
      // @ts-ignore Allow clear passthrough
      onChange={onItemSelect}
      disabled={disabled}
      className={cn("flex font-normal text-base max-w-full", className)}
      placeholder={t("customerSelector.placeholder")}
      value={value}
      allowClear={allowClear}
      fetchItems={getCustomers}
      loader={<CustomerLoader />}
    />
  );
};

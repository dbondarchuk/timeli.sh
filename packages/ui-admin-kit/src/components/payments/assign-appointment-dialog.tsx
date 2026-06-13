"use client";

import { adminApi } from "@timelish/api-sdk";
import { AdminKeys, useI18n, useLocale } from "@timelish/i18n";
import { Appointment, DateRange, Sort } from "@timelish/types";
import {
  Button,
  CalendarDateRangePicker,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  RadioGroup,
  RadioGroupItem,
  ScrollArea,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useCurrencyFormat,
  useTimeZone,
} from "@timelish/ui";
import { CustomerName, CustomerSelector } from "@timelish/ui-admin";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { DateTime } from "luxon";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 10;
const DEFAULT_SORT: Sort = [{ id: "createdAt", desc: true }];

type AssignAppointmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The appointment the payment is currently assigned to, if any. */
  currentAppointmentId?: string;
  onConfirm: (appointmentId: string) => Promise<void> | void;
};

export const AssignAppointmentDialog = ({
  open,
  onOpenChange,
  currentAppointmentId,
  onConfirm,
}: AssignAppointmentDialogProps) => {
  const t = useI18n("admin");
  const locale = useLocale();
  const timeZone = useTimeZone();
  const currencyFormat = useCurrencyFormat();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [range, setRange] = useState<DateRange | undefined>();
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [sort, setSort] = useState<Sort>(DEFAULT_SORT);
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<Appointment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    try {
      const result = await adminApi.appointments.getAppointments({
        search: debouncedSearch || undefined,
        page: page + 1,
        limit: PAGE_SIZE,
        status: ["confirmed", "pending"],
        start: range?.start,
        end: range?.end,
        customer: customerId ? [customerId] : undefined,
        sort,
      });
      if (current === requestId.current) {
        setItems(result.items);
        setTotal(result.total);
      }
    } catch {
      if (current === requestId.current) {
        setItems([]);
        setTotal(0);
      }
    } finally {
      if (current === requestId.current) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, range, customerId, sort, page]);

  useEffect(() => {
    if (!open) {
      return;
    }
    load();
  }, [open, load]);

  // Reset to the first page whenever the filters or sort change.
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, range, customerId, sort]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setDebouncedSearch("");
      setRange(undefined);
      setCustomerId(undefined);
      setSort(DEFAULT_SORT);
      setPage(0);
      setSelected(undefined);
    }
  }, [open]);

  const toggleSort = (id: string) => {
    setSort((current) => {
      const active = current[0]?.id === id;
      return [{ id, desc: active ? !current[0]?.desc : false }];
    });
  };

  const formatTime = (value: Date | string) =>
    DateTime.fromJSDate(new Date(value), { zone: timeZone }).toLocaleString(
      DateTime.DATETIME_MED,
      { locale },
    );

  const renderSortHead = (field: string, labelKey: string, align?: "right") => {
    const active = sort[0]?.id === field;
    const Icon = active
      ? sort[0]?.desc
        ? ArrowDown
        : ArrowUp
      : ChevronsUpDown;
    return (
      <button
        type="button"
        onClick={() => toggleSort(field)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground",
          align === "right" && "flex-row-reverse",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {t(labelKey as AdminKeys)}
        <Icon className="size-3.5" />
      </button>
    );
  };

  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min(total, page * PAGE_SIZE + items.length);
  const hasNextPage = (page + 1) * PAGE_SIZE < total;

  const confirm = async () => {
    if (!selected) {
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm(selected);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80%]">
        <DialogHeader>
          <DialogTitle>{t("syncedPayments.assignDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("syncedPayments.assignDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("syncedPayments.assignDialog.searchPlaceholder")}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <CustomerSelector
              value={customerId}
              allowClear
              onItemSelect={(value) => setCustomerId(value)}
              className="sm:max-w-xs"
            />
            <CalendarDateRangePicker
              range={range}
              onChange={setRange}
              timeZone={timeZone}
              className="sm:w-auto sm:min-w-56"
            />
          </div>
        </div>

        <ScrollArea className="h-80 rounded-md border border-border">
          <RadioGroup
            value={selected}
            onValueChange={setSelected}
            className="gap-0"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>
                    {renderSortHead(
                      "option.name",
                      "syncedPayments.assignDialog.columns.option",
                    )}
                  </TableHead>
                  <TableHead>
                    {renderSortHead(
                      "customer.name",
                      "syncedPayments.assignDialog.columns.customer",
                    )}
                  </TableHead>
                  <TableHead>
                    {renderSortHead(
                      "dateTime",
                      "syncedPayments.assignDialog.columns.dateTime",
                    )}
                  </TableHead>
                  <TableHead>
                    {renderSortHead(
                      "createdAt",
                      "syncedPayments.assignDialog.columns.requestedAt",
                    )}
                  </TableHead>
                  <TableHead className="text-right">
                    {renderSortHead(
                      "totalPrice",
                      "syncedPayments.assignDialog.columns.price",
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="flex justify-center py-8">
                        <Spinner />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      {t("syncedPayments.assignDialog.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((appointment) => {
                    const isCurrent = appointment._id === currentAppointmentId;
                    return (
                      <TableRow
                        key={appointment._id}
                        data-state={
                          selected === appointment._id ? "selected" : undefined
                        }
                        className={isCurrent ? "opacity-50" : "cursor-pointer"}
                        onClick={() =>
                          !isCurrent && setSelected(appointment._id)
                        }
                      >
                        <TableCell>
                          <RadioGroupItem
                            value={appointment._id}
                            disabled={isCurrent}
                            aria-label={appointment.option.name}
                          />
                        </TableCell>
                        <TableCell>{appointment.option.name}</TableCell>
                        <TableCell>
                          {appointment.customer?.name ? (
                            <CustomerName customer={appointment.customer} />
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {formatTime(appointment.dateTime)}
                        </TableCell>
                        <TableCell>
                          {formatTime(appointment.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {appointment.totalPrice
                            ? currencyFormat(appointment.totalPrice)
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </RadioGroup>
        </ScrollArea>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {t("syncedPayments.pagination.summary", { from, to, total })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || loading}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              {t("syncedPayments.pagination.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNextPage || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              {t("syncedPayments.pagination.next")}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {t("syncedPayments.assignDialog.cancel")}
          </Button>
          <Button onClick={confirm} disabled={!selected || submitting}>
            {submitting && <Spinner />}{" "}
            {t("syncedPayments.assignDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { create } from "zustand";

export type DataTableContextProps<T> = {
  rowSelection: T[];
  setRowSelection: (data: T[]) => void;
};

export const useSelectedRowsStore = create<DataTableContextProps<any>>(
  (set) => ({
    rowSelection: [],
    setRowSelection: (data: any[]) => {
      return set(() => ({
        rowSelection: data,
      }));
    },
  }),
);

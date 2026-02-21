import {
  Customer,
  CustomerListModel,
  CustomerSearchField,
  CustomerUpdateModel,
} from "../customers";
import { Query, WithTotal } from "../database";

export interface ICustomersService {
  getCustomer(
    id: string,
    options?: { includeDeleted?: boolean },
  ): Promise<Customer | null>;
  getCustomers(
    query: Query & { priorityIds?: string[] },
  ): Promise<WithTotal<CustomerListModel>>;

  getAllCustomers(): Promise<Customer[]>;

  findCustomer(email: string, phone: string): Promise<Customer | null>;

  findCustomerBySearchField(
    search: string,
    field: CustomerSearchField,
  ): Promise<Customer | null>;

  findCustomerBySearchFields(
    searches: { search: string; field: CustomerSearchField }[],
  ): Promise<Customer | null>;

  createCustomer(customer: CustomerUpdateModel): Promise<Customer>;
  updateCustomer(id: string, update: CustomerUpdateModel): Promise<void>;

  getOrUpsertCustomer(fields: {
    name: string;
    email: string;
    phone: string;
  }): Promise<Customer>;

  deleteCustomer(id: string): Promise<Customer | null>;
  deleteCustomers(ids: string[]): Promise<void>;

  mergeCustomers(targetId: string, ids: string[]): Promise<void>;

  checkUniqueEmailAndPhone(
    emails: string[],
    phones: string[],
    id?: string,
  ): Promise<{ email: boolean; phone: boolean }>;
}

import { getLoggerFactory } from "@vivid/logger";
import {
  Appointment,
  Customer,
  CustomerListModel,
  CustomerSearchField,
  CustomerUpdateModel,
  IConnectedAppsService,
  ICustomerHook,
  Leaves,
  Query,
  WithTotal,
  type ICustomersService,
} from "@vivid/types";
import { buildSearchQuery, escapeRegex } from "@vivid/utils";
import { Filter, ObjectId, Sort } from "mongodb";
import { getDbConnection } from "./database";
import { APPOINTMENTS_COLLECTION_NAME } from "./events.service";

export const CUSTOMERS_COLLECTION_NAME = "customers";

export class CustomersService implements ICustomersService {
  protected readonly loggerFactory = getLoggerFactory("CustomersService");

  constructor(private readonly appsService: IConnectedAppsService) {}

  public async getCustomer(id: string): Promise<Customer | null> {
    const logger = this.loggerFactory("getCustomer");
    logger.debug({ customerId: id }, "Getting customer by id");

    const db = await getDbConnection();

    const collection = db.collection<Customer>(CUSTOMERS_COLLECTION_NAME);

    const customer = await collection.findOne({
      _id: id,
    });

    if (!customer) {
      logger.warn({ customerId: id }, "Customer not found");
    } else {
      logger.debug(
        {
          customerId: id,
          name: customer.name,
        },
        "Customer found",
      );
    }

    return customer;
  }

  public async getCustomers(
    query: Query & { priorityIds?: string[] },
  ): Promise<WithTotal<CustomerListModel>> {
    const logger = this.loggerFactory("getCustomers");
    logger.debug({ query }, "Getting customers");

    const db = await getDbConnection();

    const sort: Sort = query.sort?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr.desc ? -1 : 1,
      }),
      {},
    ) || { "lastAppointment.dateTime": -1 };

    const filter: Filter<Customer> = {};

    if (query.search) {
      const $regex = new RegExp(escapeRegex(query.search), "i");
      const queries = buildSearchQuery<Customer>(
        { $regex },
        "name",
        "phone",
        "email",
        "knownNames",
        "knownEmails",
        "knownPhones",
        "note",
      );

      filter.$or = queries;
    }

    const priorityStages = query.priorityIds
      ? [
          {
            $facet: {
              priority: [
                {
                  $match: {
                    _id: {
                      $in: query.priorityIds,
                    },
                  },
                },
              ],
              other: [
                {
                  $match: {
                    ...filter,
                    _id: {
                      $nin: query.priorityIds,
                    },
                  },
                },
                {
                  $sort: sort,
                },
              ],
            },
          },
          {
            $project: {
              values: {
                $concatArrays: ["$priority", "$other"],
              },
            },
          },
          {
            $unwind: {
              path: "$values",
            },
          },
          {
            $replaceRoot: {
              newRoot: "$values",
            },
          },
        ]
      : [
          {
            $match: filter,
          },
          {
            $sort: sort,
          },
        ];

    const [result] = await db
      .collection<Customer>(CUSTOMERS_COLLECTION_NAME)
      .aggregate([
        {
          $lookup: {
            from: APPOINTMENTS_COLLECTION_NAME,
            localField: "_id",
            foreignField: "customerId",
            as: "appointments",
            pipeline: [
              {
                $match: {
                  status: { $ne: "declined" },
                },
              },
            ],
          },
        },
        {
          $addFields: {
            appointmentsCount: {
              $size: "$appointments",
            },
            lastAppointment: {
              //   $getField: {
              //     field: "dateTime",
              //     input: {
              $first: {
                $filter: {
                  input: {
                    $sortArray: {
                      input: "$appointments",
                      sortBy: {
                        dateTime: -1,
                      },
                    },
                  },
                  as: "appt",
                  cond: {
                    $lt: ["$$appt.dateTime", new Date()],
                  },
                  limit: 1,
                },
              },
              // },
              //   },
            },
            nextAppointment: {
              //   $getField: {
              //     field: "dateTime",
              //     input: {
              $first: {
                $filter: {
                  input: {
                    $sortArray: {
                      input: "$appointments",
                      sortBy: {
                        dateTime: 1,
                      },
                    },
                  },
                  as: "appt",
                  cond: {
                    $gte: ["$$appt.dateTime", new Date()],
                  },
                  limit: 1,
                },
              },
              // },
              //   },
            },
          },
        },
        {
          $project: {
            appointments: 0,
          },
        },
        ...priorityStages,
        {
          $facet: {
            paginatedResults:
              query.limit === 0
                ? undefined
                : [
                    ...(typeof query.offset !== "undefined"
                      ? [{ $skip: query.offset }]
                      : []),
                    ...(typeof query.limit !== "undefined"
                      ? [{ $limit: query.limit }]
                      : []),
                  ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ])
      .toArray();

    const response = {
      total: result.totalCount?.[0]?.count || 0,
      items: result.paginatedResults || [],
    };

    logger.debug(
      {
        query,
        result: { total: response.total, count: response.items.length },
      },
      "Fetched customers",
    );

    return response;
  }

  public async findCustomer(
    email: string,
    phone: string,
  ): Promise<Customer | null> {
    const logger = this.loggerFactory("findCustomer");
    logger.debug({ email, phone }, "Finding customer by email and phone");

    const byEmail = await this.findCustomerBySearchField(email, "email");
    if (byEmail) {
      logger.debug(
        { email, customerId: byEmail._id },
        "Customer found by email",
      );
      return byEmail;
    }

    const byPhone = await this.findCustomerBySearchField(phone, "phone");
    if (byPhone) {
      logger.debug(
        { phone, customerId: byPhone._id },
        "Customer found by phone",
      );
    } else {
      logger.debug({ email, phone }, "Customer not found by email or phone");
    }
    return byPhone;
  }

  public async findCustomerBySearchField(
    search: string,
    field: CustomerSearchField,
  ): Promise<Customer | null> {
    const logger = this.loggerFactory("findCustomerBySearchField");
    logger.debug({ search, field }, "Finding customer by search field");

    const db = await getDbConnection();

    const collection = db.collection<Customer>(CUSTOMERS_COLLECTION_NAME);
    const $regex = new RegExp(escapeRegex(search), "i");
    const queries = buildSearchQuery<Customer>(
      { $regex },
      field,
      `known${field[0].toUpperCase()}${field.substring(1)}s` as Leaves<Customer>,
    );

    const customer = await collection.findOne({
      $or: queries,
    });

    if (customer) {
      logger.debug(
        { search, field, customerId: customer._id },
        "Customer found by search field",
      );
    } else {
      logger.debug({ search, field }, "Customer not found by search field");
    }

    return customer;
  }

  public async createCustomer(
    customer: CustomerUpdateModel,
  ): Promise<Customer> {
    const logger = this.loggerFactory("createCustomer");
    logger.debug(
      {
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
      },
      "Creating new customer",
    );

    const id = new ObjectId().toString();
    const db = await getDbConnection();

    const collection = db.collection<Customer>(CUSTOMERS_COLLECTION_NAME);

    await collection.insertOne({
      ...customer,
      _id: id,
    });

    const createdCustomer: Customer = {
      ...customer,
      _id: id,
    };

    logger.debug(
      { customerId: id, name: customer.name },
      "Successfully created customer, executing hooks",
    );

    // Execute customer hooks
    await this.appsService.executeHooks<ICustomerHook>(
      "customer-hook",
      async (hook, service) => {
        await service.onCustomerCreated?.(hook, createdCustomer);
      },
      {
        ignoreErrors: true,
      },
    );

    return createdCustomer;
  }

  public async updateCustomer(
    id: string,
    update: CustomerUpdateModel,
  ): Promise<void> {
    const logger = this.loggerFactory("updateCustomer");
    logger.debug(
      {
        customerId: id,
        update: { name: update.name, email: update.email, phone: update.phone },
      },
      "Updating customer",
    );

    const db = await getDbConnection();

    const collection = db.collection<Customer>(CUSTOMERS_COLLECTION_NAME);

    const { _id: _, ...updateObj } = update as Customer; // Remove fields in case it slips here

    await collection.updateOne(
      {
        _id: id,
      },
      {
        $set: updateObj,
      },
    );

    // Get the updated customer for hooks
    const updatedCustomer = await collection.findOne({ _id: id });
    if (!updatedCustomer) {
      logger.warn({ customerId: id }, "Customer not found after update");
      return;
    }

    logger.debug(
      { customerId: id },
      "Successfully updated customer, executing hooks",
    );

    // Execute customer hooks
    await this.appsService.executeHooks<ICustomerHook>(
      "customer-hook",
      async (hook, service) => {
        await service.onCustomerUpdated?.(hook, updatedCustomer, update);
      },
      {
        ignoreErrors: true,
      },
    );
  }

  public async getOrUpsertCustomer({
    name,
    email,
    phone,
  }: {
    name: string;
    email: string;
    phone: string;
  }): Promise<Customer> {
    const logger = this.loggerFactory("getOrUpsertCustomer");

    logger.debug(
      { customerName: name, customerEmail: email },
      "Getting or creating/updating customer",
    );

    const existingCustomer = await this.findCustomer(
      email.trim(),
      phone.trim(),
    );

    if (existingCustomer) {
      logger.debug(
        {
          customerId: existingCustomer._id,
          customerName: existingCustomer.name,
        },
        "Found existing customer",
      );

      await this.updateCustomerIfNeeded(existingCustomer, {
        name,
        email,
        phone,
      });

      return existingCustomer;
    }

    logger.debug(
      { customerName: name, customerEmail: email },
      "Creating new customer",
    );

    const customer: CustomerUpdateModel = {
      email: email.trim(),
      name: name.trim(),
      phone: phone.trim(),
      knownEmails: [],
      knownNames: [],
      knownPhones: [],
      requireDeposit: "inherit",
    };

    const newCustomer = await this.createCustomer(customer);

    logger.debug(
      { customerId: newCustomer._id, customerName: newCustomer.name },
      "New customer created",
    );

    return newCustomer;
  }

  private async updateCustomerIfNeeded(
    customer: Customer,
    updatedFields: { name: string; email: string; phone: string },
  ): Promise<void> {
    const logger = this.loggerFactory("updateCustomerIfNeeded");

    logger.debug(
      { customerId: customer._id, customerName: customer.name, updatedFields },
      "Checking if customer update is needed",
    );

    let needsUpdate = false;
    const name = updatedFields.name.trim();
    if (customer.name !== name && !customer.knownNames.includes(name)) {
      customer.knownNames.push(name);
      needsUpdate = true;
    }

    const email = updatedFields.email.trim();
    if (customer.email !== email && !customer.knownEmails.includes(email)) {
      customer.knownEmails.push(email);
      needsUpdate = true;
    }

    const phone = updatedFields.phone.trim();
    if (customer.phone !== phone && !customer.knownPhones.includes(phone)) {
      customer.knownPhones.push(phone);
      needsUpdate = true;
    }

    if (needsUpdate) {
      logger.debug(
        { customerId: customer._id, updatedFields: { name, email, phone } },
        "Updating customer with new information",
      );
      await this.updateCustomer(customer._id, customer);
    } else {
      logger.debug({ customerId: customer._id }, "No customer update needed");
    }
  }

  public async deleteCustomer(id: string): Promise<Customer | null> {
    const logger = this.loggerFactory("deleteCustomer");
    logger.debug({ customerId: id }, "Deleting customer");

    const db = await getDbConnection();

    const collection = db.collection<Customer>(CUSTOMERS_COLLECTION_NAME);

    const customer = await collection.findOne({ _id: id });
    if (!customer) {
      logger.warn({ customerId: id }, "Customer not found for deletion");
      return null;
    }

    const appointmentsCollection = db.collection<Appointment>(
      APPOINTMENTS_COLLECTION_NAME,
    );
    const count = await appointmentsCollection.countDocuments({
      customerId: id,
    });

    if (count > 0) {
      logger.error(
        { customerId: id, appointmentCount: count },
        "Cannot delete customer with existing appointments",
      );
      throw new Error("Customer has existing appointments");
    }

    await collection.deleteOne({
      _id: id,
    });

    logger.debug(
      { customerId: id, name: customer.name },
      "Successfully deleted customer, executing hooks",
    );

    // Execute customer hooks
    await this.appsService.executeHooks<ICustomerHook>(
      "customer-hook",
      async (hook, service) => {
        await service.onCustomersDeleted?.(hook, [customer]);
      },
      {
        ignoreErrors: true,
      },
    );

    return customer;
  }

  public async deleteCustomers(ids: string[]): Promise<void> {
    const logger = this.loggerFactory("deleteCustomers");
    logger.debug({ customerIds: ids }, "Deleting multiple customers");

    const db = await getDbConnection();

    const collection = db.collection<Customer>(CUSTOMERS_COLLECTION_NAME);
    const appointmentsCollection = db.collection<Appointment>(
      APPOINTMENTS_COLLECTION_NAME,
    );

    const appointmentMap = (await appointmentsCollection
      .aggregate([
        {
          $match: {
            customerId: {
              $in: ids,
            },
          },
        },
        {
          $group: {
            _id: "$customerId",
            count: {
              $count: {},
            },
          },
        },
      ])
      .toArray()) as { _id: string; count: number }[];

    const nonEmptyCustomers = appointmentMap.filter(({ count }) => count > 0);
    if (nonEmptyCustomers.length > 0) {
      logger.error(
        {
          customerIds: nonEmptyCustomers.map(({ _id }) => _id),
          appointmentCounts: nonEmptyCustomers,
        },
        "Cannot delete customers with existing appointments",
      );
      throw new Error(
        `Some customers already have appointments: ${nonEmptyCustomers.map(({ _id }) => _id).join(", ")}`,
      );
    }

    // Get customers before deletion for hooks
    const customersToDelete = await collection
      .find({
        _id: { $in: ids },
      })
      .toArray();

    await collection.deleteMany({
      _id: {
        $in: ids,
      },
    });

    logger.debug(
      { customerIds: ids, count: ids.length },
      "Successfully deleted multiple customers, executing hooks",
    );

    // Execute customer hooks
    await this.appsService.executeHooks<ICustomerHook>(
      "customer-hook",
      async (hook, service) => {
        await service.onCustomersDeleted?.(hook, customersToDelete);
      },
      {
        ignoreErrors: true,
      },
    );
  }

  public async mergeCustomers(
    targetId: string,
    valueIds: string[],
  ): Promise<void> {
    const logger = this.loggerFactory("mergeCustomers");
    logger.debug({ targetId, valueIds }, "Merging customers");

    const db = await getDbConnection();
    const collection = db.collection<Customer>(CUSTOMERS_COLLECTION_NAME);

    const target = await collection.findOne({
      _id: targetId,
    });

    if (!target) {
      logger.error({ targetId }, "Target customer not found for merge");
      throw new Error(`Can't find target customer with id ${targetId}`);
    }

    if (!valueIds?.length) {
      logger.error({ targetId, valueIds }, "Value IDs list is empty for merge");
      throw new Error("IDs list should not be empty");
    }

    const ids = valueIds.filter((id) => id !== targetId);

    const customers = await collection
      .find({
        _id: {
          $in: ids,
        },
      })
      .toArray();

    if (customers.length !== ids.length) {
      logger.error(
        {
          targetId,
          valueIds,
          foundCount: customers.length,
          expectedCount: ids.length,
        },
        "Could not find all customers for merge",
      );
      throw new Error(`Could not find all customers for merge`);
    }

    const nameSet = new Set([target.name, ...target.knownNames]);
    const emailSet = new Set([target.email, ...target.knownEmails]);
    const phoneSet = new Set([target.phone, ...target.knownPhones]);

    const notes = new Set([target.note]);

    let avatar = target.avatar;
    let dateOfBirth = target.dateOfBirth;

    for (const customer of customers) {
      nameSet.add(customer.name);
      customer.knownNames.forEach((name) => nameSet.add(name));
      phoneSet.add(customer.phone);
      customer.knownPhones.forEach((phone) => phoneSet.add(phone));
      emailSet.add(customer.email);
      customer.knownEmails.forEach((email) => emailSet.add(email));

      notes.add(customer.note);
      if (!avatar && customer.avatar) avatar = customer.avatar;
      if (!dateOfBirth && customer.dateOfBirth)
        dateOfBirth = customer.dateOfBirth;
    }

    const [name, ...knownNames] = Array.from(nameSet);
    const [email, ...knownEmails] = Array.from(emailSet);
    const [phone, ...knownPhones] = Array.from(phoneSet);

    const note = Array.from(notes)
      .filter((n) => !!n)
      .join("\n\n-----\n\n");

    const update: Partial<CustomerUpdateModel> = {
      name,
      email,
      phone,
      knownEmails,
      knownNames,
      knownPhones,
      note,
      avatar,
      dateOfBirth,
    };

    await collection.updateOne(
      {
        _id: targetId,
      },
      {
        $set: update,
      },
    );

    const appointmentsCollection = db.collection<Appointment>(
      APPOINTMENTS_COLLECTION_NAME,
    );
    await appointmentsCollection.updateMany(
      {
        customerId: {
          $in: ids,
        },
      },
      {
        $set: {
          customerId: targetId,
        },
      },
    );

    await collection.deleteMany({
      _id: {
        $in: ids,
      },
    });

    logger.debug(
      { targetId, valueIds, mergedCount: ids.length },
      "Successfully merged customers",
    );
  }

  public async checkUniqueEmailAndPhone(
    emails: string[],
    phones: string[],
    id?: string,
  ): Promise<{ email: boolean; phone: boolean }> {
    const logger = this.loggerFactory("checkUniqueEmailAndPhone");
    logger.debug(
      { emails, phones, customerId: id },
      "Checking unique email and phone",
    );

    const db = await getDbConnection();
    const customers = db.collection<Customer>(CUSTOMERS_COLLECTION_NAME);

    const emailFilter: Filter<Customer> = {
      $or: [
        {
          email: { $in: emails },
        },

        {
          knownEmails: {
            $in: emails,
          },
        },
      ],
    };

    const phoneFilter: Filter<Customer> = {
      $or: [
        {
          phone: { $in: phones },
        },

        {
          knownPhones: {
            $in: phones,
          },
        },
      ],
    };

    if (id) {
      emailFilter._id = {
        $ne: id,
      };
      phoneFilter._id = {
        $ne: id,
      };
    }

    const [emailResult, phoneResult] = await Promise.all([
      customers.find(emailFilter).hasNext(),
      customers.find(phoneFilter).hasNext(),
    ]);

    const result = { email: !emailResult, phone: !phoneResult };
    logger.debug(
      { emails, phones, customerId: id, result },
      "Email and phone uniqueness check completed",
    );

    return result;
  }
}

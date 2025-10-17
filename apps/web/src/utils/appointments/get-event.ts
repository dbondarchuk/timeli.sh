import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import {
  AppointmentAddon,
  AppointmentDiscount,
  AppointmentEvent,
  AppointmentOption,
  AppointmentRequest,
  Customer,
} from "@vivid/types";
import { formatAmount, getDiscountAmount } from "@vivid/utils";

export const getAppointmentEventFromRequest = async (
  request: AppointmentRequest,
  ignoreFieldValidation?: boolean,
  files?: Record<string, any>,
): Promise<
  | {
      event: AppointmentEvent;
      customer: Customer | null;
      option: AppointmentOption;
      addons: AppointmentEvent["addons"];
    }
  | {
      error: {
        code: string;
        message: string;
        status: number;
      };
    }
> => {
  const logger = getLoggerFactory("AppointmentsUtils")("getEvent");

  logger.debug(
    {
      optionId: request.optionId,
      dateTime: request.dateTime,
      addonsCount: request.addonsIds?.length || 0,
      ignoreFieldValidation,
      hasFiles: !!files,
      fieldCount: Object.keys(request.fields).length,
    },
    "Processing appointment event from request",
  );

  const selectedOption = await ServicesContainer.ServicesService().getOption(
    request.optionId,
  );

  if (!selectedOption) {
    logger.warn({ optionId: request.optionId }, "Selected option not found");

    return {
      error: {
        code: "unknown_option",
        message: `Can't find option with id '${request.optionId}'`,
        status: 400,
      },
    };
  }

  logger.debug(
    {
      optionId: request.optionId,
      optionName: selectedOption.name,
      optionDuration: selectedOption.duration,
      optionPrice: selectedOption.price,
      optionIsOnline: selectedOption.isOnline,
    },
    "Retrieved selected option",
  );

  if (typeof selectedOption.duration === "undefined" && !request.duration) {
    logger.warn(
      { optionId: request.optionId, optionName: selectedOption.name },
      "Duration required but not provided",
    );

    return {
      error: {
        code: "duration_required",
        message: `Selected option requires the duration to be provided`,
        status: 400,
      },
    };
  }

  let selectedAddons: AppointmentAddon[] | undefined = undefined;
  if (request.addonsIds) {
    logger.debug(
      { addonsIds: request.addonsIds },
      "Retrieving selected addons",
    );

    selectedAddons = await ServicesContainer.ServicesService().getAddonsById(
      request.addonsIds,
    );

    if (selectedAddons.length !== request.addonsIds.length) {
      logger.warn(
        {
          requestedAddonsCount: request.addonsIds.length,
          foundAddonsCount: selectedAddons.length,
          addonsIds: request.addonsIds,
        },
        "Some selected addons not found",
      );

      return {
        error: {
          code: "unknown_addon",
          message: `Can't find one or more selected addons`,
          status: 400,
        },
      };
    }

    logger.debug(
      {
        addonsCount: selectedAddons.length,
        addonNames: selectedAddons.map((a) => a.name),
      },
      "Successfully retrieved all selected addons",
    );
  }

  const allFields: Map<string, boolean> = new Map();
  for (const field of [
    ...(selectedOption.fields || []),
    ...(selectedAddons?.flatMap((addon) => addon.fields ?? []) || []),
  ]) {
    if (!allFields.has(field.id)) {
      allFields.set(field.id, !!field.required);
    } else {
      allFields.set(field.id, !!field.required || !!allFields.get(field.id));
    }
  }

  const fieldsIds = Array.from(allFields.keys());

  logger.debug(
    {
      fieldsCount: fieldsIds.length,
      requiredFieldsCount: Array.from(allFields.values()).filter(Boolean)
        .length,
    },
    "Calculated required fields from option and addons",
  );

  const serviceFields =
    await ServicesContainer.ServicesService().getFieldsById(fieldsIds);

  if (!ignoreFieldValidation) {
    logger.debug(
      { fieldValidationEnabled: true },
      "Validating required fields",
    );

    for (const field of serviceFields) {
      if (
        (field.required || allFields.get(field._id)) &&
        !files?.[field.name] &&
        !request.fields[field.name]
      ) {
        logger.warn(
          {
            fieldName: field.name,
            fieldId: field._id,
            fieldRequired: field.required,
            hasFile: !!files?.[field.name],
            hasFieldValue: !!request.fields[field.name],
          },
          "Required field validation failed",
        );

        return {
          error: {
            code: "field_required",
            message: `Field ${field.name} is required`,
            status: 400,
          },
        };
      }
    }

    logger.debug(
      { validatedFieldsCount: serviceFields.length },
      "Field validation completed successfully",
    );
  } else {
    logger.debug({ fieldValidationEnabled: false }, "Field validation skipped");
  }

  const totalDuration =
    (selectedOption.duration ?? request.duration ?? 0) +
    (selectedAddons?.reduce((sum, cur) => sum + (cur.duration ?? 0), 0) ?? 0);

  let totalPrice: number | undefined =
    (selectedOption.price ?? 0) +
    (selectedAddons?.reduce((sum, cur) => sum + (cur.price ?? 0), 0) ?? 0);

  logger.debug(
    {
      optionDuration: selectedOption.duration,
      requestDuration: request.duration,
      addonsDuration:
        selectedAddons?.reduce((sum, cur) => sum + (cur.duration ?? 0), 0) ?? 0,
      totalDuration,
      optionPrice: selectedOption.price,
      addonsPrice:
        selectedAddons?.reduce((sum, cur) => sum + (cur.price ?? 0), 0) ?? 0,
      totalPrice,
    },
    "Calculated duration and price",
  );

  let appointmentDiscount: AppointmentDiscount | undefined = undefined;

  logger.debug(
    {
      customerEmail: request.fields.email,
      customerPhone: request.fields.phone?.replace(
        /(\d{3})\d{3}(\d{4})/,
        "$1***$2",
      ),
    },
    "Looking up customer",
  );

  const customer = await ServicesContainer.CustomersService().findCustomer(
    request.fields.email,
    request.fields.phone,
  );

  if (customer) {
    logger.debug(
      { customerId: customer._id, customerName: customer.name },
      "Found existing customer",
    );
  } else {
    logger.debug(
      { customerEmail: request.fields.email },
      "No existing customer found",
    );
  }

  if (request.promoCode) {
    logger.debug(
      {
        promoCode: request.promoCode,
        customerId: customer?._id,
        dateTime: request.dateTime,
      },
      "Applying promo code discount",
    );

    const discount = await ServicesContainer.ServicesService().applyDiscount({
      code: request.promoCode,
      dateTime: request.dateTime,
      optionId: request.optionId,
      addons: request.addonsIds,
      customerId: customer?._id,
    });

    if (!discount) {
      logger.warn({ promoCode: request.promoCode }, "Promo code not valid");

      return {
        error: {
          code: "promo_code_not_valid",
          message: `Promo code is not valid`,
          status: 400,
        },
      };
    }

    const discountAmount = getDiscountAmount(totalPrice, discount);
    appointmentDiscount = {
      code: request.promoCode,
      discountAmount,
      id: discount._id,
      name: discount.name,
    };

    totalPrice = Math.max(0, formatAmount(totalPrice - discountAmount));

    logger.debug(
      {
        promoCode: request.promoCode,
        discountName: discount.name,
        discountAmount,
        originalPrice: totalPrice + discountAmount,
        finalPrice: totalPrice,
      },
      "Successfully applied promo code discount",
    );
  }

  if (totalPrice === 0) totalPrice = undefined;

  const event: AppointmentEvent = {
    dateTime: request.dateTime,
    option: {
      _id: selectedOption._id,
      name: selectedOption.name,
      price: selectedOption.price,
      duration: selectedOption.duration,
      isOnline: selectedOption.isOnline,
    },
    timeZone: request.timeZone,
    totalDuration,
    totalPrice,
    addons: selectedAddons?.map((addon) => ({
      _id: addon._id,
      name: addon.name,
      price: addon.price,
      duration: addon.duration,
    })),
    fields: request.fields,
    discount: appointmentDiscount,
    fieldsLabels: serviceFields.reduce(
      (map, field) => ({ ...map, [field.name]: field.data.label }),
      {} as Record<string, string>,
    ),
  };

  logger.info(
    {
      optionId: request.optionId,
      optionName: selectedOption.name,
      totalDuration,
      totalPrice,
      addonsCount: selectedAddons?.length || 0,
      hasDiscount: !!appointmentDiscount,
      customerId: customer?._id,
    },
    "Successfully created appointment event from request",
  );

  return {
    event,
    customer,
    option: selectedOption,
    addons: selectedAddons,
  };
};

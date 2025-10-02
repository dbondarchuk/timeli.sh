"use server";

import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import {
  Appointment,
  AppointmentEvent,
  AppointmentStatus,
  okStatus,
} from "@vivid/types";

const loggerFactory = getLoggerFactory("AppointmentsActions");

export async function changeAppointmentStatus(
  id: string,
  newStatus: AppointmentStatus,
  requestedByCustomer?: boolean,
) {
  const actionLogger = loggerFactory("changeAppointmentStatus");

  actionLogger.debug(
    {
      appointmentId: id,
      newStatus,
    },
    "Changing appointment status",
  );

  try {
    await ServicesContainer.EventsService().changeAppointmentStatus(
      id,
      newStatus,
      requestedByCustomer ? "customer" : "user",
    );

    actionLogger.debug(
      {
        appointmentId: id,
        newStatus,
        requestedByCustomer,
      },
      "Appointment status changed successfully",
    );

    return okStatus;
  } catch (error) {
    actionLogger.error(
      {
        appointmentId: id,
        newStatus,
        requestedByCustomer,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to change appointment status",
    );
    throw error;
  }
}

export async function updateAppointmentNote(id: string, note?: string) {
  const actionLogger = loggerFactory("updateAppointmentNote");

  actionLogger.debug(
    {
      appointmentId: id,
      hasNote: !!note,
      noteLength: note?.length || 0,
    },
    "Updating appointment note",
  );

  try {
    await ServicesContainer.EventsService().updateAppointmentNote(id, note);

    actionLogger.debug(
      {
        appointmentId: id,
        hasNote: !!note,
      },
      "Appointment note updated successfully",
    );

    return okStatus;
  } catch (error) {
    actionLogger.error(
      {
        appointmentId: id,
        hasNote: !!note,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to update appointment note",
    );
    throw error;
  }
}

export async function addAppointmentFiles(formData: FormData) {
  const actionLogger = loggerFactory("addAppointmentFiles");

  const file = formData.get("file") as File;
  const id = formData.get("appointmentId") as string;

  if (!id || !file) {
    actionLogger.error(
      {
        appointmentId: id,
        hasFile: !!file,
      },
      "Appointment ID and file are required",
    );
    throw new Error("Appointment ID and file are required");
  }

  actionLogger.debug(
    {
      appointmentId: id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    },
    "Adding appointment files",
  );

  try {
    const result = await ServicesContainer.EventsService().addAppointmentFiles(
      id,
      [file],
    );

    actionLogger.debug(
      {
        appointmentId: id,
        fileName: file.name,
        fileSize: file.size,
      },
      "Appointment files added successfully",
    );

    return result;
  } catch (error) {
    actionLogger.error(
      {
        appointmentId: id,
        fileName: file.name,
        fileSize: file.size,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to add appointment files",
    );
    throw error;
  }
}

export async function removeAppointmentFile(assetId: string) {
  const actionLogger = loggerFactory("removeAppointmentFile");

  actionLogger.debug(
    {
      assetId,
    },
    "Removing appointment file",
  );

  try {
    await ServicesContainer.AssetsService().deleteAsset(assetId);

    actionLogger.debug(
      {
        assetId,
      },
      "Appointment file removed successfully",
    );

    return okStatus;
  } catch (error) {
    actionLogger.error(
      {
        assetId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to remove appointment file",
    );
    throw error;
  }
}

export async function rescheduleAppointment(
  id: string,
  dateTime: Date,
  duration: number,
  doNotNotifyCustomer?: boolean,
) {
  const actionLogger = loggerFactory("rescheduleAppointment");

  actionLogger.debug(
    {
      appointmentId: id,
      newDateTime: dateTime.toISOString(),
      newDuration: duration,
      doNotNotifyCustomer,
    },
    "Rescheduling appointment",
  );

  try {
    await ServicesContainer.EventsService().rescheduleAppointment(
      id,
      dateTime,
      duration,
      doNotNotifyCustomer,
    );

    actionLogger.debug(
      {
        appointmentId: id,
        newDateTime: dateTime.toISOString(),
        newDuration: duration,
        doNotNotifyCustomer,
      },
      "Appointment rescheduled successfully",
    );

    return okStatus;
  } catch (error) {
    actionLogger.error(
      {
        appointmentId: id,
        newDateTime: dateTime.toISOString(),
        newDuration: duration,
        doNotNotifyCustomer,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to reschedule appointment",
    );
    throw error;
  }
}

export const createAppointment = async (
  appointment: Omit<AppointmentEvent, "timeZone">,
  files: Record<string, File> | undefined,
  confirmed: boolean = false,
) => {
  const actionLogger = loggerFactory("createAppointment");

  actionLogger.debug(
    {
      optionId: appointment.option._id,
      dateTime: appointment.dateTime.toISOString(),
      duration: appointment.totalDuration,
      filesCount: files ? Object.keys(files).length : 0,
      confirmed,
      fieldsCount: Object.keys(appointment.fields).length,
    },
    "Creating new appointment",
  );

  try {
    const { timeZone } =
      await ServicesContainer.ConfigurationService().getConfiguration(
        "general",
      );

    const appointmentEvent: AppointmentEvent = {
      ...appointment,
      fields: Object.entries(appointment.fields)
        .filter(([key]) => !(key in (files || {})))
        .reduce(
          (map, [key, value]) => ({ ...map, [key]: value }),
          {} as Appointment["fields"],
        ),
      timeZone,
    };

    actionLogger.debug(
      {
        optionId: appointment.option._id,
        dateTime: appointment.dateTime.toISOString(),
        duration: appointment.totalDuration,
        timeZone,
        processedFieldsCount: Object.keys(appointmentEvent.fields).length,
      },
      "Appointment event prepared, creating event",
    );

    const result = await ServicesContainer.EventsService().createEvent({
      event: appointmentEvent,
      confirmed,
      force: true,
      files,
      by: "user",
    });

    actionLogger.debug(
      {
        appointmentId: result._id,
        optionId: appointment.option._id,
        dateTime: appointment.dateTime.toISOString(),
        duration: appointment.totalDuration,
        confirmed,
      },
      "Appointment created successfully",
    );

    return result._id;
  } catch (error) {
    actionLogger.error(
      {
        optionId: appointment.option._id,
        dateTime: appointment.dateTime.toISOString(),
        duration: appointment.totalDuration,
        confirmed,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to create appointment",
    );
    throw error;
  }
};

export const updateAppointment = async (
  id: string,
  appointment: Omit<AppointmentEvent, "timeZone">,
  files: Record<string, File> | undefined,
  confirmed: boolean = false,
  doNotNotifyCustomer: boolean = false,
) => {
  const actionLogger = loggerFactory("updateAppointment");

  actionLogger.debug(
    {
      appointmentId: id,
      optionId: appointment.option._id,
      dateTime: appointment.dateTime.toISOString(),
      duration: appointment.totalDuration,
      filesCount: files ? Object.keys(files).length : 0,
      confirmed,
      doNotNotifyCustomer,
      fieldsCount: Object.keys(appointment.fields).length,
    },
    "Updating appointment",
  );

  try {
    const { timeZone } =
      await ServicesContainer.ConfigurationService().getConfiguration(
        "general",
      );

    const appointmentEvent: AppointmentEvent = {
      ...appointment,
      fields: Object.entries(appointment.fields)
        .filter(([key]) => !(key in (files || {})))
        .reduce(
          (map, [key, value]) => ({ ...map, [key]: value }),
          {} as Appointment["fields"],
        ),
      timeZone,
    };

    actionLogger.debug(
      {
        appointmentId: id,
        optionId: appointment.option._id,
        dateTime: appointment.dateTime.toISOString(),
        duration: appointment.totalDuration,
        timeZone,
        processedFieldsCount: Object.keys(appointmentEvent.fields).length,
      },
      "Appointment event prepared, updating event",
    );

    const result = await ServicesContainer.EventsService().updateEvent(id, {
      event: appointmentEvent,
      confirmed,
      files,
      doNotNotifyCustomer,
    });

    actionLogger.debug(
      {
        appointmentId: id,
        optionId: appointment.option._id,
        dateTime: appointment.dateTime.toISOString(),
        duration: appointment.totalDuration,
        confirmed,
        doNotNotifyCustomer,
      },
      "Appointment updated successfully",
    );

    return id;
  } catch (error) {
    actionLogger.error(
      {
        appointmentId: id,
        optionId: appointment.option._id,
        dateTime: appointment.dateTime.toISOString(),
        duration: appointment.totalDuration,
        confirmed,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to update appointment",
    );
    throw error;
  }
};

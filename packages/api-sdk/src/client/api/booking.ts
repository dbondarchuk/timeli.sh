import { GetAppointmentOptionsResponse } from "@vivid/types";
import { fetchClientApi } from "./utils";

export const getBookingOptions = async () => {
  console.debug("Getting booking options");
  const response = await fetchClientApi("/booking/options", {
    method: "GET",
  });

  const data = await response.json<GetAppointmentOptionsResponse>();
  console.debug("Booking options retrieved successfully", {
    data,
  });

  return data;
};

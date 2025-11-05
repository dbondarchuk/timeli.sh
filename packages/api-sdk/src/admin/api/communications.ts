import { okStatus, SendCommunicationRequest } from "@timelish/types";
import { fetchAdminApi } from "./utils";

export const sendCustomerMessage = async (
  request: SendCommunicationRequest,
) => {
  console.debug("Sending customer message", {
    request,
  });

  const result = await fetchAdminApi("/communications", {
    method: "POST",
    body: JSON.stringify(request),
  });

  const data = await result.json<typeof okStatus>();
  return data;
};

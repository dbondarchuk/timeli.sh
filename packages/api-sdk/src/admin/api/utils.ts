import { fetchWithJson } from "@vivid/utils";

export const BASE_ADMIN_API_URL = "/admin/api";

export const fetchAdminApi = async (url: string, options?: RequestInit) => {
  const fullUrl = `${BASE_ADMIN_API_URL}${url.startsWith("/") ? url : `/${url}`}`;
  const result = await fetchWithJson(fullUrl, options);

  if (!result.ok) {
    throw new AdminApiError(
      `Failed to fetch ${fullUrl}`,
      result.status,
      result,
    );
  }

  return result;
};

export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response: Response,
  ) {
    super(message);
  }
}

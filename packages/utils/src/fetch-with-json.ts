import { DateTime } from "luxon";

type JsonParseOptions = {
  /**
   * Controls automatic ISO date parsing:
   * - false → leave as string
   * - true → convert to native Date
   * - "luxon" → convert to Luxon DateTime
   */
  parseDates?: boolean | "luxon";
  timeZone?: string;

  /**
   * Optional custom reviver (overrides or augments default behavior)
   */
  reviver?: (key: string, value: any) => any;
};

function parseJSON<T = any>(text: string, options?: JsonParseOptions): T {
  const isoDateRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

  const { parseDates = true, timeZone, reviver } = options || {};

  return JSON.parse(text, (key, value) => {
    // Allow user-defined reviver first
    if (reviver) {
      const custom = reviver(key, value);
      if (custom !== undefined) return custom;
    }

    if (typeof value === "string" && isoDateRegex.test(value) && !!parseDates) {
      let date = DateTime.fromISO(value);
      if (timeZone) {
        date = date.setZone(timeZone);
      }

      if (parseDates === "luxon") {
        return date;
      }

      return date.toJSDate();
    }

    return value;
  });
}

export async function fetchWithJson(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<
  Response & { json: <T = any>(options?: JsonParseOptions) => Promise<T> }
> {
  const response = await fetch(input, init);

  //   const enhancedResponse = Object.assign(response, {
  //     json: {
  //       value: async function <T = any>(options?: JsonParseOptions): Promise<T> {
  //         const text = await response.text();
  //         return parseJSON<T>(text, options);
  //       },
  //     },
  //   });
  //   return enhancedResponse;

  response.json = async <T = any>(options?: JsonParseOptions) => {
    const text = await response.text();
    return parseJSON<T>(text, options);
  };
  return response;
}

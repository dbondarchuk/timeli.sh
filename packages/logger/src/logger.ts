import pino from "pino";
import { cache } from "react";
import { getBaseLoggerFactory } from "./base-factory";

const _getLoggerFactory = cache(async (companyId?: string | null) => {
  try {
    // Try to import next/headers dynamically to avoid issues in client components
    const { headers } = await import("next/headers");
    const headersList = await headers();
    return getBaseLoggerFactory(
      headersList.get("x-correlation-id"),
      headersList.get("x-session-id"),
      companyId || headersList.get("x-company-id"),
    );
  } catch {
    // Fallback for client-side or when next/headers is not available
    return getBaseLoggerFactory();
  }
});

const promiseHandler: ProxyHandler<any> = {
  get: (target, prop) =>
    function () {
      if (target instanceof Promise) {
        let args = arguments;
        return target.then((o) => o[prop].apply(o, args));
      } else {
        let value = target[prop];
        return typeof value == "function" ? value.bind(target) : value;
      }
    },
};

export type LoggerFactory = (functionName?: string) => pino.Logger;

export const getLoggerFactory = cache(
  (moduleName: string, companyId?: string | null): LoggerFactory => {
    return (functionName?: string) => {
      const logger: pino.Logger = new Proxy(
        _getLoggerFactory(companyId).then((l) =>
          l.child(
            {},
            {
              msgPrefix: `[${moduleName}${functionName ? `:${functionName}` : ""}] `,
            },
          ),
        ),
        promiseHandler,
      );

      return logger;
    };
  },
);

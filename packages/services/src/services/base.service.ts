import { getLoggerFactory } from "@timelish/logger";
import { Filter } from "mongodb";
import pino from "pino";

/**
 * Base service that provides company isolation
 * All services should extend this to automatically filter by companyId
 */
export abstract class BaseService {
  protected readonly companyId: string;
  protected readonly loggerFactory: (functionName?: string) => pino.Logger;

  constructor(serviceName: string, companyId: string) {
    this.companyId = companyId;
    this.loggerFactory = getLoggerFactory(serviceName, this.companyId);
  }

  /**
   * Add companyId filter to any MongoDB filter
   * Ensures all queries are scoped to the company
   */
  protected withCompanyFilter<T>(filter: Filter<T>): Filter<T> {
    return {
      $and: [{ companyId: this.companyId }, filter],
    } as Filter<T>;
  }

  /**
   * Verify that a document belongs to the company
   * Throws an error if the document's companyId doesn't match
   */
  protected verifyCompanyOwnership(
    documentCompanyId: string | undefined,
  ): void {
    if (!documentCompanyId || documentCompanyId !== this.companyId) {
      throw new Error("Document does not belong to the company");
    }
  }

  /**
   * Get the current company ID
   */
  public getCompanyId(): string {
    return this.companyId;
  }
}

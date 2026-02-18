export class ConnectedAppRequestError extends Error {
  constructor(
    public readonly code: string,
    public readonly data?: Record<string, any>,
    public readonly status?: number,
    message?: string,
  ) {
    super(message || code);
  }
}

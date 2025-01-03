export class HttpError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public data?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

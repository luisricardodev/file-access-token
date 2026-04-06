class HttpError extends Error {
  constructor(statusCode, message, options = {}) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = options.code;
    this.details = options.details;
    this.expose = options.expose !== false;
  }
}

function createHttpError(statusCode, message, options) {
  return new HttpError(statusCode, message, options);
}

module.exports = {
  HttpError,
  createHttpError
};

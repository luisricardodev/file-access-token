const logger = require("../services/loggerService");
const { createHttpError } = require("../utils/errors");

function notFoundHandler(req, res, next) {
  next(createHttpError(404, "Pagina nao encontrada."));
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const safeMessage = statusCode >= 500 ? "Erro interno do servidor." : error.message;

  logger.error("request_error", safeMessage, {
    originalMessage: error.message,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    statusCode
  });

  res.status(statusCode);

  if (req.accepts("html")) {
    return res.render("error", {
      pageTitle: `${statusCode} | Erro`,
      statusCode,
      message: safeMessage,
      backHref: req.get("referer") || "/"
    });
  }

  return res.json({
    error: safeMessage
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};

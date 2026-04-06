const logger = require("../services/loggerService");
const storageService = require("../services/storageService");
const tokenService = require("../services/tokenService");

async function tokenAuthMiddleware(req, res, next) {
  const requestedToken = typeof req.params.token === "string" ? req.params.token.trim() : "";

  try {
    const tokenRecord = tokenService.assertTokenActive(
      await tokenService.findTokenRecord(requestedToken)
    );
    const allowedRoot = await storageService.resolveAllowedRoot(tokenRecord);

    req.accessContext = {
      tokenRecord,
      allowedRoot
    };

    await logger.info("access", "Token validado", {
      token: tokenRecord.token,
      clientName: tokenRecord.clientName,
      path: req.originalUrl,
      ip: req.ip
    });

    return next();
  } catch (error) {
    await logger.warn("access_denied", "Tentativa de acesso invalida", {
      token: requestedToken,
      path: req.originalUrl,
      ip: req.ip,
      message: error.message
    });

    return next(error);
  }
}

module.exports = tokenAuthMiddleware;

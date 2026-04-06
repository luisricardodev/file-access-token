const fs = require("fs/promises");
const config = require("../config/env");
const { createHttpError } = require("../utils/errors");
const { normalizeTokenPath } = require("../utils/pathUtils");

function normalizeTokenRecord(record) {
  const expiresAt = record.expiresAt ? new Date(record.expiresAt) : null;
  const isValidDate = expiresAt instanceof Date && !Number.isNaN(expiresAt.getTime());

  return {
    token: String(record.token || "").trim(),
    clientName: String(record.clientName || "Cliente").trim(),
    allowedPath: normalizeTokenPath(String(record.allowedPath || "")),
    expiresAt: isValidDate ? expiresAt : null,
    readOnly: record.readOnly !== false
  };
}

async function loadTokens() {
  let fileContent;

  try {
    fileContent = await fs.readFile(config.tokensFile, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      throw createHttpError(500, "Arquivo de tokens nao encontrado.");
    }

    throw error;
  }

  let parsedContent;

  try {
    parsedContent = JSON.parse(fileContent);
  } catch (error) {
    throw createHttpError(500, "Arquivo de tokens invalido.");
  }

  if (!Array.isArray(parsedContent)) {
    throw createHttpError(500, "Estrutura de tokens invalida.");
  }

  return parsedContent.map(normalizeTokenRecord);
}

async function findTokenRecord(tokenValue) {
  const lookupToken = String(tokenValue || "").trim();
  const tokens = await loadTokens();

  return tokens.find((tokenRecord) => tokenRecord.token === lookupToken) || null;
}

function assertTokenActive(tokenRecord) {
  if (!tokenRecord || !tokenRecord.token) {
    throw createHttpError(401, "Token invalido.", { code: "TOKEN_INVALID" });
  }

  if (tokenRecord.expiresAt && tokenRecord.expiresAt.getTime() < Date.now()) {
    throw createHttpError(401, "Token expirado.", { code: "TOKEN_EXPIRED" });
  }

  return tokenRecord;
}

module.exports = {
  assertTokenActive,
  findTokenRecord,
  loadTokens
};

const path = require("path");
const { createHttpError } = require("./errors");

function isSubPath(parentPath, candidatePath) {
  const relativePath = path.relative(parentPath, candidatePath);
  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  );
}

function resolveWithin(baseDirectory, requestedPath = ".") {
  if (typeof requestedPath !== "string") {
    throw createHttpError(400, "Caminho invalido.");
  }

  const sanitizedPath = requestedPath.replace(/\0/g, "").trim();

  if (sanitizedPath && path.isAbsolute(sanitizedPath)) {
    throw createHttpError(400, "Caminho absoluto nao permitido.");
  }

  const resolvedPath = path.resolve(baseDirectory, sanitizedPath || ".");

  if (!isSubPath(baseDirectory, resolvedPath)) {
    throw createHttpError(403, "Acesso negado para o caminho solicitado.");
  }

  return resolvedPath;
}

function normalizeRelativePath(baseDirectory, absolutePath) {
  const relativePath = path.relative(baseDirectory, absolutePath);

  if (!relativePath) {
    return "";
  }

  return relativePath.split(path.sep).join("/");
}

function normalizeTokenPath(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\\/g, "/").replace(/^\/+/, "").trim();
}

module.exports = {
  isSubPath,
  normalizeRelativePath,
  normalizeTokenPath,
  resolveWithin
};

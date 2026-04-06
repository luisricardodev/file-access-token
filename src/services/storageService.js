const fs = require("fs/promises");
const path = require("path");
const archiver = require("archiver");
const config = require("../config/env");
const { createHttpError } = require("../utils/errors");
const { isSubPath, normalizeRelativePath, resolveWithin } = require("../utils/pathUtils");

async function getStats(targetPath, method = "stat") {
  try {
    return await fs[method](targetPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function assertRealPathWithin(baseDirectory, candidatePath) {
  const [realBaseDirectory, realCandidatePath] = await Promise.all([
    fs.realpath(baseDirectory),
    fs.realpath(candidatePath)
  ]);

  if (!isSubPath(realBaseDirectory, realCandidatePath)) {
    throw createHttpError(403, "Acesso negado para o caminho solicitado.");
  }
}

async function resolveAllowedRoot(tokenRecord) {
  const allowedRoot = resolveWithin(config.storageRoot, tokenRecord.allowedPath || ".");
  const stats = await getStats(allowedRoot);

  if (!stats || !stats.isDirectory()) {
    throw createHttpError(403, "A pasta configurada para este token nao existe.");
  }

  await assertRealPathWithin(config.storageRoot, allowedRoot);

  return allowedRoot;
}

function isVisibleEntry(dirent) {
  return !dirent.name.startsWith(".") && !dirent.isSymbolicLink();
}

function sortByName(firstEntry, secondEntry) {
  return firstEntry.name.localeCompare(secondEntry.name, "pt-BR", {
    sensitivity: "base"
  });
}

function buildBreadcrumbs(currentRelativePath) {
  const breadcrumbs = [{ label: "Raiz", relativePath: "" }];

  if (!currentRelativePath) {
    return breadcrumbs;
  }

  let partialPath = "";

  for (const segment of currentRelativePath.split("/").filter(Boolean)) {
    partialPath = partialPath ? `${partialPath}/${segment}` : segment;
    breadcrumbs.push({
      label: segment,
      relativePath: partialPath
    });
  }

  return breadcrumbs;
}

async function getDirectorySizeWithin(baseDirectory, directoryPath) {
  await assertRealPathWithin(baseDirectory, directoryPath);

  const dirents = await fs.readdir(directoryPath, { withFileTypes: true });
  const visibleEntries = dirents.filter(isVisibleEntry);
  let totalSize = 0;

  for (const dirent of visibleEntries) {
    const absolutePath = path.join(directoryPath, dirent.name);
    const stats = await getStats(absolutePath, "lstat");

    if (!stats || stats.isSymbolicLink()) {
      continue;
    }

    await assertRealPathWithin(baseDirectory, absolutePath);

    if (stats.isDirectory()) {
      totalSize += await getDirectorySizeWithin(baseDirectory, absolutePath);
      continue;
    }

    if (stats.isFile()) {
      totalSize += stats.size;
    }
  }

  return totalSize;
}

async function listDirectory(accessContext, requestedPath = "") {
  const targetPath = resolveWithin(accessContext.allowedRoot, requestedPath || ".");
  const targetStats = await getStats(targetPath);

  if (!targetStats || !targetStats.isDirectory()) {
    throw createHttpError(404, "Pasta nao encontrada.");
  }

  await assertRealPathWithin(accessContext.allowedRoot, targetPath);

  const dirents = await fs.readdir(targetPath, { withFileTypes: true });
  const visibleEntries = dirents.filter(isVisibleEntry);

  const entries = await Promise.all(
    visibleEntries.map(async (dirent) => {
      const absolutePath = path.join(targetPath, dirent.name);
      const stats = await getStats(absolutePath);

      if (!stats) {
        return null;
      }

      await assertRealPathWithin(accessContext.allowedRoot, absolutePath);

      return {
        name: dirent.name,
        type: dirent.isDirectory() ? "directory" : "file",
        relativePath: normalizeRelativePath(accessContext.allowedRoot, absolutePath),
        size: dirent.isDirectory()
          ? await getDirectorySizeWithin(accessContext.allowedRoot, absolutePath)
          : stats.size,
        modifiedAt: stats.mtime
      };
    })
  );

  const currentRelativePath = normalizeRelativePath(accessContext.allowedRoot, targetPath);
  const filteredEntries = entries.filter(Boolean);
  const directories = filteredEntries.filter((entry) => entry.type === "directory").sort(sortByName);
  const files = filteredEntries.filter((entry) => entry.type === "file").sort(sortByName);
  const parentAbsolutePath = currentRelativePath ? path.dirname(targetPath) : accessContext.allowedRoot;

  return {
    currentRelativePath,
    breadcrumbs: buildBreadcrumbs(currentRelativePath),
    directories,
    files,
    hasParent: currentRelativePath !== "",
    parentPath: currentRelativePath
      ? normalizeRelativePath(accessContext.allowedRoot, parentAbsolutePath)
      : ""
  };
}

async function getFileDownload(accessContext, requestedFile) {
  const absolutePath = resolveWithin(accessContext.allowedRoot, requestedFile);
  const stats = await getStats(absolutePath);
  const fileStats = await getStats(absolutePath, "lstat");

  if (!stats || !stats.isFile() || !fileStats || fileStats.isSymbolicLink()) {
    throw createHttpError(404, "Arquivo nao encontrado.");
  }

  await assertRealPathWithin(accessContext.allowedRoot, absolutePath);

  return {
    absolutePath,
    downloadName: path.basename(absolutePath),
    relativePath: normalizeRelativePath(accessContext.allowedRoot, absolutePath),
    size: stats.size
  };
}

async function getDirectoryForZip(accessContext, requestedPath = "") {
  const absolutePath = resolveWithin(accessContext.allowedRoot, requestedPath || ".");
  const stats = await getStats(absolutePath);
  const fileStats = await getStats(absolutePath, "lstat");

  if (!stats || !stats.isDirectory() || !fileStats || fileStats.isSymbolicLink()) {
    throw createHttpError(404, "Pasta nao encontrada.");
  }

  await assertRealPathWithin(accessContext.allowedRoot, absolutePath);

  return {
    absolutePath,
    relativePath: normalizeRelativePath(accessContext.allowedRoot, absolutePath),
    folderName: path.basename(absolutePath) || "conteudo"
  };
}

function createZipArchive(directoryPath, folderName) {
  const archive = archiver("zip", {
    zlib: {
      level: 9
    }
  });

  archive.directory(directoryPath, folderName);

  return archive;
}

module.exports = {
  createZipArchive,
  getDirectoryForZip,
  getFileDownload,
  listDirectory,
  resolveAllowedRoot
};

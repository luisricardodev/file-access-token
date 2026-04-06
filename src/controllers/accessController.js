const config = require("../config/env");
const logger = require("../services/loggerService");
const storageService = require("../services/storageService");
const { createHttpError } = require("../utils/errors");
const { formatBytes, formatDate, sanitizeDownloadName } = require("../utils/formatters");
const { getFileVisualType, getMediaPreviewType } = require("../utils/media");

function buildAccessBasePath(token) {
  return `/acesso/${encodeURIComponent(token)}`;
}

function buildListingUrl(basePath, relativePath) {
  return relativePath
    ? `${basePath}/listar?path=${encodeURIComponent(relativePath)}`
    : `${basePath}`;
}

function buildHomeModel() {
  return {
    pageTitle: config.appName,
    appName: config.appName
  };
}

function showHome(req, res) {
  const token = typeof req.query.token === "string" ? req.query.token.trim() : "";

  if (token) {
    return res.redirect(buildAccessBasePath(token));
  }

  return res.render("home", buildHomeModel());
}

async function showBrowser(req, res, next) {
  try {
    const requestedPath = typeof req.query.path === "string" ? req.query.path : "";
    const listing = await storageService.listDirectory(req.accessContext, requestedPath);
    const accessBasePath = buildAccessBasePath(req.accessContext.tokenRecord.token);

    return res.render("browser", {
      pageTitle: `${req.accessContext.tokenRecord.clientName} | ${config.appName}`,
      appName: config.appName,
      clientName: req.accessContext.tokenRecord.clientName,
      readOnly: req.accessContext.tokenRecord.readOnly,
      accessBasePath,
      currentRelativePath: listing.currentRelativePath,
      breadcrumbs: listing.breadcrumbs.map((breadcrumb) => ({
        ...breadcrumb,
        href: buildListingUrl(accessBasePath, breadcrumb.relativePath)
      })),
      directories: listing.directories.map((directory) => ({
        ...directory,
        sizeLabel: formatBytes(directory.size),
        href: buildListingUrl(accessBasePath, directory.relativePath),
        zipHref: config.zipEnabled
          ? `${accessBasePath}/zip?path=${encodeURIComponent(directory.relativePath)}`
          : null
      })),
      files: listing.files.map((fileEntry) => {
        const previewType = getMediaPreviewType(fileEntry.name);

        return {
          ...fileEntry,
          fileVisual: getFileVisualType(fileEntry.name),
          previewType,
          sizeLabel: formatBytes(fileEntry.size),
          modifiedLabel: formatDate(fileEntry.modifiedAt),
          downloadHref: `${accessBasePath}/download?file=${encodeURIComponent(fileEntry.relativePath)}`,
          previewHref: previewType
            ? `${accessBasePath}/preview?file=${encodeURIComponent(fileEntry.relativePath)}`
            : null
        };
      }),
      parentHref: listing.hasParent ? buildListingUrl(accessBasePath, listing.parentPath) : null,
      currentZipHref: config.zipEnabled
        ? `${accessBasePath}/zip?path=${encodeURIComponent(listing.currentRelativePath)}`
        : null
    });
  } catch (error) {
    return next(error);
  }
}

async function previewFile(req, res, next) {
  try {
    const requestedFile = typeof req.query.file === "string" ? req.query.file : "";
    const filePreview = await storageService.getFileDownload(req.accessContext, requestedFile);
    const previewType = getMediaPreviewType(filePreview.downloadName);

    if (!previewType) {
      throw createHttpError(415, "Previa indisponivel para este tipo de arquivo.");
    }

    logger.info("preview", "Arquivo enviado para previa inline", {
      token: req.accessContext.tokenRecord.token,
      clientName: req.accessContext.tokenRecord.clientName,
      relativePath: filePreview.relativePath,
      type: previewType,
      ip: req.ip
    });

    res.type(filePreview.downloadName);
    res.set("Content-Disposition", "inline");
    res.set("Cache-Control", "private, max-age=300");

    return res.sendFile(filePreview.absolutePath, (error) => {
      if (!error) {
        return;
      }

      const isAbortedConnection =
        error.code === "ECONNABORTED" ||
        error.code === "ECONNRESET" ||
        error.message === "Request aborted";

      if (isAbortedConnection) {
        return;
      }

      if (!res.headersSent) {
        next(error);
        return;
      }

      res.destroy(error);
    });
  } catch (error) {
    return next(error);
  }
}

async function downloadFile(req, res, next) {
  try {
    const requestedFile = typeof req.query.file === "string" ? req.query.file : "";
    const fileDownload = await storageService.getFileDownload(req.accessContext, requestedFile);

    logger.info("download", "Arquivo enviado", {
      token: req.accessContext.tokenRecord.token,
      clientName: req.accessContext.tokenRecord.clientName,
      relativePath: fileDownload.relativePath,
      size: fileDownload.size,
      ip: req.ip
    });

    return res.download(fileDownload.absolutePath, fileDownload.downloadName);
  } catch (error) {
    return next(error);
  }
}

async function downloadZip(req, res, next) {
  if (!config.zipEnabled) {
    return next(createHttpError(404, "Download em ZIP desabilitado."));
  }

  try {
    const requestedPath = typeof req.query.path === "string" ? req.query.path : "";
    const directory = await storageService.getDirectoryForZip(req.accessContext, requestedPath);
    const folderSlug = sanitizeDownloadName(directory.relativePath || directory.folderName || "raiz");
    const clientSlug = sanitizeDownloadName(req.accessContext.tokenRecord.clientName);
    const zipFileName = `${clientSlug}-${folderSlug}.zip`;
    const archive = storageService.createZipArchive(directory.absolutePath, directory.folderName);

    logger.info("download", "Pasta compactada em ZIP", {
      token: req.accessContext.tokenRecord.token,
      clientName: req.accessContext.tokenRecord.clientName,
      relativePath: directory.relativePath || "",
      ip: req.ip
    });

    archive.on("error", (error) => {
      if (!res.headersSent) {
        next(error);
        return;
      }

      res.destroy(error);
    });

    res.type("application/zip");
    res.attachment(zipFileName);
    archive.pipe(res);
    archive.finalize();

    return undefined;
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  downloadFile,
  downloadZip,
  previewFile,
  showBrowser,
  showHome
};

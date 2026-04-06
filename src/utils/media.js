const path = require("path");

const IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".bmp",
  ".gif",
  ".jpeg",
  ".jpg",
  ".jfif",
  ".png",
  ".svg",
  ".webp"
]);

const VIDEO_EXTENSIONS = new Set([
  ".m4v",
  ".mov",
  ".mp4",
  ".ogv",
  ".webm"
]);

const FILE_VISUAL_GROUPS = [
  {
    category: "pdf",
    extensions: [".pdf"]
  },
  {
    category: "word",
    extensions: [".doc", ".docx", ".odt", ".rtf"]
  },
  {
    category: "sheet",
    extensions: [".csv", ".ods", ".xls", ".xlsx"]
  },
  {
    category: "slide",
    extensions: [".odp", ".ppt", ".pptx"]
  },
  {
    category: "archive",
    extensions: [".7z", ".bz2", ".gz", ".rar", ".tar", ".zip"]
  },
  {
    category: "executable",
    extensions: [".app", ".bat", ".cmd", ".com", ".exe", ".msi", ".scr"]
  },
  {
    category: "config",
    extensions: [".cfg", ".conf", ".env", ".ini", ".json", ".toml", ".xml", ".yaml", ".yml"]
  },
  {
    category: "code",
    extensions: [".css", ".html", ".js", ".php", ".ps1", ".py", ".sh", ".sql", ".ts"]
  },
  {
    category: "text",
    extensions: [".log", ".md", ".txt"]
  },
  {
    category: "audio",
    extensions: [".aac", ".flac", ".m4a", ".mp3", ".ogg", ".wav"]
  }
];

function getMediaPreviewType(fileName) {
  const extension = path.extname(String(fileName || "")).toLowerCase();

  if (IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }

  if (VIDEO_EXTENSIONS.has(extension)) {
    return "video";
  }

  return null;
}

function getFileVisualType(fileName) {
  const extension = path.extname(String(fileName || "")).toLowerCase();
  const normalizedExtension = extension ? extension.slice(1).toUpperCase() : "ARQ";
  const badge = normalizedExtension.slice(0, 4);
  const visualGroup = FILE_VISUAL_GROUPS.find((group) => group.extensions.includes(extension));

  return {
    badge,
    category: visualGroup?.category || "generic",
    extension: normalizedExtension
  };
}

module.exports = {
  getFileVisualType,
  getMediaPreviewType
};

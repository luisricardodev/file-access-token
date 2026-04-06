function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "-";
  }

  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;
  const roundedValue = value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1);

  return `${roundedValue} ${units[unitIndex]}`;
}

function formatDate(dateValue) {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(dateValue);
}

function sanitizeDownloadName(value) {
  return String(value || "arquivo")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "arquivo";
}

module.exports = {
  formatBytes,
  formatDate,
  sanitizeDownloadName
};

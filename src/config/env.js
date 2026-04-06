const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

function resolveFromRoot(value, fallbackValue) {
  const selectedValue = typeof value === "string" && value.trim() ? value.trim() : fallbackValue;
  return path.resolve(process.cwd(), selectedValue);
}

function parsePort(value) {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isInteger(parsedValue) && parsedValue > 0) {
    return parsedValue;
  }

  return 3000;
}

module.exports = {
  appName: process.env.APP_NAME?.trim() || "Portal de Arquivos",
  port: parsePort(process.env.PORT),
  storageRoot: resolveFromRoot(process.env.STORAGE_ROOT, "./samples/storage"),
  tokensFile: resolveFromRoot(process.env.TOKENS_FILE, "./data/tokens.json"),
  logDir: resolveFromRoot(process.env.LOG_DIR, "./logs"),
  zipEnabled: process.env.ENABLE_ZIP !== "false"
};

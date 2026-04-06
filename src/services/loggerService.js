const fs = require("fs/promises");
const path = require("path");
const config = require("../config/env");

async function ensureLogDirectory() {
  await fs.mkdir(config.logDir, { recursive: true });
}

function formatMeta(meta = {}) {
  const keys = Object.keys(meta);

  if (!keys.length) {
    return "";
  }

  try {
    return ` ${JSON.stringify(meta)}`;
  } catch (error) {
    return "";
  }
}

async function write(level, eventName, message, meta = {}) {
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${eventName} ${message}${formatMeta(meta)}\n`;

  try {
    await ensureLogDirectory();
    await fs.appendFile(path.join(config.logDir, "server.log"), line, "utf8");
  } catch (error) {
    const output = `Falha ao gravar log: ${error.message}`;
    console.error(output);
  }

  if (level === "error") {
    console.error(line.trim());
    return;
  }

  console.log(line.trim());
}

function info(eventName, message, meta) {
  return write("info", eventName, message, meta);
}

function warn(eventName, message, meta) {
  return write("warn", eventName, message, meta);
}

function error(eventName, message, meta) {
  return write("error", eventName, message, meta);
}

module.exports = {
  error,
  info,
  warn
};

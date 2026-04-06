const fs = require("fs/promises");
const app = require("./app");
const config = require("./config/env");
const logger = require("./services/loggerService");

async function assertDirectoryExists(targetPath, label) {
  let stats;

  try {
    stats = await fs.stat(targetPath);
  } catch (error) {
    throw new Error(`${label} nao encontrado em ${targetPath}`);
  }

  if (!stats.isDirectory()) {
    throw new Error(`${label} precisa ser uma pasta: ${targetPath}`);
  }
}

async function assertFileExists(targetPath, label) {
  let stats;

  try {
    stats = await fs.stat(targetPath);
  } catch (error) {
    throw new Error(`${label} nao encontrado em ${targetPath}`);
  }

  if (!stats.isFile()) {
    throw new Error(`${label} precisa ser um arquivo: ${targetPath}`);
  }
}

async function bootstrap() {
  await fs.mkdir(config.logDir, { recursive: true });
  await assertDirectoryExists(config.storageRoot, "STORAGE_ROOT");
  await assertFileExists(config.tokensFile, "TOKENS_FILE");

  app.listen(config.port, async () => {
    await logger.info("startup", "Servidor iniciado", {
      port: config.port,
      storageRoot: config.storageRoot
    });
  });
}

bootstrap().catch(async (error) => {
  await logger.error("startup", "Falha ao iniciar a aplicacao", {
    message: error.message
  });

  process.exit(1);
});

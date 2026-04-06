const express = require("express");
const accessController = require("../controllers/accessController");
const tokenAuthMiddleware = require("../middlewares/tokenAuthMiddleware");

const router = express.Router();

router.get("/acesso/:token", tokenAuthMiddleware, accessController.showBrowser);
router.get("/acesso/:token/listar", tokenAuthMiddleware, accessController.showBrowser);
router.get("/acesso/:token/preview", tokenAuthMiddleware, accessController.previewFile);
router.get("/acesso/:token/download", tokenAuthMiddleware, accessController.downloadFile);
router.get("/acesso/:token/zip", tokenAuthMiddleware, accessController.downloadZip);

module.exports = router;

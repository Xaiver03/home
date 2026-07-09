const express = require('express');
const router = express.Router();
const musicController = require('../controller/musicController');
const { checkPermissions } = require('../middlewares/auth');

// 所有接口需要管理员权限
router.get('/qrcode', checkPermissions(), musicController.getQrCode);
router.get('/qrcode/poll', checkPermissions(), musicController.pollQrCode);
router.get('/cookie/status', checkPermissions(), musicController.getCookieStatus);
router.post('/cookie/refresh', checkPermissions(), musicController.refreshCookie);
router.post('/cookie/import', checkPermissions(), musicController.importCookie);
router.delete('/cookie', checkPermissions(), musicController.deleteCookie);

module.exports = router;

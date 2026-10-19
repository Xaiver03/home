const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
var { checkPermissions } = require("../middlewares/auth");

router.get(
  "/getAllAdmin/:currentPage/:pageSize",
  checkPermissions(),
  adminController.getAllAdmin
);
router.post(
  "/searchAdmin",
  checkPermissions(),
  adminController.searchAdmin
);
router.post("/addAdmin", checkPermissions(), adminController.createAdmin);
router.post("/updateAdmin", checkPermissions(), adminController.updateAdmin);
router.delete(
  "/deleteAdminById",
  checkPermissions(),
  adminController.deleteAdminById
);
// 旧邮箱码/密码只能通过 /api/auth/claim 完成双证明认领，不能再创建管理员会话。

module.exports = router;

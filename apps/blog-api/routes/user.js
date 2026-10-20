var express = require("express");
var router = express.Router();
const userController = require("../controller/userController");
var { checkPermissions } = require("../middlewares/auth");
var { limitCustomerFileUpload } = require("../middlewares/rateLimit");

router.get(
  "/getAllUser/:currentPage/:pageSize",
  checkPermissions(),
  userController.getAllUser
);
router.get("/getUserDataByToken", userController.getUserDataByToken);
router.get(
  "/getAllUserIdAndName",
  checkPermissions(),
  userController.getAllUserIdAndName
);
router.post(
  "/uploadUserAvatar",
  limitCustomerFileUpload(5, undefined, "customer_upload_image", {
    message: "触发限制啦⛔️",
    description: "上传文件过于频繁，触发防脚本🤖，请稍后重试",
  }),
  userController.uploadUserAvatar
);
router.post("/createUser", checkPermissions(), userController.createUser);
router.post("/searchUser", checkPermissions(), userController.searchUser);
router.post("/updateUser", userController.updateUser);
router.delete("/deleteUser", checkPermissions(), userController.deleteUserById);
// 旧邮箱码只能通过 /api/auth/claim 完成双证明认领，不能再创建用户会话。

module.exports = router;

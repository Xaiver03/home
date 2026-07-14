const express = require("express");
const router = express.Router();
const storageController = require("../controller/storageController");
var { checkPermissions } = require("../middlewares/auth");
var { limitCustomerFileUpload } = require("../middlewares/rateLimit");

// 后台
router.get("/getFileInPath", checkPermissions(), storageController.getFileInPath);
router.post("/uploadImage", checkPermissions(), storageController.uploadImage);
router.post(
  "/uploadImageQueryIn",
  checkPermissions(),
  storageController.uploadImageQueryIn
);
router.delete("/deleteImage", checkPermissions(), storageController.deleteImage);

// 客户端
router.post(
  "/customer/uploadImage",
  limitCustomerFileUpload(5, undefined, "customer_upload_image", {
    message: "触发限制啦⛔️",
    description: "上传文件过于频繁，触发防脚本🤖，请稍后重试"
  }),
  storageController.customerUploadImage
);
router.delete(
  "/customer/deleteImage",
  storageController.customerDeleteImage
);

module.exports = router; // 导出路由器
